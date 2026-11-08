import { useCallback, useState } from "react";
import { formatWeaponText } from "./format";
import type { WeaponResult } from "./types";

/**
 * История выкованных предметов и копирование статов.
 * Генерация и анимация живут отдельно — здесь только состояние списка.
 */
export function useWeaponGenerator() {
  const [history, setHistory] = useState<WeaponResult[]>([]);

  const commitWeapon = useCallback((item: WeaponResult) => {
    setHistory((prev) => [...prev, item]);
  }, []);

  const copyWeapon = useCallback(
    async (item: WeaponResult, index: number): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(formatWeaponText(item, index));
        return true;
      } catch (error) {
        console.error("Ошибка копирования:", error);
        return false;
      }
    },
    [],
  );

  return { history, commitWeapon, copyWeapon };
}
