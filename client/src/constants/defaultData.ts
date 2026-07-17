import img1 from "@/assets/01.png";
import img2 from "@/assets/02.png";
import img3 from "@/assets/03.png";
import img4 from "@/assets/04.png";
import img5 from "@/assets/05.png";
import img6 from "@/assets/06.jpg";
import type { LocationData } from "@/types";

/** 本地兜底图片，API 未返回 imageUrl 时使用 */
export const localImages = [img1, img2, img3, img4, img5, img6];

/** 默认地点数据，API 不可用时的兜底 */
export const defaultLocations: LocationData[] = [
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
