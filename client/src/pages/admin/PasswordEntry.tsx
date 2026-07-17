import { useState } from "react";
import {
  History,
  Loader2,
  Save,
  ScanSearch,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Calendar,
} from "lucide-react";
import type { LocationConfig } from "@/types";
import { useToast } from "@/components/Toast";

interface PasswordEntryProps {
  date: string;
  onDateChange: (date: string) => void;
  history: string[];
  recognizing: boolean;
  onRecognize: (e: React.ChangeEvent<HTMLInputElement>) => void;
  locations: LocationConfig[];
  passwords: Record<number, string>;
  onPasswordChange: (locationId: number, password: string) => void;
  saving: boolean;
  saveStatus: string;
  onSave: () => void;
  onReset: () => void;
  isMasked: boolean;
}

function todayStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-[#141417] px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all";

/** 每日密码录入区域 */
export default function PasswordEntry({
  date,
  onDateChange,
  history,
  recognizing,
  onRecognize,
  locations,
  passwords,
  onPasswordChange,
  saving,
  saveStatus,
  onSave,
  onReset,
  isMasked,
}: PasswordEntryProps) {
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const today = todayStr();

  const handleCopy = async (id: number, password: string) => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopiedId(id);
      showToast("已复制到剪贴板");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast("复制失败，请手动选中密码", "error");
    }
  };

  return (
    <section className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-5 relative group overflow-hidden">
      {/* 装饰光晕 */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 标题区 */}
      <div className="flex items-center gap-3 relative">
        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
          <ScanSearch className="text-indigo-500 w-5 h-5" />
        </div>
        <h2 className="text-[16px] font-semibold text-white">每日密码录入</h2>
      </div>

      {/* 顶部操作栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#141417] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all w-[150px]"
            />
          </div>
          <button
            onClick={() => onDateChange(today)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              date === today
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                : "bg-transparent text-slate-400 border border-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            今日
          </button>
          {history.length > 0 && (
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={history.includes(date) ? date : ""}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="bg-[#141417] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="">历史记录</option>
                {history.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] shadow-xl">
          {recognizing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {recognizing ? "识别中..." : "上传截图识别"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={recognizing}
            onChange={onRecognize}
          />
        </label>
      </div>

      {/* 密码点位卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
        {locations.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#141417] p-4 transition-all hover:border-indigo-500/30 hover:bg-white/5 group/item"
          >
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <span className="text-sm font-medium text-white truncate">
                {l.name}
              </span>
              <input
                type={isMasked ? "password" : "text"}
                value={passwords[l.id] ?? ""}
                onChange={(e) => onPasswordChange(l.id, e.target.value)}
                placeholder="----"
                className="bg-transparent border-b border-white/10 focus:border-indigo-500 text-indigo-400 font-mono font-bold text-[16px] tracking-wider outline-none transition-all w-full py-0.5 placeholder:text-slate-700"
              />
            </div>
            <button
              onClick={() => handleCopy(l.id, passwords[l.id] ?? "")}
              disabled={!passwords[l.id]}
              title="复制密码"
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {copiedId === l.id ? (
                <Check className="w-4 h-4 text-indigo-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* 底部操作栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 relative">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 bg-transparent border border-white/10 transition-all hover:bg-white/5 hover:text-white active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          重置当日密码
        </button>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-xs text-slate-500">{saveStatus}</span>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 bg-white text-indigo-900 px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {saving ? "保存中..." : "保存当日密码"}
          </button>
        </div>
      </div>
    </section>
  );
}
