import { Download, Crosshair, Calendar, ImageIcon, MapPin } from "lucide-react";
import type { LocationData } from "@/types";

interface LocationCardProps {
  loc: LocationData;
  isExporting: boolean;
  onUpdate: (id: number, field: keyof LocationData, value: string) => void;
  onImageUpload: (id: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: (elementId: string, filename: string) => void;
}

/** 单个地点编辑卡片 —— 可编辑文字、上传截图、下载图片 */
export default function LocationCard({
  loc,
  isExporting,
  onUpdate,
  onImageUpload,
  onDownload,
}: LocationCardProps) {
  return (
    <div className="w-full max-w-[400px] flex flex-col gap-4">
      {/* Card Container - 3:4 portrait ratio */}
      <div
        id={`card-${loc.id}`}
        className="relative w-full aspect-[3/4] bg-[#12141a] overflow-hidden shadow-2xl flex flex-col items-center justify-between border border-neutral-800/50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, #1e2430 0%, #12141a 70%)",
        }}
      >
        {/* Top Section */}
        <div className="w-full pt-5 px-5 flex flex-col items-center z-10 flex-shrink-0">
          <div className="flex w-full justify-between items-center mb-4">
            <span className="text-sm font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
              <Crosshair className="w-4 h-4" />
              三角洲行动
            </span>
            <span className="text-sm font-bold tracking-widest text-emerald-400 font-mono flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString().replace(/\//g, ".")}
            </span>
          </div>

          <div className="w-full flex justify-between pb-5 mb-3">
            <div className="flex flex-col w-[60%]">
              <div className="flex items-center gap-2 mb-2 h-4">
                <div className="w-1.5 h-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-neutral-400 text-[11px] font-mono tracking-widest uppercase">
                  Location / 地点
                </span>
              </div>
              <div className="h-16 flex items-center w-full">
                <textarea
                  value={loc.location}
                  onChange={(e) => onUpdate(loc.id, "location", e.target.value)}
                  className="bg-transparent text-[1.75rem] leading-[1.2] font-black text-white outline-none w-full placeholder-neutral-700 tracking-tight resize-none overflow-hidden block"
                  placeholder="地点名称"
                  rows={
                    loc.location.includes("\n") || loc.location.length > 8
                      ? 2
                      : 1
                  }
                />
              </div>
            </div>
            <div className="flex flex-col items-end w-[35%]">
              <div className="flex items-center mb-2 h-4">
                <span className="text-neutral-500 text-[11px] font-mono tracking-widest uppercase">
                  密码
                </span>
              </div>
              <div className="h-16 flex items-center w-full">
                <div className="h-12 bg-neutral-900/60 border border-neutral-800/80 rounded w-full flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                  <input
                    type="text"
                    value={loc.password}
                    onChange={(e) =>
                      onUpdate(loc.id, "password", e.target.value)
                    }
                    className="bg-transparent text-3xl font-mono font-bold text-emerald-400 text-center outline-none w-full tracking-widest"
                    style={{
                      textShadow: "0 0 15px rgba(16, 185, 129, 0.6)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section (Image) */}
        <div className="w-full px-4 flex-1 flex flex-col relative z-10 mb-4 min-h-0">
          <label
            className={`relative w-full h-full overflow-hidden cursor-pointer group transition-all flex items-center justify-center ${loc.image ? "shadow-2xl" : "bg-neutral-900/80 border border-neutral-700/50 hover:border-emerald-500/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]"}`}
          >
            {loc.image ? (
              <img
                src={loc.image}
                alt="Location Map"
                className="relative w-full h-full object-contain z-10 shadow-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-600 group-hover:text-emerald-500/80 transition-colors z-10">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs tracking-wider">点击上传位置截图</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImageUpload(loc.id, e)}
            />

            {!loc.image && (
              <>
                <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-emerald-500/70 opacity-80" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-emerald-500/70 opacity-80" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-emerald-500/70 opacity-80" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-emerald-500/70 opacity-80" />
              </>
            )}
          </label>
        </div>

        {/* Bottom Section (Guide) */}
        <div className="w-full pb-6 pt-0 px-5 z-10 flex-shrink-0">
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl px-4 py-3 w-full flex items-center gap-3 relative shadow-sm group min-h-[64px]">
            <MapPin className="text-emerald-500/80 w-5 h-5 shrink-0" />
            <textarea
              value={loc.guide}
              onChange={(e) => onUpdate(loc.id, "guide", e.target.value)}
              rows={loc.guide.length > 18 || loc.guide.includes("\n") ? 2 : 1}
              className="bg-transparent text-neutral-300 text-sm leading-snug outline-none w-full resize-none group-hover:text-white transition-colors flex-1 block mt-0.5"
              placeholder="输入具体位置引导..."
            />
          </div>
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

      {/* Action Buttons */}
      <button
        onClick={() => onDownload(`card-${loc.id}`, loc.location)}
        disabled={isExporting}
        className="w-full bg-neutral-800 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {isExporting ? "导出中..." : "下载无水印原图"}
      </button>
    </div>
  );
}
