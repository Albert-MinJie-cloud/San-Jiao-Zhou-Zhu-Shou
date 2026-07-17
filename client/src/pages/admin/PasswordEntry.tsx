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
  "w-full bg-transparent border border-[#2A2A38]/50 rounded-[6px] px-3 py-2 text-sm text-white outline-none transition-all duration-150 focus:border-[#26C087] placeholder:text-[#787890]/50";

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
    <section className="bg-[#181820] border border-[#2A2A38] rounded-[6px] p-5 flex flex-col gap-5">
      {/* 标题区 */}
      <div className="flex items-center gap-2.5">
        <ScanSearch className="text-[#26C087] w-[18px] h-[18px]" />
        <h2 className="text-[16px] font-bold text-white">每日密码录入</h2>
      </div>

      {/* 顶部操作栏：左侧日期 + 今日 + 历史，右侧上传 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787890] pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="pl-8 pr-3 py-2 bg-[#0F0F13] border border-[#2A2A38] rounded-[6px] text-sm text-white outline-none transition-all duration-150 focus:border-[#26C087] w-[150px]"
            />
          </div>
          <button
            onClick={() => onDateChange(today)}
            className={`px-3 py-2 rounded-[6px] text-xs font-medium transition-all duration-150 ${
              date === today
                ? "bg-[#26C087]/10 text-[#26C087] border border-[#26C087]/30"
                : "bg-[#0F0F13] text-[#787890] border border-[#2A2A38] hover:text-white hover:border-[#787890]"
            }`}
          >
            今日
          </button>
          {history.length > 0 && (
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#787890]" />
              <select
                value={history.includes(date) ? date : ""}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="bg-[#0F0F13] border border-[#2A2A38] rounded-[6px] px-3 py-2 text-sm text-[#D0D0E0] outline-none transition-all duration-150 focus:border-[#26C087] cursor-pointer"
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

        <label className="cursor-pointer bg-[#26C087] hover:bg-[#26C087]/90 text-white text-sm font-medium px-4 py-2 rounded-[6px] flex items-center gap-2 transition-all duration-150 active:scale-[0.98]">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {locations.map((l) => (
          <div
            key={l.id}
            className="bg-[#0F0F13] border border-[#2A2A38] rounded-[6px] p-4 flex items-center justify-between gap-3 transition-all duration-150 hover:border-[#26C087]/40 hover:bg-[#0F0F13]/80 group"
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
                className="bg-transparent border-b border-[#2A2A38] focus:border-[#26C087] text-[#26C087] font-mono font-bold text-[16px] tracking-widest outline-none transition-all duration-150 w-full py-0.5 placeholder:text-[#787890]/30"
              />
            </div>
            <button
              onClick={() => handleCopy(l.id, passwords[l.id] ?? "")}
              disabled={!passwords[l.id]}
              title="复制密码"
              className="shrink-0 w-9 h-9 rounded-[6px] flex items-center justify-center text-[#787890] hover:text-[#26C087] hover:bg-[#26C087]/10 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {copiedId === l.id ? (
                <Check className="w-4 h-4 text-[#26C087]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* 底部操作栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-sm font-medium text-[#787890] bg-[#0F0F13] border border-[#2A2A38] transition-all duration-150 hover:text-[#D0D0E0] hover:border-[#787890] active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          重置当日密码
        </button>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-xs text-[#787890]">{saveStatus}</span>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#26C087] hover:bg-[#26C087]/90 text-white font-medium px-6 py-2.5 rounded-[6px] text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {saving ? "保存中..." : "保存当日密码"}
          </button>
        </div>
      </div>
    </section>
  );
}
