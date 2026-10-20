import React, { createContext, useContext, useEffect, useState } from "react";
import { pb, refreshAuth } from "../API/PocketBase";
import type { RecordModel } from "pocketbase";
import type { Role } from "../types/Role";
import { toRole } from "../types/Role";

interface AuthContextType {
  user: RecordModel | null;
  role: Role | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.model);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. При монтировании сверяем сессию с сервером — даже если токен уже
    //    просрочен по клиентским часам. Раньше просроченный токен просто
    //    пропускался, UI показал залогиненного пользователя, а все запросы
    //    падали с 401 (лечилось только logout + login).
    //    При 401/403/404 refreshAuth очистит стор; временный сетевой сбой
    //    сессию не закрывает (раньше любой сбой молча разлоганивал).
    async function initAuth() {
      if (pb.authStore.token) {
        await refreshAuth();
      }
      setIsLoading(false);
    }

    initAuth();

    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser(model);
    });

    return () => {
      unsubscribe(); // Отписка при размонтировании
    };
  }, []);

  const logout = () => pb.authStore.clear();

  // Роль лежит в поле `role` коллекции users; неизвестные значения → null
  const role = toRole(user?.role);

  return (
    <AuthContext.Provider value={{ user, role, isLoading, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
