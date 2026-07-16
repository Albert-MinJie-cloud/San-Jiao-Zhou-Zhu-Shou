import "dotenv/config";
import cors from "cors";
import express from "express";
import { router } from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
