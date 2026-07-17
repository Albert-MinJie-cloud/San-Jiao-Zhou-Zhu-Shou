import { MapPin, Plus, Save, Trash2 } from "lucide-react";
import type { LocationConfig as LocationConfigType } from "@/types";

interface LocationConfigProps {
  locations: LocationConfigType[];
  onAdd: () => void;
  onDelete: (loc: LocationConfigType) => void;
  onUpdate: (id: number, field: keyof LocationConfigType, value: string) => void;
  saving: boolean;
  onSave: () => void;
}

const inputCls =
  "bg-neutral-900/80 border border-neutral-700/50 rounded px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/60 w-full";

/** 地点配置区域 —— 管理地点名称/攻略/图床链接 */
export default function LocationConfig({
  locations,
  onAdd,
  onDelete,
  onUpdate,
  saving,
  onSave,
}: LocationConfigProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="text-emerald-500 w-5 h-5" />
          地点配置（名称 / 攻略 / 图床链接）
        </h2>
        <button
          onClick={onAdd}
          className="bg-neutral-800 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增地点
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {locations.map((l) => (
          <div
            key={l.id}
            className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-[10rem_1fr_1fr_4rem_2.5rem] gap-3 items-center"
          >
            <input
              type="text"
              value={l.name}
              onChange={(e) => onUpdate(l.id, "name", e.target.value)}
              placeholder="地点名称"
              className={inputCls}
            />
            <input
              type="text"
              value={l.guide}
              onChange={(e) => onUpdate(l.id, "guide", e.target.value)}
              placeholder="位置攻略"
              className={inputCls}
            />
            <input
              type="text"
              value={l.imageUrl}
              onChange={(e) => onUpdate(l.id, "imageUrl", e.target.value)}
              placeholder="图床图片链接 https://..."
              className={inputCls}
            />
            <div className="w-16 h-10 bg-black rounded overflow-hidden flex items-center justify-center border border-neutral-800">
              {l.imageUrl ? (
                <img
                  src={l.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-neutral-700 text-[10px]">无图</span>
              )}
            </div>
            <button
              onClick={() => onDelete(l)}
              title="删除地点"
              className="w-9 h-9 rounded flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors justify-self-end"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className="self-start bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? "保存中..." : "保存地点配置"}
      </button>
    </section>
  );
}
