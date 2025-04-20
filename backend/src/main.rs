use std::env;

use axum::Router;
use hack_owasp::{routes::run::run, runtime::Model};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let port = env::var("PORT").unwrap_or("5000".to_string());

    let routes_all = Router::new().merge(run());

    let listener = TcpListener::bind(format!("127.0.0.1:{}", port))
        .await
        .expect("Unable to access port");

    println!("The server is listening on: http://127.0.0.1:{}", port);
    axum::serve(listener, routes_all.into_make_service())
        .await
        .unwrap()
}
