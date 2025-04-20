use std::collections::HashMap;

use anyhow::{Error, Result};
use candle_core::{DType, Device, Tensor};
use candle_nn::var_builder::VarBuilder;
use candle_transformers::models::bert::{BertModel, Config, DTYPE};
use hf_hub::{Repo, RepoType, api::sync::Api};
use tokenizers::Tokenizer;

pub struct Model {
    pub model: BertModel,
    pub tokenizer: Tokenizer,
    pub device: Device,
    pub config: Config,
}

impl Model {
    pub fn new(model_id: &str, revision: &str) -> Result<Self> {
        let device = candle_core::Device::cuda_if_available(0)?;

        // Use a sentence-transformer model that's known to work well for this task

        let repo = Repo::with_revision(model_id.to_string(), RepoType::Model, revision.to_string());
        let (config_filename, tokenizer_filename, weights_filename) = {
            let api = Api::new()?;
            let api = api.repo(repo);
            let config = api.get("config.json")?;
            let tokenizer = api.get("tokenizer.json")?;
            let weights = api.get("model.safetensors")?;

            (config, tokenizer, weights)
        };

        let config = std::fs::read_to_string(config_filename)?;
        let config: Config = serde_json::from_str(&config)?;

        let tokenizer = tokenizers::Tokenizer::from_file(tokenizer_filename).map_err(Error::msg)?;

        let vb =
            unsafe { VarBuilder::from_mmaped_safetensors(&[weights_filename], DTYPE, &device)? };

        let model = BertModel::load(vb, &config)?;
        println!("Model loaded successfully!");

        Ok(Self {
            model,
            tokenizer,
            device,
            config,
        })
    }

    pub fn estimate_flops(&self, text: &str) -> Result<u64> {
        // Tokenize input to get sequence length
        let encoding = self.tokenizer.encode(text, true).map_err(Error::msg)?;
        let seq_len = encoding.get_ids().len();

        // Get model config values
        let config = &self.config;
        let num_layers = config.num_hidden_layers as u64;
        let hidden_size = config.hidden_size as u64;
        let vocab_size = config.vocab_size as u64;

        // FLOPs estimation (simplified)
        let flops = 2
            * num_layers
            * seq_len as u64
            * (hidden_size * hidden_size + hidden_size * vocab_size);

        println!("Estimated FLOPs for input ({} tokens): {}", seq_len, flops);
        Ok(flops)
    }

    // Get mean pooled embeddings for text
    pub fn embed_text(&mut self, text: &str) -> Result<Vec<f32>> {
        let tokenizer = self
            .tokenizer
            .with_padding(None)
            .with_truncation(None)
            .map_err(Error::msg)?;

        let encoding = tokenizer.encode(text, true).map_err(Error::msg)?;
        let tokens = encoding.get_ids().to_vec();
        let attention_mask = encoding.get_attention_mask().to_vec();

        let token_ids = Tensor::new(&tokens[..], &self.device)?.unsqueeze(0)?;
        let token_type_ids = token_ids.zeros_like()?;
        let attention_mask = Tensor::new(&attention_mask[..], &self.device)?.unsqueeze(0)?;

        // Forward pass through BERT
        let outputs = self
            .model
            .forward(&token_ids, &token_type_ids, Some(&attention_mask))?;

        // Use the last hidden state and apply mean pooling
        let last_hidden_state = outputs;

        // Sum the tokens
        let attention_mask_f32 = attention_mask
            .to_dtype(DType::F32)? // [1, seq]  (f32)
            .unsqueeze(2)?;
        let sum_embeddings = last_hidden_state.broadcast_mul(&attention_mask_f32)?;

        let sum_vectors = sum_embeddings.sum(1)?;

        // Sum over all tokens
        let sum_mask = attention_mask.sum(1)?.unsqueeze(1)?;

        let sum_mask = sum_mask.to_dtype(DType::F32)?;

        let mean_embeddings = sum_vectors.broadcast_div(&sum_mask)?;

        // Average over the non-masked tokens
        let mean_embedding = mean_embeddings.get(0)?;
        let vec_len = mean_embedding.dims()[0];
        let mean_embedding_vec = mean_embedding.reshape((vec_len,))?.to_vec1()?;

        // Convert to 1D vector
        Ok(mean_embedding_vec)
    }

