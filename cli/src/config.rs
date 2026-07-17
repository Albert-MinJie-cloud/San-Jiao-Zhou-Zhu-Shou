use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

/// ~/.config/delta-helper/config.toml
#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub server: ServerConfig,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServerConfig {
    pub url: String,
    pub token: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            server: ServerConfig {
                url: "http://localhost:8000".into(),
                token: String::new(),
            },
        }
    }
}

impl Config {
    pub fn config_dir() -> PathBuf {
        dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("delta-helper")
    }

    pub fn config_path() -> PathBuf {
        Self::config_dir().join("config.toml")
    }

    /// 加载配置，不存在则返回默认值
    pub fn load() -> Self {
        let path = Self::config_path();
        if !path.exists() {
            return Self::default();
        }
        let content = match fs::read_to_string(&path) {
            Ok(c) => c,
            Err(e) => {
                eprintln!("  ⚠ 读取配置文件失败 ({}), 使用默认配置", e);
                return Self::default();
            }
        };
        toml::from_str(&content).unwrap_or_else(|e| {
            eprintln!("  ⚠ 解析配置文件失败 ({}), 使用默认配置", e);
            Self::default()
        })
    }

    /// 保存配置
    pub fn save(&self) -> Result<(), String> {
        let dir = Self::config_dir();
        fs::create_dir_all(&dir).map_err(|e| format!("创建配置目录失败: {}", e))?;
        let content = toml::to_string_pretty(self).map_err(|e| format!("序列化配置失败: {}", e))?;
        fs::write(Self::config_path(), content).map_err(|e| format!("写入配置文件失败: {}", e))?;
        Ok(())
    }
}
