use std::collections::HashMap;

use axum::{Json, Router, routing::post};
use serde::{Deserialize, Serialize};

use crate::{error::Result, runtime::Model};

pub fn run() -> Router {
    Router::new().route("/run", post(run_handler))
}

#[axum::debug_handler]
async fn run_handler(Json(req): Json<RunRequest>) -> Result<Json<RunResponse>> {
    let mut model = Model::new(&req.model, &req.revision)?;
    let cost = (model.estimate_flops(&req.sentence)? as f32 * 1e-12) as f64;
    let (summary, scores) = model.summarize(&req.sentence, req.ratio)?;

    Ok(Json(RunResponse {
        summary,
        scores,
        cost,
    }))
}

#[derive(Deserialize)]
struct RunRequest {
    model: String,
    revision: String,
    sentence: String,
    ratio: f32,
}

#[derive(Serialize)]
struct RunResponse {
    summary: String,
    scores: HashMap<String, f32>,
    cost: f64,
}
