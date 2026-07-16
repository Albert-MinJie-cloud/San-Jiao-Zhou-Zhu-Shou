import React, { useState, useCallback, useEffect } from "react";
import { toJpeg } from "html-to-image";
import {
  Download,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Crosshair,
} from "lucide-react";
import { getDaily } from "../api";
import img1 from "@/assets/01.png";
import img2 from "@/assets/02.png";
import img3 from "@/assets/03.png";
import img4 from "@/assets/04.png";
import img5 from "@/assets/05.png";
import img6 from "@/assets/06.jpg";

const localImages = [img1, img2, img3, img4, img5, img6];

interface LocationData {
  id: number;
  location: string;
  password: string;
  guide: string;
  image: string | null;
}

const defaultData: LocationData[] = [
  {
    id: 1,
    location: "零号大坝",
    password: "0327",
    guide: "主变电站右侧，进入地下管道后匍匐到通道尽头处",
    image: img1,
  },
  {
    id: 2,
    location: "长弓溪谷",
    password: "4786",
    guide: "地图右下角标点附近地下入口",
    image: img2,
  },
  {
    id: 3,
    location: "巴克什",
    password: "6988",
    guide: "大浴场北侧",
    image: img3,
  },
  {
    id: 4,
    location: "航天基地",
    password: "3097",
    guide: "工业区组装室2楼",
    image: img4,
  },
  {
    id: 5,
    location: "潮汐监狱",
    password: "0423",
    guide: "监狱行政区1楼大厅楼梯拐角处",
    image: img5,
  },
  {
    id: 6,
    location: "AZ3",
    password: "4025",
    guide: "核电站海水处理区地下-泄漏房角落",
    image: img6,
  },
];

export default function Home() {
  const [locations, setLocations] = useState<LocationData[]>(defaultData);
  const [isExporting, setIsExporting] = useState(false);
  const [dateLabel, setDateLabel] = useState(() => {
    const d = new Date();
    return `${d.getMonth() + 1}.${d.getDate()}`;
  });

  // 从后端拉取最新一天的密码数据，失败时保留本地 defaultData 兜底
  useEffect(() => {
    getDaily()
      .then((data) => {
        if (!data.entries.length) return;
        setLocations(
          data.entries.map((e, i) => ({
            id: e.id,
            location: e.name,
            password: e.password,
            guide: e.guide,
            image: e.imageUrl || localImages[i] || null,
          })),
        );
        if (data.date) {
          const [, m, d] = data.date.split("-");
          setDateLabel(`${Number(m)}.${Number(d)}`);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdate = (
    id: number,
    field: keyof LocationData,
    value: string,
  ) => {
    setLocations((locs) =>
      locs.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    );
  };

  const handleImageUpload = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleUpdate(id, "image", event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCard = useCallback(
    async (elementId: string, filenameLabel: string) => {
      const node = document.getElementById(elementId);
      if (!node) return;

      setIsExporting(true);
      try {
        const dataUrl = await toJpeg(node, {
          quality: 0.95,
          pixelRatio: 3,
          style: {
            transform: "none",
          },
        });

        const link = document.createElement("a");
        link.download = `今日密码-${filenameLabel}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to export image", err);
        alert("导出失败，请重试");
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-emerald-500/30 flex flex-col">
      {/* Navigation Bar */}
      <nav className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Crosshair className="text-emerald-400 w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-wider text-white">
              三角洲行动助手
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
            <a href="#" className="hover:text-emerald-400 transition-colors">
              密码生成器
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              攻略地图
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              关于我们
            </a>
          </div>
          <button className="md:hidden text-neutral-400 hover:text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 text-center md:text-left mt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center md:justify-start gap-3">
              小红书游戏笔记生成器
            </h1>
            <p className="text-neutral-400 max-w-2xl">
              在线一键生成高质量 3:4
              比例《三角洲行动》每日密码攻略图。直接点击卡片中的文字或图片即可轻松修改内容，支持无水印原图下载。
            </p>
          </header>

          <div className="flex flex-col items-center mb-12 w-full">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Crosshair className="text-emerald-500 w-5 h-5" />
              生成每日密码合集
            </h2>
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

                {/* Content Section - 按地点数量自适应的两列网格 */}
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
                      {/* Image Area */}
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
                      {/* Text Area */}
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
                ></div>
              </div>

              <button
                onClick={() => downloadCard("card-summary", "概览图")}
                disabled={isExporting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "导出中..." : "下载合集长图"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center mb-8 w-full">
            <h2 className="text-xl font-bold text-neutral-300">
              填写详细位置信息
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="w-full max-w-[400px] flex flex-col gap-4"
              >
                {/* Card Container - 3:4 portrait ratio for Xiaohongshu */}
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
                          <div className="w-1.5 h-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                          <span className="text-neutral-400 text-[11px] font-mono tracking-widest uppercase">
                            Location / 地点
                          </span>
                        </div>
                        <div className="h-16 flex items-center w-full">
                          <textarea
                            value={loc.location}
                            onChange={(e) =>
                              handleUpdate(loc.id, "location", e.target.value)
                            }
                            className="bg-transparent text-[1.75rem] leading-[1.2] font-black text-white outline-none w-full placeholder-neutral-700 tracking-tight resize-none overflow-hidden block"
                            placeholder="地点名称"
                            rows={
                              loc.location.includes("\n") ||
                              loc.location.length > 8
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
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                            <input
                              type="text"
                              value={loc.password}
                              onChange={(e) =>
                                handleUpdate(loc.id, "password", e.target.value)
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
                          <span className="text-xs tracking-wider">
                            点击上传位置截图
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(loc.id, e)}
                      />

                      {!loc.image && (
                        <>
                          {/* Decorative UI elements for the image frame */}
                          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-emerald-500/70 opacity-80"></div>
                          <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-emerald-500/70 opacity-80"></div>
                          <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-emerald-500/70 opacity-80"></div>
                          <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-emerald-500/70 opacity-80"></div>
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
                        onChange={(e) =>
                          handleUpdate(loc.id, "guide", e.target.value)
                        }
                        rows={
                          loc.guide.length > 18 || loc.guide.includes("\n")
                            ? 2
                            : 1
                        }
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
                  ></div>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => downloadCard(`card-${loc.id}`, loc.location)}
                  disabled={isExporting}
                  className="w-full bg-neutral-800 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? "导出中..." : "下载无水印原图"}
                </button>
              </div>
            ))}
          </div>

          <footer className="mt-20 border-t border-neutral-800/60 pt-8 pb-12 flex flex-col md:flex-row items-center justify-between text-neutral-500 text-sm gap-4">
            <p>
              © {new Date().getFullYear()} 三角洲行动助手.
              工具仅供游戏交流使用。
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                隐私政策
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                用户协议
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                联系反馈
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
