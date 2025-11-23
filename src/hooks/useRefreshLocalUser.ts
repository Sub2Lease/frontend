import { API_BASE, LOCAL_STORAGE_USER_KEY } from "../constants";
import { useCallback } from "react";
export function useRefreshLocalUser(userId: string) {
  const refresh = useCallback(async () => {
    const user = await fetch(`${API_BASE}/users?userId=${userId}`).then(res => res.json());
    if (!user || user.error) return;
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user[0]));
  }, [userId]);
  
  return refresh;
}