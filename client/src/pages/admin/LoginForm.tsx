import { KeyRound } from "lucide-react";

interface LoginFormProps {
  tokenInput: string;
  onTokenInput: (value: string) => void;
  onLogin: () => void;
  message: string;
}

const inputCls =
  "w-full bg-[#181820] border border-[#2A2A38] rounded-[6px] px-4 py-3 text-sm text-white outline-none transition-all duration-150 placeholder:text-[#787890] focus:border-[#26C087]";

/** 管理员登录表单 */
export default function LoginForm({
  tokenInput,
  onTokenInput,
  onLogin,
  message,
}: LoginFormProps) {
  return (
    <div className="min-h-screen bg-[#0F0F13] text-[#D0D0E0] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#181820] border border-[#2A2A38] rounded-[6px] p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2.5 justify-center">
          <div className="w-9 h-9 rounded-[6px] bg-[#26C087]/10 flex items-center justify-center border border-[#26C087]/20">
            <KeyRound className="text-[#26C087] w-[18px] h-[18px]" />
          </div>
          <span className="font-bold text-[18px] text-white">管理员登录</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#787890]">管理密钥</label>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => onTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLogin()}
            placeholder="输入管理密钥"
            className={inputCls}
            autoFocus
          />
        </div>

        <button
          onClick={onLogin}
          className="w-full bg-[#26C087] hover:bg-[#26C087]/90 text-white font-medium py-3 rounded-[6px] text-sm transition-all duration-150 active:scale-[0.98]"
        >
          登 录
        </button>

        {message && (
          <p className="text-sm text-[#E65C5C] text-center bg-[#E65C5C]/5 border border-[#E65C5C]/20 rounded-[6px] px-4 py-2.5">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
