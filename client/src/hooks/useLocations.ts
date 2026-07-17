import { useState, useEffect } from "react";
import { getDaily } from "@/api/daily";
import { defaultLocations, localImages } from "@/constants/defaultData";
import type { LocationData } from "@/types";

/**
 * 管理地点数据 —— 优先从后端拉取，失败时使用 defaultLocations 兜底
 */
export function useLocations() {
  const [locations, setLocations] = useState<LocationData[]>(defaultLocations);
  const [dateLabel, setDateLabel] = useState(() => {
    const d = new Date();
    return `${d.getMonth() + 1}.${d.getDate()}`;
  });

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

  const updateLocation = (
    id: number,
    field: keyof LocationData,
    value: string,
  ) => {
    setLocations((locs) =>
      locs.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    );
  };

  return { locations, dateLabel, updateLocation };
}
