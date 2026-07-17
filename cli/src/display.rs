use colored::Colorize;
use comfy_table::{Cell, Color, Table, presets};
use std::path::Path;
use crate::types::*;

/// 打印每日密码表格
pub fn print_daily(data: &DailyData) {
    let date_str = data
        .date
        .as_deref()
        .unwrap_or("暂无日期");
    println!();
    println!("  {} {}", "📅".bold(), date_str.cyan().bold());

    if data.entries.is_empty() {
        println!("  {} 暂无地点数据\n", "⚠".yellow());
        return;
    }

    let mut table = Table::new();
    table.load_preset(presets::UTF8_FULL_CONDENSED);
    table.set_header(vec!["#", "地点", "密码", "攻略"]);

    for (i, entry) in data.entries.iter().enumerate() {
        let pw = if entry.password.is_empty() {
            "────".to_string()
        } else {
            entry.password.clone()
        };

        let guide = if entry.guide.is_empty() {
            "".to_string()
        } else {
            entry.guide.clone()
        };

        table.add_row(vec![
            Cell::new((i + 1).to_string()),
            Cell::new(&entry.name),
            Cell::new(pw),
            Cell::new(guide),
        ]);
    }

    println!("{table}");
}

/// 打印识别结果
pub fn print_ocr_results(results: &[RecognizeResult]) {
    println!();
    let found = results.iter().filter(|r| !r.password.is_empty()).count();
    println!(
        "  {} 识别完成: {}/{} 个密码",
        "✅".bold(),
        found.to_string().green().bold(),
        results.len()
    );

    let mut table = Table::new();
    table.load_preset(presets::UTF8_FULL_CONDENSED);
    table.set_header(vec!["地点", "密码"]);

    for r in results {
        let pw = if r.password.is_empty() {
            "未识别".to_string()
        } else {
            r.password.clone()
        };
        table.add_row(vec![
            Cell::new(&r.name).fg(Color::Cyan),
            Cell::new(pw).fg(Color::Green),
        ]);
    }
    println!("{table}");
}

/// 打印历史记录
pub fn print_history(dates: &[String]) {
    println!();
    if dates.is_empty() {
        println!("  {} 暂无密码记录\n", "📭".bold());
        return;
    }
    println!("  {} 历史记录:\n", "📋".bold());
    for d in dates {
        println!("    {}", d.cyan());
    }
    println!();
}

/// 打印检查结果
pub fn print_check(date: &str, count: usize) {
    println!();
    if count > 0 {
        println!(
            "  {} 今日 ({}) 密码已更新，{} 个地点已录入\n",
            "✅".bold(),
            date.cyan(),
            count.to_string().green().bold()
        );
    } else {
        println!(
            "  {} 今日 ({}) 密码尚未录入\n",
            "⚠".yellow().bold(),
            date.cyan()
        );
    }
}

/// 打印配置信息
pub fn print_config(url: &str, token_set: bool, config_path: &Path) {
    println!();
    println!("  {} 当前配置:", "⚙".bold());
    println!("    服务地址: {}", url.cyan());
    println!(
        "    管理密钥: {}",
        if token_set {
            "已设置".green().to_string()
        } else {
            "未设置".dimmed().to_string()
        }
    );
    println!("    配置路径: {}", config_path.display());
    println!();
}
