import type { ReactNode } from "react";
import { Crosshair } from "lucide-react";

interface NavBarProps {
  title: string;
  children?: ReactNode;
}

/** 通用顶部导航栏 */
export default function NavBar({ title, children }: NavBarProps) {
  return (
    <nav className="border-b border-[#2A2A38] bg-[#0F0F13]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-150">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#26C087]/10 flex items-center justify-center border border-[#26C087]/20">
            <Crosshair className="text-[#26C087] w-5 h-5" />
          </div>
          <span className="font-bold text-[16px] tracking-wider text-white">
            {title}
          </span>
        </div>
        {children}
      </div>
    </nav>
  );
}
