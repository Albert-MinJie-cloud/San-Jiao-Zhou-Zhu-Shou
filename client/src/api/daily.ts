import { request } from "./client";
import type { DailyData } from "@/types";

/** 获取每日密码数据（默认最新一天，可指定日期） */
export async function getDaily(date?: string): Promise<DailyData> {
  const url = date ? `/api/daily?date=${date}` : "/api/daily";
  return request(await fetch(url));
}

/** 获取有历史记录的日期列表 */
export async function getHistory(): Promise<string[]> {
  const data = await request<{ dates: string[] }>(await fetch("/api/history"));
  return data.dates;
}
