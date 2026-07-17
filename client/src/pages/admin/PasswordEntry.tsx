import {
  History,
  Loader2,
  Save,
  ScanSearch,
  Upload,
} from "lucide-react";
import type { LocationConfig } from "@/types";

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
  onSave: () => void;
}

const inputCls =
  "bg-neutral-900/80 border border-neutral-700/50 rounded px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/60 w-full";

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
  onSave,
}: PasswordEntryProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <ScanSearch className="text-emerald-500 w-5 h-5" />
        每日密码录入
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className={`${inputCls} w-auto`}
        />
        {history.length > 0 && (
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-neutral-500" />
            <select
              value={history.includes(date) ? date : ""}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
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
            onChange={onRecognize}
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
              onChange={(e) => onPasswordChange(l.id, e.target.value)}
              placeholder="----"
              className="bg-transparent border-b border-neutral-700 focus:border-emerald-500 text-emerald-400 font-mono font-bold text-xl tracking-widest text-center outline-none w-28"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="self-start bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? "保存中..." : "保存当日密码"}
      </button>
    </section>
  );
}
