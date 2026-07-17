import { KeyRound } from "lucide-react";

interface LoginFormProps {
  tokenInput: string;
  onTokenInput: (value: string) => void;
  onLogin: () => void;
  message: string;
}

const inputCls =
  "bg-neutral-900/80 border border-neutral-700/50 rounded px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/60 w-full";

/** 管理员登录表单 */
export default function LoginForm({
  tokenInput,
  onTokenInput,
  onLogin,
  message,
}: LoginFormProps) {
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
          onChange={(e) => onTokenInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin()}
          placeholder="输入管理密钥"
          className={inputCls}
        />
        <button
          onClick={onLogin}
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
