import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
import { useToast, ToastProvider } from "@/components/Toast";
import NavBar from "@/components/NavBar";
import LoginForm from "./admin/LoginForm";
import PasswordEntry from "./admin/PasswordEntry";
import LocationConfigSection from "./admin/LocationConfig";

function todayStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function AdminInner() {
  const { token, authed, login, handleAuthError } = useAuth();
  const { showToast } = useToast();
  const [tokenInput, setTokenInput] = useState("");

  const [locations, setLocations] = useState<LocationConfig[]>([]);
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [date, setDate] = useState(todayStr());
  const [history, setHistory] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState("");

  const [recognizing, setRecognizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingLocs, setSavingLocs] = useState(false);
  const [message, setMessage] = useState("");

  // 新增交互状态
  const [isMasked, setIsMasked] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 认证通过后拉取地点配置
  useEffect(() => {
    if (!authed) return;
    getLocations(token)
      .then((locs) => {
        setLocations(locs);
        setIsDirty(false);
      })
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
      const msg = `识别完成：${found}/${locations.length} 个密码，请核对后保存`;
      setSaveStatus(msg);
      showToast(msg);
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`识别失败：${(err as Error).message}`);
      showToast(`识别失败：${(err as Error).message}`, "error");
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
      const msg = `已保存 ${date} 的密码`;
      setSaveStatus(msg);
      showToast(msg);
      refreshHistory();
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`保存失败：${(err as Error).message}`);
      showToast(`保存失败：${(err as Error).message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDaily = () => {
    const next: Record<number, string> = {};
    locations.forEach((l) => {
      next[l.id] = "";
    });
    setPasswords(next);
    setSaveStatus("");
    showToast("已重置当日密码");
  };

  const handleSaveLocations = async () => {
    setSavingLocs(true);
    setMessage("");
    try {
      await saveLocations(locations, token);
      setMessage("地点配置已保存");
      setIsDirty(false);
      showToast("地点配置已保存");
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`保存失败：${(err as Error).message}`);
      showToast(`保存失败：${(err as Error).message}`, "error");
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
      setIsDirty(true);
      showToast(`已新增地点「${loc.name}」`);
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`新增失败：${(err as Error).message}`);
      showToast(`新增失败：${(err as Error).message}`, "error");
    }
  };

  const handleDeleteLocation = async (loc: LocationConfig) => {
    try {
      await deleteLocation(loc.id, token);
      setLocations((locs) => locs.filter((l) => l.id !== loc.id));
      setPasswords((p) => {
        const next = { ...p };
        delete next[loc.id];
        return next;
      });
      setMessage(`已删除地点「${loc.name}」`);
      showToast(`已删除地点「${loc.name}」`);
    } catch (err) {
      if (!handleAuthError(err))
        setMessage(`删除失败：${(err as Error).message}`);
      showToast(`删除失败：${(err as Error).message}`, "error");
    }
  };

  const handleUpdateLocation = (
    id: number,
    field: keyof LocationConfig,
    value: string,
  ) => {
    setLocations((locs) =>
      locs.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    );
    setIsDirty(true);
  };

  // Ctrl+S 快捷键
  useEffect(() => {
    if (!authed) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDaily();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [authed, date, passwords, locations, token]);

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
    <div className="min-h-screen bg-[#0F0F13] text-[#D0D0E0] text-[14px]">
      <NavBar title="每日密码管理后台">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMasked(!isMasked)}
            title={isMasked ? "显示密码" : "隐藏密码"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all duration-150 ${
              isMasked
                ? "bg-[#26C087]/10 text-[#26C087] border border-[#26C087]/30"
                : "text-[#787890] border border-[#2A2A38] hover:text-white hover:border-[#787890]"
            }`}
          >
            {isMasked ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            {isMasked ? "已脱敏" : "脱敏"}
          </button>
          <a
            href="#/"
            className="text-xs text-[#787890] hover:text-[#26C087] transition-colors"
          >
            返回主页
          </a>
        </div>
      </NavBar>

      <main className="max-w-4xl mx-auto p-6 flex flex-col gap-8">
        {/* 消息提示（现有逻辑保留） */}
        {message && (
          <div className="bg-[#181820] border border-[#26C087]/20 rounded-[6px] px-5 py-3 text-sm text-[#26C087]">
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
          saveStatus={saveStatus}
          onSave={handleSaveDaily}
          onReset={handleResetDaily}
          isMasked={isMasked}
        />

        <LocationConfigSection
          locations={locations}
          onAdd={handleAddLocation}
          onDelete={handleDeleteLocation}
          onUpdate={handleUpdateLocation}
          saving={savingLocs}
          hasUnsaved={isDirty}
          onSave={handleSaveLocations}
        />
      </main>
    </div>
  );
}

/** 管理后台入口 —— 包裹 ToastProvider */
export default function Admin() {
  return (
    <ToastProvider>
      <AdminInner />
    </ToastProvider>
  );
}