    // Generate a summary using an extractive approach
    pub fn summarize(&mut self, text: &str, ratio: f32) -> Result<(String, HashMap<String, f32>)> {
        // Better sentence splitting
        let sentences = split_into_sentences(text);

        println!("Found {} sentences", sentences.len());

        if sentences.len() <= 1 {
            return Ok((text.to_string(), HashMap::new()));
        }

        // For very short texts, just return the original
        if sentences.len() <= 3 {
            return Ok((text.to_string(), HashMap::new()));
        }

        // Get embeddings for each sentence
        let mut sentence_embeddings = Vec::new();
        for (i, sentence) in sentences.iter().enumerate() {
            if i % 5 == 0 {
                println!("Processing sentence {}/{}", i + 1, sentences.len());
            }

            // Skip very short sentences
            if sentence.split_whitespace().count() < 3 {
                // Use a zero vector as placeholder
                sentence_embeddings.push(vec![0.0; 384]);
                continue;
            }

            let embedding = self.embed_text(sentence)?;
            sentence_embeddings.push(embedding);
        }

        // Verify we have embeddings
        if sentence_embeddings.is_empty() {
            return Ok((text.to_string(), HashMap::new()));
        }

        println!("Calculating sentence similarities...");

        // Build similarity matrix between sentences
        let mut similarities = vec![vec![0.0; sentences.len()]; sentences.len()];
        for i in 0..sentences.len() {
            for j in 0..sentences.len() {
                if i == j {
                    similarities[i][j] = 1.0;
                } else {
                    // Check if either sentence was skipped (very short)
                    if sentence_embeddings[i].iter().all(|&x| x == 0.0)
                        || sentence_embeddings[j].iter().all(|&x| x == 0.0)
                    {
                        similarities[i][j] = 0.0;
                    } else {
                        let similarity =
                            cosine_similarity(&sentence_embeddings[i], &sentence_embeddings[j])?;
                        similarities[i][j] = similarity;
                    }
                }
            }
        }

        // Implement TextRank algorithm more accurately
        let damping = 0.85;
        let epsilon = 0.0001;
        let max_iterations = 50;

        // Initialize scores
        let n = sentences.len();
        let mut scores = vec![1.0 / n as f32; n];
        let mut prev_scores = vec![0.0; n];

        // PageRank/TextRank iteration
        for iteration in 0..max_iterations {
            std::mem::swap(&mut scores, &mut prev_scores);

            for i in 0..n {
                let mut score_sum = 0.0;

                for j in 0..n {
                    if i == j || similarities[j][i] == 0.0 {
                        continue;
                    }

                    // Calculate outgoing weights sum for node j
                    let mut out_sum = 0.0;
                    for k in 0..n {
                        if j != k {
                            out_sum += similarities[j][k];
                        }
                    }

                    // Avoid division by zero
                    if out_sum > 0.0 {
                        score_sum += similarities[j][i] / out_sum * prev_scores[j];
                    }
                }

                scores[i] = (1.0 - damping) / n as f32 + damping * score_sum;
            }

            // Check for convergence
            let mut diff = 0.0;
            for i in 0..n {
                diff += (scores[i] - prev_scores[i]).abs();
            }

            if diff < epsilon {
                println!("TextRank converged after {} iterations", iteration + 1);
                break;
            }
        }

        // Determine how many sentences to include in the summary
        let summary_size = (sentences.len() as f32 * ratio).round() as usize;
        let summary_size = summary_size.max(1).min(sentences.len());

        println!("Selecting top {} sentences for summary...", summary_size);

        // Create (index, score) pairs and sort by score (descending)
        let mut idx_score: Vec<(usize, f32)> = scores
            .iter()
            .enumerate()
            .map(|(idx, &score)| (idx, score))
            .collect();
        idx_score.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        // Debug: Print top sentence scores
        println!("Top sentence scores:");
        for (i, (idx, score)) in idx_score.iter().take(5).enumerate() {
            println!("  {}. Score: {:.4} - '{}'", i + 1, score, sentences[*idx]);
        }

        let mut scores: HashMap<String, f32> = HashMap::new();
        idx_score.iter().for_each(|(idx, score)| {
            scores.insert(sentences[*idx].clone(), *score);
        });

        // Get indices of top sentences
        let mut top_indices: Vec<usize> = idx_score
            .iter()
            .take(summary_size)
            .map(|(idx, _)| *idx)
            .collect();

        // If no sentences were selected, just return the first sentence
        if top_indices.is_empty() {
            return Ok((sentences[0].clone(), HashMap::new()));
        }

        // Sort indices by original position to maintain original order
        top_indices.sort();

        // Construct summary by joining selected sentences
        let summary = top_indices
            .iter()
            .map(|&idx| sentences[idx].as_str())
            .collect::<Vec<&str>>()
            .join(" ");

        Ok((summary, scores))
    }
}

