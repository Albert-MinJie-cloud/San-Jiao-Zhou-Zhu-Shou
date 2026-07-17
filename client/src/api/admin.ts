import { request, authHeaders } from "./client";
import type { RecognizeResult, LocationConfig } from "@/types";

/** 上传截图，AI 识别密码 */
export async function recognize(
  file: File,
  token: string,
): Promise<RecognizeResult[]> {
  const form = new FormData();
  form.append("image", file);
  const data = await request<{ results: RecognizeResult[] }>(
    await fetch("/api/admin/recognize", {
      method: "POST",
      headers: authHeaders(token),
      body: form,
    }),
  );
  return data.results;
}

/** 保存某天的密码 */
export async function saveDaily(
  date: string,
  entries: { locationId: number; password: string }[],
  token: string,
): Promise<void> {
  await request(
    await fetch("/api/admin/daily", {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ date, entries }),
    }),
  );
}

/** 获取所有地点配置 */
export async function getLocations(token: string): Promise<LocationConfig[]> {
  const data = await request<{ locations: LocationConfig[] }>(
    await fetch("/api/admin/locations", { headers: authHeaders(token) }),
  );
  return data.locations;
}

/** 批量保存地点配置 */
export async function saveLocations(
  locations: LocationConfig[],
  token: string,
): Promise<void> {
  await request(
    await fetch("/api/admin/locations", {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ locations }),
    }),
  );
}

/** 新增地点 */
export async function addLocation(
  data: { name: string; guide: string; imageUrl: string },
  token: string,
): Promise<LocationConfig> {
  const res = await request<{ location: LocationConfig }>(
    await fetch("/api/admin/locations", {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
  return res.location;
}

/** 删除地点 */
export async function deleteLocation(
  id: number,
  token: string,
): Promise<void> {
  await request(
    await fetch(`/api/admin/locations/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
  );
}
