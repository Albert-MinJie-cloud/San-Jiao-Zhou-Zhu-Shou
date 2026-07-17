import { Download, Crosshair, Calendar, ImageIcon } from "lucide-react";
import type { LocationData } from "@/types";

interface SummaryCardProps {
  dateLabel: string;
  locations: LocationData[];
  isExporting: boolean;
  onDownload: (elementId: string, filename: string) => void;
}

/** 合集总览卡片 —— 展示所有地点密码的汇总图 */
export default function SummaryCard({
  dateLabel,
  locations,
  isExporting,
  onDownload,
}: SummaryCardProps) {
  return (
    <div className="w-full max-w-[400px] flex flex-col gap-4">
      <div
        id="card-summary"
        className="relative w-full aspect-[3/4] bg-[#12141a] overflow-hidden shadow-2xl flex flex-col items-center justify-between border border-neutral-800/50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, #1e2430 0%, #12141a 70%)",
        }}
      >
        {/* Top Section */}
        <div className="w-full pt-4 px-5 flex flex-col items-center z-10 flex-shrink-0">
          <div className="flex w-full justify-between items-center mb-2">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5" />
              三角洲行动
            </span>
            <span className="text-xs font-bold tracking-widest text-emerald-400 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString().replace(/\//g, ".")}
            </span>
          </div>

          <div className="w-full flex justify-between pb-1">
            <div className="flex flex-col">
              <div className="h-8 flex items-center">
                <span className="text-2xl leading-none font-black tracking-tight">
                  <span
                    className="text-emerald-400 mr-1.5"
                    style={{
                      textShadow: "0 0 15px rgba(16, 185, 129, 0.6)",
                    }}
                  >
                    {dateLabel}
                  </span>
                  <span className="text-white">当天密码合集</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div
          className="w-full pt-1.5 px-4 pb-4 flex-1 min-h-0 grid grid-cols-2 gap-x-2 gap-y-2.5 z-10"
          style={{
            gridTemplateRows: `repeat(${Math.max(1, Math.ceil(locations.length / 2))}, minmax(0, 1fr))`,
          }}
        >
          {locations.map((loc, index) => (
            <div
              key={`summary-${loc.id}`}
              className="bg-neutral-900/80 border border-neutral-700/50 rounded-lg overflow-hidden flex flex-col relative shadow-sm group"
            >
              <div className="absolute top-0 left-0 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-br-lg z-20">
                {index + 1}
              </div>
              <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {loc.image ? (
                  <img
                    src={loc.image}
                    alt=""
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="w-4 h-4 text-neutral-700" />
                  </div>
                )}
              </div>
              <div className="bg-neutral-800/90 flex items-center justify-between px-2 py-1 border-t border-neutral-700/50 h-7">
                <span className="text-white font-bold text-[10px] truncate pr-1.5">
                  {loc.location || "未知地点"}
                </span>
                <span className="text-emerald-400 font-mono font-bold text-[12px] tracking-wider leading-none drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] whitespace-nowrap">
                  {loc.password || "----"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Grid Background Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <button
        onClick={() => onDownload("card-summary", "概览图")}
        disabled={isExporting}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
      >
        <Download className="w-4 h-4" />
        {isExporting ? "导出中..." : "下载合集长图"}
      </button>
    </div>
  );
}
