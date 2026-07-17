import { useState, useCallback } from "react";
import { toJpeg } from "html-to-image";
import { Crosshair } from "lucide-react";
import { useLocations } from "@/hooks/useLocations";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SummaryCard from "@/components/SummaryCard";
import LocationCard from "@/components/LocationCard";

/** 桌面端导航链接 */
function NavLinks() {
  return (
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
  );
}

/** 移动端汉堡菜单按钮 */
function Hamburger() {
  return (
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
  );
}

export default function Home() {
  const { locations, dateLabel, updateLocation } = useLocations();
  const [isExporting, setIsExporting] = useState(false);

  const handleImageUpload = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateLocation(id, "image", event.target?.result as string);
    };
    reader.readAsDataURL(file);
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
          style: { transform: "none" },
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
      <NavBar title="三角洲行动助手">
        <NavLinks />
        <Hamburger />
      </NavBar>

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

          {/* 合集总览卡片 */}
          <div className="flex flex-col items-center mb-12 w-full">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Crosshair className="text-emerald-500 w-5 h-5" />
              生成每日密码合集
            </h2>
            <SummaryCard
              dateLabel={dateLabel}
              locations={locations}
              isExporting={isExporting}
              onDownload={downloadCard}
            />
          </div>

          {/* 单个地点卡片 */}
          <div className="flex items-center justify-center mb-8 w-full">
            <h2 className="text-xl font-bold text-neutral-300">
              填写详细位置信息
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {locations.map((loc) => (
              <LocationCard
                key={loc.id}
                loc={loc}
                isExporting={isExporting}
                onUpdate={updateLocation}
                onImageUpload={handleImageUpload}
                onDownload={downloadCard}
              />
            ))}
          </div>

          <Footer />
        </div>
      </main>
    </div>
  );
}
