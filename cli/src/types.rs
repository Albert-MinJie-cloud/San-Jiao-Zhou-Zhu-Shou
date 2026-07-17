use serde::Deserialize;

/// GET /api/daily 返回
#[derive(Debug, Deserialize)]
pub struct DailyData {
    pub date: Option<String>,
    pub entries: Vec<DailyEntry>,
}

/// 单条地点 + 密码
#[derive(Debug, Deserialize)]
pub struct DailyEntry {
    pub id: i32,
    pub name: String,
    pub guide: String,
    #[serde(rename = "imageUrl")]
    pub image_url: String,
    pub password: String,
}

/// GET /api/history 返回
#[derive(Debug, Deserialize)]
pub struct HistoryResponse {
    pub dates: Vec<String>,
}

/// POST /api/admin/recognize 返回
#[derive(Debug, Deserialize)]
pub struct RecognizeResponse {
    pub results: Vec<RecognizeResult>,
}

#[derive(Debug, Deserialize)]
pub struct RecognizeResult {
    #[serde(rename = "locationId")]
    pub location_id: i32,
    pub name: String,
    pub password: String,
}
