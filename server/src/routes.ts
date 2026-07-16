import { Router } from "express";
import multer from "multer";
import { db } from "./db.js";
import { requireAdmin } from "./auth.js";
import { recognizePasswords } from "./recognize.js";

interface LocationRow {
  id: number;
  name: string;
  guide: string;
  image_url: string;
  sort_order: number;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const router = Router();

function getLocations(): LocationRow[] {
  return db
    .prepare("SELECT * FROM locations ORDER BY sort_order")
    .all() as LocationRow[];
}

// 公开接口：密码合集（默认最新一天，?date=YYYY-MM-DD 查指定日期）
router.get("/daily", (req, res) => {
  let date: string | null = null;
  const queryDate = req.query.date;
  if (typeof queryDate === "string" && queryDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(queryDate)) {
      res.status(400).json({ error: "date 格式应为 YYYY-MM-DD" });
      return;
    }
    date = queryDate;
  } else {
    const latest = db
      .prepare("SELECT MAX(date) AS date FROM daily_passwords")
      .get() as { date: string | null };
    date = latest.date;
  }

  const passwords = new Map<number, string>();
  if (date) {
    const rows = db
      .prepare("SELECT location_id, password FROM daily_passwords WHERE date = ?")
      .all(date) as { location_id: number; password: string }[];
    rows.forEach((r) => passwords.set(r.location_id, r.password));
  }

  res.json({
    date,
    entries: getLocations().map((l) => ({
      id: l.id,
      name: l.name,
      guide: l.guide,
      imageUrl: l.image_url,
      password: passwords.get(l.id) ?? "",
    })),
  });
});

// 公开接口：有记录的日期列表（倒序）
router.get("/history", (_req, res) => {
  const rows = db
    .prepare("SELECT DISTINCT date FROM daily_passwords ORDER BY date DESC")
    .all() as { date: string }[];
  res.json({ dates: rows.map((r) => r.date) });
});

// 管理接口
router.post(
  "/admin/recognize",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "缺少图片文件" });
      return;
    }
    try {
      const locations = getLocations();
      const items = await recognizePasswords(
        req.file.buffer,
        req.file.mimetype,
        locations.map((l) => l.name),
      );
      // 识别结果与地点按名称对齐（包含匹配，容忍 AI 输出略有差异）
      const results = locations.map((l) => {
        const hit = items.find(
          (item) =>
            item.location === l.name ||
            item.location.includes(l.name) ||
            l.name.includes(item.location),
        );
        return { locationId: l.id, name: l.name, password: hit?.password ?? "" };
      });
      res.json({ results });
    } catch (err) {
      console.error("recognize failed", err);
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : "识别失败" });
    }
  },
);

router.put("/admin/daily", requireAdmin, (req, res) => {
  const { date, entries } = req.body as {
    date?: string;
    entries?: { locationId: number; password: string }[];
  };
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(entries)) {
    res.status(400).json({ error: "参数错误：需要 date(YYYY-MM-DD) 和 entries" });
    return;
  }
  const upsert = db.prepare(
    `INSERT INTO daily_passwords (date, location_id, password) VALUES (?, ?, ?)
     ON CONFLICT(date, location_id) DO UPDATE SET password = excluded.password`,
  );
  const run = db.transaction(() => {
    for (const e of entries) {
      if (typeof e.locationId !== "number" || typeof e.password !== "string")
        continue;
      upsert.run(date, e.locationId, e.password.trim());
    }
  });
  run();
  res.json({ ok: true });
});

router.get("/admin/locations", requireAdmin, (_req, res) => {
  res.json({
    locations: getLocations().map((l) => ({
      id: l.id,
      name: l.name,
      guide: l.guide,
      imageUrl: l.image_url,
    })),
  });
});

router.put("/admin/locations", requireAdmin, (req, res) => {
  const { locations } = req.body as {
    locations?: { id: number; name: string; guide: string; imageUrl: string }[];
  };
  if (!Array.isArray(locations)) {
    res.status(400).json({ error: "参数错误：需要 locations 数组" });
    return;
  }
  const update = db.prepare(
    "UPDATE locations SET name = ?, guide = ?, image_url = ? WHERE id = ?",
  );
  const run = db.transaction(() => {
    for (const l of locations) {
      if (typeof l.id !== "number") continue;
      update.run(l.name ?? "", l.guide ?? "", l.imageUrl ?? "", l.id);
    }
  });
  run();
  res.json({ ok: true });
});

// 新增地点
router.post("/admin/locations", requireAdmin, (req, res) => {
  const { name, guide, imageUrl } = req.body as {
    name?: string;
    guide?: string;
    imageUrl?: string;
  };
  if (!name?.trim()) {
    res.status(400).json({ error: "地点名称不能为空" });
    return;
  }
  const max = db
    .prepare(
      "SELECT COALESCE(MAX(sort_order), 0) AS s, COALESCE(MAX(id), 0) AS i FROM locations",
    )
    .get() as { s: number; i: number };
  const id = max.i + 1;
  db.prepare(
    "INSERT INTO locations (id, name, guide, image_url, sort_order) VALUES (?, ?, ?, ?, ?)",
  ).run(id, name.trim(), guide ?? "", imageUrl ?? "", max.s + 1);
  res.json({
    location: { id, name: name.trim(), guide: guide ?? "", imageUrl: imageUrl ?? "" },
  });
});

// 删除地点（连带删除该地点的历史密码）
router.delete("/admin/locations/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "id 无效" });
    return;
  }
  const run = db.transaction(() => {
    db.prepare("DELETE FROM daily_passwords WHERE location_id = ?").run(id);
    return db.prepare("DELETE FROM locations WHERE id = ?").run(id);
  });
  const result = run();
  if (result.changes === 0) {
    res.status(404).json({ error: "地点不存在" });
    return;
  }
  res.json({ ok: true });
});
