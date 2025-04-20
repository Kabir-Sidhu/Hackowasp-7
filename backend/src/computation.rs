// src/computation.rs
use std::time::Instant;

use anyhow::{Error, Result};
use safetensors::{SafeTensors, tensor::Dtype as SDtype};

use crate::runtime::Model; // adjust the path if your main file is not `model.rs`

/// Simple container with a few useful aggregates.
#[derive(Debug)]
pub struct ModelStats {
    /// Total number of trainable scalar values.
    pub parameters: usize,
    /// Raw parameter storage, in bytes.
    pub param_bytes: usize,
    /// Extremely rough FLOPs estimate (2 × parameters).
    pub flops_per_forward: usize,
    /// Measured wall‑clock time for a single embed_text call.
    pub elapsed_ms: f64,
}

/// Quick‑and‑dirty dtype‑size helper
fn dtype_size(dtype: SDtype) -> usize {
    match dtype {
        SDtype::F16 | SDtype::BF16 => 2,
        SDtype::F32 | SDtype::I32 | SDtype::U32 => 4,
        SDtype::F64 | SDtype::I64 | SDtype::U64 => 8,
        SDtype::I8 | SDtype::U8 => 1,
        SDtype::I16 | SDtype::U16 => 2,
        _ => 4,
    }
}

/// Extracts statistics from the weight file and benchmarks one forward pass.
pub fn profile_model(model: &mut Model, weights_path: &str) -> Result<ModelStats> {
    // ---------- static stats from the .safetensors ----------
    let data = std::fs::read(weights_path)?;
    let st = SafeTensors::deserialize(&data)?;
    let mut params = 0usize;
    let mut bytes = 0usize;

    for (_, t) in st.tensors() {
        let elems: usize = t.shape().iter().product();
        params += elems;
        bytes += elems * dtype_size(t.dtype());
    }

    // ---------- dynamic: measure a single inference ----------
    let sample = "This is a tiny dummy sentence to benchmark the model.";
    let start = Instant::now();
    let _ = model.embed_text(sample)?; // ignore result, we only want timing
    let elapsed = start.elapsed().as_secs_f64() * 1e3; // ms

    // crude FLOP guess: assume 2*params per forward
    let stats = ModelStats {
        parameters: params,
        param_bytes: bytes,
        flops_per_forward: params * 2,
        elapsed_ms: elapsed,
    };

    Ok(stats)
}
