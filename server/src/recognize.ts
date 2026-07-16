import { GoogleGenAI, Type } from "@google/genai";

export interface RecognizedItem {
  location: string;
  password: string;
}

export async function recognizePasswords(
  imageBuffer: Buffer,
  mimeType: string,
  locationNames: string[],
): Promise<RecognizedItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("服务端未配置 GEMINI_API_KEY");
  }
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBuffer.toString("base64"),
            },
          },
          {
            text:
              `这是一张《三角洲行动》游戏每日密码的截图。请从图中识别出各个地图对应的4位数字密码。\n` +
              `已知的地图名称有：${locationNames.join("、")}。\n` +
              `请以 JSON 数组输出，location 字段必须使用上面给出的地图名称原文，password 为识别到的数字密码。` +
              `只输出图中确实能识别到的条目。`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING },
            password: { type: Type.STRING },
          },
          required: ["location", "password"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) return [];
  const parsed = JSON.parse(text) as RecognizedItem[];
  return parsed.filter(
    (item) =>
      typeof item.location === "string" && typeof item.password === "string",
  );
}
