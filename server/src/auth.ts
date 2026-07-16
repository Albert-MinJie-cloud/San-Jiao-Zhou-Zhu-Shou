import type { NextFunction, Request, Response } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    res.status(500).json({ error: "服务端未配置 ADMIN_TOKEN" });
    return;
  }
  const header = req.headers.authorization ?? "";
  if (header !== `Bearer ${token}`) {
    res.status(401).json({ error: "密钥错误" });
    return;
  }
  next();
}
