import React, { useCallback, useEffect, useState } from "react";
import {
  Crosshair,
  History,
  KeyRound,
  Loader2,
  MapPin,
  Plus,
  Save,
  ScanSearch,
  Trash2,
  Upload,
} from "lucide-react";
import {
  addLocation,
  deleteLocation,
  getDaily,
  getHistory,
  getLocations,
  recognize,
  saveDaily,
  saveLocations,
  type LocationConfig,
} from "../api";

const TOKEN_KEY = "admin_token";

function todayStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Admin() {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) ?? "",
  );
  const [tokenInput, setTokenInput] = useState("");
  const [authed, setAuthed] = useState(false);

  const [locations, setLocations] = useState<LocationConfig[]>([]);
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [date, setDate] = useState(todayStr());
  const [history, setHistory] = useState<string[]>([]);

  const [recognizing, setRecognizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingLocs, setSavingLocs] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuthError = useCallback((err: unknown) => {
    if ((err as { status?: number }).status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setAuthed(false);
      setMessage("密钥错误，请重新登录");
      return true;
    }
    return false;
  }, []);

  // 有 token 时尝试拉取地点配置来验证密钥
  useEffect(() => {
    if (!token) return;
    getLocations(token)
      .then((locs) => {
        setLocations(locs);
        setAuthed(true);
        setMessage("");
      })
      .catch((err) => {
        if (!handleAuthError(err)) setMessage(String(err.message ?? err));
      });
  }, [token, handleAuthError]);

  const login = () => {
    const t = tokenInput.trim();
    if (!t) return;
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const refreshHistory = useCallback(() => {
    getHistory()
      .then(setHistory)
      .catch(() => {});
  }, []);

  // 登录后加载历史日期列表
  useEffect(() => {
    if (authed) refreshHistory();
  }, [authed, refreshHistory]);

  // 切换日期时加载该天已存的密码（无记录则清空）
  useEffect(() => {
    if (!authed || !date) return;
    getDaily(date)
      .then((data) => {
        const next: Record<number, string> = {};
        data.entries.forEach((e) => {
          if (e.password) next[e.id] = e.password;
        });
        setPasswords(next);
      })
      .catch(() => {});
  }, [authed, date]);

  const handleRecognize = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setRecognizing(true);
    setMessage("");
    try {
      const results = await recognize(file, token);
      setPasswords((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r.password) next[r.locationId] = r.password;
        });
        return next;
      });
      const found = results.filter((r) => r.password).length;
      setMessage(`识别完成：${found}/${locations.length} 个密码，请核对后保存`);
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`识别失败：${(err as Error).message}`);
    } finally {
      setRecognizing(false);
    }
  };

  const handleSaveDaily = async () => {
    setSaving(true);
    setMessage("");
    try {
      await saveDaily(
        date,
        locations.map((l) => ({
          locationId: l.id,
          password: passwords[l.id] ?? "",
        })),
        token,
      );
      setMessage(`已保存 ${date} 的密码`);
      refreshHistory();
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`保存失败：${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocations = async () => {
    setSavingLocs(true);
    setMessage("");
    try {
      await saveLocations(locations, token);
      setMessage("地点配置已保存");
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`保存失败：${(err as Error).message}`);
    } finally {
      setSavingLocs(false);
    }
  };

  const handleAddLocation = async () => {
    const name = window.prompt("新地点名称：")?.trim();
    if (!name) return;
    try {
      const loc = await addLocation({ name, guide: "", imageUrl: "" }, token);
      setLocations((locs) => [...locs, loc]);
      setMessage(`已新增地点「${loc.name}」，可继续补充攻略和图片链接`);
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`新增失败：${(err as Error).message}`);
    }
  };

  const handleDeleteLocation = async (loc: LocationConfig) => {
    if (
      !window.confirm(
        `确定删除「${loc.name}」？该地点的所有历史密码也会一并删除。`,
      )
    )
      return;
    try {
      await deleteLocation(loc.id, token);
      setLocations((locs) => locs.filter((l) => l.id !== loc.id));
      setPasswords((p) => {
        const next = { ...p };
        delete next[loc.id];
        return next;
      });
      setMessage(`已删除地点「${loc.name}」`);
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`删除失败：${(err as Error).message}`);
    }
  };

  const updateLocation = (
    id: number,
    field: keyof LocationConfig,
    value: string,
  ) => {
    setLocations((locs) =>
      locs.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    );
  };

  const inputCls =
    "bg-neutral-900/80 border border-neutral-700/50 rounded px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/60 w-full";

  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-neutral-900/60 border border-neutral-800 rounded-xl p-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-center mb-2">
            <KeyRound className="text-emerald-400 w-5 h-5" />
            <span className="font-bold text-lg text-white">管理员登录</span>
          </div>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="输入管理密钥"
            className={inputCls}
          />
          <button
            onClick={login}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            登录
          </button>
          {message && (
            <p className="text-sm text-red-400 text-center">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      <nav className="border-b border-neutral-800/80 bg-neutral-950/80 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="text-emerald-400 w-5 h-5" />
            <span className="font-bold text-lg text-white">
              每日密码管理后台
            </span>
          </div>
          <a
            href="#/"
            className="text-sm text-neutral-400 hover:text-emerald-400 transition-colors"
          >
            返回主页
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-10">
        {message && (
          <div className="bg-neutral-900/80 border border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* 每日密码录入 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ScanSearch className="text-emerald-500 w-5 h-5" />
            每日密码录入
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputCls} w-auto`}
            />
            {history.length > 0 && (
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-neutral-500" />
                <select
                  value={history.includes(date) ? date : ""}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  className={`${inputCls} w-auto cursor-pointer`}
                >
                  <option value="">历史记录...</option>
                  {history.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="cursor-pointer bg-neutral-800 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              {recognizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {recognizing ? "AI 识别中..." : "上传截图识别"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={recognizing}
                onChange={handleRecognize}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locations.map((l) => (
              <div
                key={l.id}
                className="bg-neutral-900/60 border border-neutral-800 rounded-lg px-4 py-3 flex items-center justify-between gap-4"
              >
                <span className="text-white font-bold text-sm">{l.name}</span>
                <input
                  type="text"
                  value={passwords[l.id] ?? ""}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, [l.id]: e.target.value }))
                  }
                  placeholder="----"
                  className="bg-transparent border-b border-neutral-700 focus:border-emerald-500 text-emerald-400 font-mono font-bold text-xl tracking-widest text-center outline-none w-28"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveDaily}
            disabled={saving}
            className="self-start bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "保存中..." : "保存当日密码"}
          </button>
        </section>

        {/* 地点配置 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-emerald-500 w-5 h-5" />
              地点配置（名称 / 攻略 / 图床链接）
            </h2>
            <button
              onClick={handleAddLocation}
              className="bg-neutral-800 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增地点
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {locations.map((l) => (
              <div
                key={l.id}
                className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-[10rem_1fr_1fr_4rem_2.5rem] gap-3 items-center"
              >
                <input
                  type="text"
                  value={l.name}
                  onChange={(e) => updateLocation(l.id, "name", e.target.value)}
                  placeholder="地点名称"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={l.guide}
                  onChange={(e) =>
                    updateLocation(l.id, "guide", e.target.value)
                  }
                  placeholder="位置攻略"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={l.imageUrl}
                  onChange={(e) =>
                    updateLocation(l.id, "imageUrl", e.target.value)
                  }
                  placeholder="图床图片链接 https://..."
                  className={inputCls}
                />
                <div className="w-16 h-10 bg-black rounded overflow-hidden flex items-center justify-center border border-neutral-800">
                  {l.imageUrl ? (
                    <img
                      src={l.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-neutral-700 text-[10px]">无图</span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteLocation(l)}
                  title="删除地点"
                  className="w-9 h-9 rounded flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors justify-self-end"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveLocations}
            disabled={savingLocs}
            className="self-start bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingLocs ? "保存中..." : "保存地点配置"}
          </button>
        </section>
      </main>
    </div>
  );
}
