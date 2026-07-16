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

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    const err = new Error(body?.error ?? `请求失败 (${res.status})`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

export async function getDaily(date?: string): Promise<DailyData> {
  const url = date ? `/api/daily?date=${date}` : "/api/daily";
  return handle(await fetch(url));
}

export async function getHistory(): Promise<string[]> {
  const data = await handle<{ dates: string[] }>(await fetch("/api/history"));
  return data.dates;
}

export async function recognize(
  file: File,
  token: string,
): Promise<RecognizeResult[]> {
  const form = new FormData();
  form.append("image", file);
  const data = await handle<{ results: RecognizeResult[] }>(
    await fetch("/api/admin/recognize", {
      method: "POST",
      headers: authHeaders(token),
      body: form,
    }),
  );
  return data.results;
}

export async function saveDaily(
  date: string,
  entries: { locationId: number; password: string }[],
  token: string,
): Promise<void> {
  await handle(
    await fetch("/api/admin/daily", {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ date, entries }),
    }),
  );
}

export async function getLocations(token: string): Promise<LocationConfig[]> {
  const data = await handle<{ locations: LocationConfig[] }>(
    await fetch("/api/admin/locations", { headers: authHeaders(token) }),
  );
  return data.locations;
}

export async function saveLocations(
  locations: LocationConfig[],
  token: string,
): Promise<void> {
  await handle(
    await fetch("/api/admin/locations", {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ locations }),
    }),
  );
}

export async function addLocation(
  data: { name: string; guide: string; imageUrl: string },
  token: string,
): Promise<LocationConfig> {
  const res = await handle<{ location: LocationConfig }>(
    await fetch("/api/admin/locations", {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
  return res.location;
}

export async function deleteLocation(
  id: number,
  token: string,
): Promise<void> {
  await handle(
    await fetch(`/api/admin/locations/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
  );
}
