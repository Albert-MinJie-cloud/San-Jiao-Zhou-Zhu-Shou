import type { ReactNode } from "react";
import { Crosshair } from "lucide-react";

interface NavBarProps {
  title: string;
  children?: ReactNode;
}

/** 通用顶部导航栏 */
export default function NavBar({ title, children }: NavBarProps) {
  return (
    <nav className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Crosshair className="text-emerald-400 w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-wider text-white">
            {title}
          </span>
        </div>
        {children}
      </div>
    </nav>
  );
}
