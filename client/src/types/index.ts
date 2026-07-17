export interface DailyEntry {
  id: number;
  name: string;
  guide: string;
  imageUrl: string;
  password: string;
}

export interface DailyData {
  date: string | null;
  entries: DailyEntry[];
}

export interface LocationConfig {
  id: number;
  name: string;
  guide: string;
  imageUrl: string;
}

export interface RecognizeResult {
  locationId: number;
  name: string;
  password: string;
}

/** 前端卡片展示用的地点数据 */
export interface LocationData {
  id: number;
  location: string;
  password: string;
  guide: string;
  image: string | null;
}
