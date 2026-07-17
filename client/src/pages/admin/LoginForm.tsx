import { KeyRound } from "lucide-react";

interface LoginFormProps {
  tokenInput: string;
  onTokenInput: (value: string) => void;
  onLogin: () => void;
  message: string;
}

/** 管理员登录表单 */
export default function LoginForm({
  tokenInput,
  onTokenInput,
  onLogin,
  message,
}: LoginFormProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-300 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* 装饰光晕 */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-3 relative">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
            <KeyRound className="text-indigo-500 w-6 h-6" />
          </div>
          <span className="font-semibold text-xl text-white">管理员登录</span>
        </div>

        <div className="flex flex-col gap-1.5 relative">
          <label className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">
            管理密钥
          </label>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => onTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLogin()}
            placeholder="输入管理密钥"
            className="w-full rounded-xl border border-white/10 bg-[#141417] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            autoFocus
          />
        </div>

        <button
          onClick={onLogin}
          className="w-full bg-white text-indigo-900 px-6 py-3 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-[0.98] relative"
        >
          登 录
        </button>

        {message && (
          <p className="text-sm text-red-400 text-center bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
