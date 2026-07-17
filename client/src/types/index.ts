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

export interface OcrBlock {
  text: string;
  x: number;
  y: number;
}

export interface OcrUnit {
  unit: number;
  xRange: number[];
  nameText: string;
  passwordRaw: string;
}

export interface OcrDebug {
  rawBlocks: OcrBlock[];
  mergedBlocks: OcrBlock[];
  units?: OcrUnit[];
}

export interface RecognizeResult {
  locationId: number;
  name: string;
  password: string;
}

export interface RecognizeResponse {
  results: RecognizeResult[];
  debug: OcrDebug | null;
}

/** 前端卡片展示用的地点数据 */
export interface LocationData {
  id: number;
  location: string;
  password: string;
  guide: string;
  image: string | null;
}
