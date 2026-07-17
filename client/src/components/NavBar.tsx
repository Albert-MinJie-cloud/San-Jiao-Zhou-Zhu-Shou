import type { ReactNode } from "react";
import { Crosshair } from "lucide-react";

interface NavBarProps {
  title: string;
  children?: ReactNode;
}

/** 通用顶部导航栏 */
export default function NavBar({ title, children }: NavBarProps) {
  return (
    <nav className="border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
            <Crosshair className="text-indigo-500 w-5 h-5" />
          </div>
          <span className="font-semibold text-[16px] tracking-wider text-white">
            {title}
          </span>
        </div>
        {children}
      </div>
    </nav>
  );
}
