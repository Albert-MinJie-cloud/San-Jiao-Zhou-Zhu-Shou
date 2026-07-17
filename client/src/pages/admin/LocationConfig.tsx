import { useState, useMemo, useRef } from "react";
import {
  MapPin,
  Plus,
  Save,
  Trash2,
  Search,
  Eye,
  X,
  Download,
  Upload,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import type { LocationConfig as LocationConfigType } from "@/types";
import { useToast } from "@/components/Toast";

interface LocationConfigProps {
  locations: LocationConfigType[];
  onAdd: () => void;
  onDelete: (loc: LocationConfigType) => void;
  onUpdate: (id: number, field: keyof LocationConfigType, value: string) => void;
  saving: boolean;
  hasUnsaved: boolean;
  onSave: () => void;
}

const inputCls =
  "w-full bg-[#0F0F13] border border-[#2A2A38] rounded-[6px] px-3 py-2 text-sm text-white outline-none transition-all duration-150 placeholder:text-[#787890]/50 focus:border-[#26C087]";

/** 地点配置区域 —— 管理地点名称/攻略/图床链接 */
export default function LocationConfig({
  locations,
  onAdd,
  onDelete,
  onUpdate,
  saving,
  hasUnsaved,
  onSave,
}: LocationConfigProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<LocationConfigType | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    const q = searchQuery.toLowerCase();
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.guide.toLowerCase().includes(q),
    );
  }, [locations, searchQuery]);

  const handleDelete = (loc: LocationConfigType) => {
    setDeleteConfirm(loc);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(locations, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "locations-config.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("地点配置已导出");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!Array.isArray(data)) throw new Error("格式错误");
        // 通过 API 逐个导入
        showToast("请使用「保存地点配置」手动保存导入数据", "error");
      } catch {
        showToast("导入文件格式无效", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <section className="bg-[#181820] border border-[#2A2A38] rounded-[6px] p-5 flex flex-col gap-5">
      {/* 标题区 */}
      <div className="flex items-center gap-2.5">
        <MapPin className="text-[#26C087] w-[18px] h-[18px]" />
        <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
          地点配置
          {hasUnsaved && (
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block animate-pulse" />
          )}
        </h2>
      </div>

      {/* 顶部操作栏：搜索 + 新增 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787890] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索地点名称..."
            className="pl-9 pr-3 py-2 bg-[#0F0F13] border border-[#2A2A38] rounded-[6px] text-sm text-white outline-none transition-all duration-150 focus:border-[#26C087] w-full placeholder:text-[#787890]/50"
          />
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-[#26C087] hover:bg-[#26C087]/90 text-white text-sm font-medium px-4 py-2 rounded-[6px] transition-all duration-150 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          新增地点
        </button>
      </div>

      {/* 列表区域 */}
      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <MapPin className="w-10 h-10 text-[#787890]/30" />
          <p className="text-sm text-[#787890]">
            还没有配置任何地点
          </p>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 text-[#26C087] text-sm font-medium hover:text-[#26C087]/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增第一个地点
          </button>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Search className="w-8 h-8 text-[#787890]/30" />
          <p className="text-sm text-[#787890]">未找到匹配的地点</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredLocations.map((l) => (
            <div
              key={l.id}
              className="bg-[#0F0F13] border border-[#2A2A38] rounded-[6px] p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start transition-all duration-150 hover:bg-[#0F0F13]/70 hover:border-[#2A2A38]/80 group"
            >
              {/* 地点名称（必填） */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#787890]">
                  地点名称 <span className="text-[#E65C5C]">*</span>
                </label>
                <input
                  type="text"
                  value={l.name}
                  onChange={(e) => onUpdate(l.id, "name", e.target.value)}
                  placeholder="必填"
                  className={inputCls}
                />
              </div>

              {/* 攻略 */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#787890]">位置攻略</label>
                <input
                  type="text"
                  value={l.guide}
                  onChange={(e) => onUpdate(l.id, "guide", e.target.value)}
                  placeholder="选填"
                  className={inputCls}
                />
              </div>

              {/* 图床链接 */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#787890]">图床链接</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={l.imageUrl}
                    onChange={(e) =>
                      onUpdate(l.id, "imageUrl", e.target.value)
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                  {l.imageUrl ? (
                    <>
                      <button
                        onClick={() => setPreviewUrl(l.imageUrl)}
                        title="预览图片"
                        className="shrink-0 w-8 h-8 rounded-[6px] flex items-center justify-center text-[#787890] hover:text-[#26C087] hover:bg-[#26C087]/10 transition-all duration-150"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onUpdate(l.id, "imageUrl", "")}
                        title="清空链接"
                        className="shrink-0 w-8 h-8 rounded-[6px] flex items-center justify-center text-[#787890] hover:text-[#E65C5C] hover:bg-[#E65C5C]/10 transition-all duration-150"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      title="无图片"
                      className="shrink-0 w-8 h-8 rounded-[6px] flex items-center justify-center text-[#787890] cursor-default"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 删除按钮 */}
              <button
                onClick={() => handleDelete(l)}
                title="删除地点"
                className="shrink-0 w-9 h-9 rounded-[6px] flex items-center justify-center text-[#787890] hover:text-[#E65C5C] hover:bg-[#E65C5C]/10 transition-all duration-150 self-end md:self-start mt-0 md:mt-5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 底部操作栏 */}
      {locations.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-sm font-medium text-[#787890] bg-[#0F0F13] border border-[#2A2A38] transition-all duration-150 hover:text-[#D0D0E0] hover:border-[#787890] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              导出
            </button>
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-sm font-medium text-[#787890] bg-[#0F0F13] border border-[#2A2A38] transition-all duration-150 hover:text-[#D0D0E0] hover:border-[#787890] cursor-pointer active:scale-[0.98]">
              <Upload className="w-4 h-4" />
              导入
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsaved && (
              <span className="flex items-center gap-1.5 text-xs text-orange-400">
                <AlertCircle className="w-3.5 h-3.5" />
                有未保存的修改
              </span>
            )}
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#26C087] hover:bg-[#26C087]/90 text-white font-medium px-6 py-2.5 rounded-[6px] text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              {saving ? "保存中..." : "保存地点配置"}
            </button>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#181820] border border-[#2A2A38] rounded-[6px] p-6 w-full max-w-sm mx-4 flex flex-col gap-5">
            <h3 className="text-base font-bold text-white">确认删除</h3>
            <p className="text-sm text-[#D0D0E0]">
              确定要删除「<span className="text-white font-medium">{deleteConfirm.name}</span>」吗？
              <br />
              该地点的所有历史密码也将一并删除，此操作不可撤销。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-[6px] text-sm font-medium text-[#787890] bg-[#0F0F13] border border-[#2A2A38] transition-all duration-150 hover:text-white hover:border-[#787890]"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-[6px] text-sm font-medium text-white bg-[#E65C5C] transition-all duration-150 hover:bg-[#E65C5C]/90 active:scale-[0.98]"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览弹窗 */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 cursor-pointer"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="max-w-lg max-h-[80vh] bg-[#181820] border border-[#2A2A38] rounded-[6px] p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewUrl}
              alt="预览"
              className="max-w-full max-h-[70vh] rounded object-contain"
              onError={() => {
                showToast("图片加载失败", "error");
                setPreviewUrl(null);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
