use crate::types::*;
use reqwest::blocking::Client;
use reqwest::header;

/// API 客户端 —— 封装对后端服务的 HTTP 请求
pub struct ApiClient {
    client: Client,
    base_url: String,
    token: String,
}

impl ApiClient {
    pub fn new(base_url: String, token: String) -> Self {
        Self {
            client: Client::builder()
                .timeout(std::time::Duration::from_secs(15))
                .build()
                .expect("创建 HTTP 客户端失败"),
            base_url,
            token,
        }
    }

    fn auth_header(&self) -> header::HeaderMap {
        let mut h = header::HeaderMap::new();
        if !self.token.is_empty() {
            h.insert(
                header::AUTHORIZATION,
                header::HeaderValue::from_str(&format!("Bearer {}", self.token))
                    .unwrap(),
            );
        }
        h
    }

    /// GET /api/daily
    pub fn get_daily(&self, date: Option<&str>) -> Result<DailyData, String> {
        let mut url = format!("{}/api/daily", self.base_url);
        if let Some(d) = date {
            url.push_str(&format!("?date={}", d));
        }
        let resp = self
            .client
            .get(&url)
            .headers(self.auth_header())
            .send()
            .map_err(|e| format!("请求失败: {}", e))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().unwrap_or_default();
            return Err(format!("{} {}", status, body));
        }
        resp.json().map_err(|e| format!("解析响应失败: {}", e))
    }

    /// GET /api/history
    pub fn get_history(&self) -> Result<Vec<String>, String> {
        let url = format!("{}/api/history", self.base_url);
        let resp = self
            .client
            .get(&url)
            .headers(self.auth_header())
            .send()
            .map_err(|e| format!("请求失败: {}", e))?;
        if !resp.status().is_success() {
            return Err(format!("{}", resp.status()));
        }
        let data: HistoryResponse = resp.json().map_err(|e| format!("解析响应失败: {}", e))?;
        Ok(data.dates)
    }

    /// POST /api/admin/recognize
    pub fn ocr(&self, image_path: &str) -> Result<Vec<RecognizeResult>, String> {
        let url = format!("{}/api/admin/recognize", self.base_url);

        let img_bytes = std::fs::read(image_path)
            .map_err(|e| format!("读取图片失败: {}", e))?;

        let mime = mime_guess(image_path);

        let part = reqwest::blocking::multipart::Part::bytes(img_bytes)
            .file_name(std::path::Path::new(image_path)
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string())
            .mime_str(&mime)
            .map_err(|e| format!("创建 multipart 失败: {}", e))?;

        let form = reqwest::blocking::multipart::Form::new()
            .part("image", part);

        let mut headers = self.auth_header();
        let resp = self
            .client
            .post(&url)
            .headers(headers)
            .multipart(form)
            .send()
            .map_err(|e| format!("请求失败: {}", e))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().unwrap_or_default();
            return Err(format!("{} {}", status, body));
        }
        let data: RecognizeResponse = resp.json().map_err(|e| format!("解析响应失败: {}", e))?;
        Ok(data.results)
    }
}

/// 根据文件名猜 MIME
fn mime_guess(path: &str) -> String {
    let low = path.to_lowercase();
    if low.ends_with(".png") {
        "image/png".into()
    } else if low.ends_with(".jpg") || low.ends_with(".jpeg") {
        "image/jpeg".into()
    } else if low.ends_with(".webp") {
        "image/webp".into()
    } else {
        "image/png".into()
    }
}
