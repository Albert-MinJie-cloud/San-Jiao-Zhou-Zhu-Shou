mod client;
mod config;
mod display;
mod types;

use clap::{Parser, Subcommand};
use colored::*;

/// 三角洲行动助手 — 终端版
#[derive(Parser)]
#[command(name = "delta", version, about = "三角洲行动助手 CLI")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// 查看每日密码（默认显示最新一天）
    Daily {
        /// 指定日期 YYYY-MM-DD
        #[arg(long)]
        date: Option<String>,
    },
    /// 列出有密码记录的历史日期
    History,
    /// 上传截图用 OCR 识别密码
    Ocr {
        /// 截图文件路径
        image: String,
    },
    /// 检查今日密码是否已更新
    Check,
    /// 管理配置
    Config {
        #[command(subcommand)]
        action: ConfigAction,
    },
}

#[derive(Subcommand)]
enum ConfigAction {
    /// 设置服务地址
    SetUrl { url: String },
    /// 设置管理密钥
    SetToken { token: String },
    /// 查看当前配置
    Show,
}

fn main() {
    let cli = Cli::parse();
    let cfg = config::Config::load();

    let api = client::ApiClient::new(cfg.server.url.clone(), cfg.server.token.clone());

    match cli.command.unwrap_or(Commands::Daily { date: None }) {
        Commands::Daily { date } => cmd_daily(&api, date.as_deref()),
        Commands::History => cmd_history(&api),
        Commands::Ocr { image } => cmd_ocr(&api, &image),
        Commands::Check => cmd_check(&api),
        Commands::Config { action } => cmd_config(action, &cfg),
    }
}

fn cmd_daily(api: &client::ApiClient, date: Option<&str>) {
    match api.get_daily(date) {
        Ok(data) => display::print_daily(&data),
        Err(e) => eprintln!("{} {}", "[错误]".red().bold(), e),
    }
}

fn cmd_history(api: &client::ApiClient) {
    match api.get_history() {
        Ok(dates) => display::print_history(&dates),
        Err(e) => eprintln!("{} {}", "[错误]".red().bold(), e),
    }
}

fn cmd_ocr(api: &client::ApiClient, image: &str) {
    if !std::path::Path::new(image).exists() {
        eprintln!("{} 文件不存在: {}", "[错误]".red().bold(), image);
        std::process::exit(1);
    }
    println!("  {} 正在识别: {} ...\n", "🔍".bold(), image);
    match api.ocr(image) {
        Ok(results) => display::print_ocr_results(&results),
        Err(e) => eprintln!("{} {}", "[错误]".red().bold(), e),
    }
}

fn cmd_check(api: &client::ApiClient) {
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    match api.get_daily(Some(&today)) {
        Ok(data) => {
            let count = data.entries.iter().filter(|e| !e.password.is_empty()).count();
            display::print_check(&today, count);
        }
        Err(_) => {
            display::print_check(&today, 0);
        }
    }
}

fn cmd_config(action: ConfigAction, cfg: &config::Config) {
    match action {
        ConfigAction::SetUrl { url } => {
            let mut c = config::Config::load();
            c.server.url = url.clone();
            match c.save() {
                Ok(()) => println!("  {} 服务地址已设置为: {}", "✅".bold(), url.cyan()),
                Err(e) => eprintln!("{} {}", "[错误]".red().bold(), e),
            }
        }
        ConfigAction::SetToken { token } => {
            let mut c = config::Config::load();
            c.server.token = token;
            match c.save() {
                Ok(()) => println!("  {} 管理密钥已更新", "✅".bold()),
                Err(e) => eprintln!("{} {}", "[错误]".red().bold(), e),
            }
        }
        ConfigAction::Show => {
            let path = config::Config::config_path();
            display::print_config(&cfg.server.url, !cfg.server.token.is_empty(), &path);
        }
    }
}
