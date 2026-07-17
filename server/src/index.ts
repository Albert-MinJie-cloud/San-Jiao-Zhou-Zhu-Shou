import "dotenv/config";
import cors from "cors";
import express from "express";
import { setGlobalDispatcher, ProxyAgent } from "undici";
import { router } from "./routes.js";

// 如果配置了 HTTPS_PROXY 或 HTTP_PROXY，全局应用代理（用于 Gemini API 等外网请求）
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) {
  try {
    setGlobalDispatcher(new ProxyAgent(proxyUrl));
    console.log(`[proxy] 已配置代理: ${proxyUrl}`);
  } catch (err) {
    console.warn(`[proxy] 代理配置失败: ${err}`);
  }
}

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
