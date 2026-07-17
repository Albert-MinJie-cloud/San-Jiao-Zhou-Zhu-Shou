import { useState, useCallback, useEffect } from "react";
import { getLocations } from "@/api/admin";

const TOKEN_KEY = "admin_token";

/**
 * 管理后台登录状态 —— 从 localStorage 恢复 token 并校验
 */
export function useAuth() {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) ?? "",
  );
  const [authed, setAuthed] = useState(false);

  const handleAuthError = useCallback((err: unknown) => {
    if ((err as { status?: number }).status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setAuthed(false);
      return true;
    }
    return false;
  }, []);

  // 有 token 时尝试拉取地点配置来验证密钥
  useEffect(() => {
    if (!token) return;
    getLocations(token)
      .then(() => setAuthed(true))
      .catch((err) => {
        handleAuthError(err);
      });
  }, [token, handleAuthError]);

  const login = (input: string) => {
    const t = input.trim();
    if (!t) return;
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setAuthed(false);
  };

  return { token, authed, login, logout, handleAuthError };
}