// Better sentence splitting function
fn split_into_sentences(text: &str) -> Vec<String> {
    // Common abbreviations that shouldn't be treated as sentence endings
    let abbreviations = [
        "Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "St.", "e.g.", "i.e.", "etc.", "vs.", "Ph.D.",
        "M.D.", "U.S.", "U.K.", "E.U.", "a.m.", "p.m.",
    ];

    let mut sentences = Vec::new();
    let mut current_sentence = String::new();
    let mut in_quotes = false;

    // First, replace common abbreviations with special markers
    let mut processed_text = text.to_string();
    for abbr in &abbreviations {
        processed_text = processed_text.replace(abbr, &abbr.replace(".", "##DOT##"));
    }

    // Split text into sentences
    for c in processed_text.chars() {
        current_sentence.push(c);

        // Toggle quote state
        if c == '"' {
            in_quotes = !in_quotes;
        }

        // End of sentence - but not within quotes
        if !in_quotes && (c == '.' || c == '!' || c == '?') {
            // Look ahead to avoid splitting on ellipsis
            let trimmed = current_sentence.trim();

            // Check if we have a valid sentence end
            let is_end = !trimmed.ends_with("...")
                && !trimmed.ends_with("..")
                && !trimmed.ends_with("##DOT##");

            if is_end && !current_sentence.trim().is_empty() {
                // Clean up the sentence by restoring abbreviation periods
                let clean_sentence = current_sentence.replace("##DOT##", ".");
                sentences.push(clean_sentence.trim().to_string());
                current_sentence = String::new();
            }
        }
    }

    // Add the last sentence if it's not empty
    if !current_sentence.trim().is_empty() {
        let clean_sentence = current_sentence.replace("##DOT##", ".");
        sentences.push(clean_sentence.trim().to_string());
    }

    // Final check: filter out sentences that are too short
    sentences
        .into_iter()
        .filter(|s| s.split_whitespace().count() >= 2)
        .collect()
}

// Helper function to calculate cosine similarity between embeddings
fn cosine_similarity(a: &[f32], b: &[f32]) -> Result<f32> {
    if a.len() != b.len() {
        return Err(Error::msg("Embeddings have different dimensions"));
    }

    let mut dot_product = 0.0;
    let mut norm_a = 0.0;
    let mut norm_b = 0.0;

    for i in 0..a.len() {
        dot_product += a[i] * b[i];
        norm_a += a[i] * a[i];
        norm_b += b[i] * b[i];
    }

    norm_a = norm_a.sqrt();
    norm_b = norm_b.sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        return Ok(0.0);
    }

    Ok(dot_product / (norm_a * norm_b))
}
