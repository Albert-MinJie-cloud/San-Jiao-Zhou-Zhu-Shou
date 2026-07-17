import { createWorker } from "tesseract.js";

export interface RecognizedItem {
  location: string;
  password: string;
}

/**
 * 用 Tesseract.js 本地 OCR 识别截图中的文字，
 * 然后根据空间位置将地点名与 4 位数字密码配对。
 */
export async function recognizePasswords(
  imageBuffer: Buffer,
  _mimeType: string,
  locationNames: string[],
): Promise<RecognizedItem[]> {
  const worker = await createWorker("chi_sim+eng");

  try {
    const { data } = await worker.recognize(imageBuffer);

    // Tesseract.js 没有 TypeScript 类型，手动提取文字块位置
    const blocks = extractBlocks(data as any);
    const results: RecognizedItem[] = [];

    for (const name of locationNames) {
      const nameBlock = blocks.find((b) =>
        b.text.toLowerCase().includes(name.toLowerCase()),
      );
      if (!nameBlock) continue;

      const password = findNearbyPassword(nameBlock, blocks);
      if (password) {
        results.push({ location: name, password });
      }
    }

    return results;
  } finally {
    await worker.terminate();
  }
}

interface TextBlock {
  text: string;
  x: number;
  y: number;
}

/** 从 OCR 结果中按行提取文字块及其坐标 */
function extractBlocks(data: any): TextBlock[] {
  const blocks: TextBlock[] = [];
  const lines = data.paragraphs ?? data.lines ?? [];

  for (const line of lines) {
    const text = (line.text ?? "").trim();
    if (!text) continue;
    const bbox = line.bbox ?? line.paragraph?.bbox ?? {};
    blocks.push({
      text,
      x: bbox.x0 ?? bbox.left ?? 0,
      y: bbox.y0 ?? bbox.top ?? 0,
    });
  }

  return blocks;
}

/** 在目标文字块附近查找 4 位数字密码 */
function findNearbyPassword(target: TextBlock, all: TextBlock[]): string | null {
  const candidates: { password: string; dist: number }[] = [];

  for (const b of all) {
    if (b === target) continue;
    const match = b.text.match(/\b(\d{4})\b/);
    if (!match) continue;

    const dist = Math.sqrt(
      Math.pow(b.x - target.x, 2) + Math.pow(b.y - target.y, 2),
    );
    candidates.push({ password: match[1], dist });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.dist - b.dist);
  return candidates[0].password;
}
