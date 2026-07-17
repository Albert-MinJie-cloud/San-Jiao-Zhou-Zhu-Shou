import { useCallback, useEffect, useState } from "react";
import { Crosshair } from "lucide-react";
import type { LocationConfig } from "@/types";
import { getDaily, getHistory } from "@/api/daily";
import {
  addLocation,
  deleteLocation,
  getLocations,
  recognize,
  saveDaily,
  saveLocations,
} from "@/api/admin";
import { useAuth } from "@/hooks/useAuth";
import NavBar from "@/components/NavBar";
import LoginForm from "./admin/LoginForm";
import PasswordEntry from "./admin/PasswordEntry";
import LocationConfigSection from "./admin/LocationConfig";

function todayStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Admin() {
  const { token, authed, login, handleAuthError } = useAuth();
  const [tokenInput, setTokenInput] = useState("");

  const [locations, setLocations] = useState<LocationConfig[]>([]);
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [date, setDate] = useState(todayStr());
  const [history, setHistory] = useState<string[]>([]);

  const [recognizing, setRecognizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingLocs, setSavingLocs] = useState(false);
  const [message, setMessage] = useState("");

  // 认证通过后拉取地点配置
  useEffect(() => {
    if (!authed) return;
    getLocations(token)
      .then(setLocations)
      .catch((err) => {
        if (!handleAuthError(err))
          setMessage(String((err as Error).message ?? err));
      });
  }, [authed, token, handleAuthError]);

  // 拉取历史日期
  const refreshHistory = useCallback(() => {
    getHistory()
      .then(setHistory)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authed) refreshHistory();
  }, [authed, refreshHistory]);

  // 切换日期时加载该天已存密码
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
      setMessage(
        `识别完成：${found}/${locations.length} 个密码，请核对后保存`,
      );
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

  // 未登录：显示登录表单
  if (!authed) {
    return (
      <LoginForm
        tokenInput={tokenInput}
        onTokenInput={setTokenInput}
        onLogin={() => login(tokenInput)}
        message={message}
      />
    );
  }

  // 已登录：管理后台
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      <NavBar title="每日密码管理后台">
        <a
          href="#/"
          className="text-sm text-neutral-400 hover:text-emerald-400 transition-colors"
        >
          返回主页
        </a>
      </NavBar>

      <main className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-10">
        {message && (
          <div className="bg-neutral-900/80 border border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        <PasswordEntry
          date={date}
          onDateChange={setDate}
          history={history}
          recognizing={recognizing}
          onRecognize={handleRecognize}
          locations={locations}
          passwords={passwords}
          onPasswordChange={(id, pw) =>
            setPasswords((p) => ({ ...p, [id]: pw }))
          }
          saving={saving}
          onSave={handleSaveDaily}
        />

        <LocationConfigSection
          locations={locations}
          onAdd={handleAddLocation}
          onDelete={handleDeleteLocation}
          onUpdate={updateLocation}
          saving={savingLocs}
          onSave={handleSaveLocations}
        />
      </main>
    </div>
  );
}
