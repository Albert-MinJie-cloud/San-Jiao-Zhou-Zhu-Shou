import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
);
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "app.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    guide TEXT NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS daily_passwords (
    date TEXT NOT NULL,
    location_id INTEGER NOT NULL REFERENCES locations(id),
    password TEXT NOT NULL,
    PRIMARY KEY (date, location_id)
  );
`);

// 首次启动 seed 6 个固定地点（文案来自前端原 defaultData）
const count = db.prepare("SELECT COUNT(*) AS c FROM locations").get() as {
  c: number;
};
if (count.c === 0) {
  const seed = [
    ["零号大坝", "主变电站右侧，进入地下管道后匍匐到通道尽头处"],
    ["长弓溪谷", "地图右下角标点附近地下入口"],
    ["巴克什", "大浴场北侧"],
    ["航天基地", "工业区组装室2楼"],
    ["潮汐监狱", "监狱行政区1楼大厅楼梯拐角处"],
    ["AZ3", "核电站海水处理区地下-泄漏房角落"],
  ];
  const insert = db.prepare(
    "INSERT INTO locations (id, name, guide, image_url, sort_order) VALUES (?, ?, ?, '', ?)",
  );
  seed.forEach(([name, guide], i) => insert.run(i + 1, name, guide, i + 1));
}
