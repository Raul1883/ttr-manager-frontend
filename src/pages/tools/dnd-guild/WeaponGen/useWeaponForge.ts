import { useCallback, useEffect, useRef, useState } from "react";
import { FORGE_STRIKES, FORGE_TIMELINE } from "./const";
import type { ForgePhase } from "./types";

/**
 * Машина состояний анимации ковки: idle → striking → forging → result → idle.
 * Все таймеры хранятся в ref и снимаются при размонтировании, иначе после
 * ухода со страницы они продолжали бы дёргать setState.
 */
export function useWeaponForge() {
  const [phase, setPhase] = useState<ForgePhase>("idle");
  const [progress, setProgress] = useState(0);
  const [strike, setStrike] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const running = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    // Снимаем таймеры при размонтировании: без этого они продолжали бы
    // дёргать setState уже после ухода со страницы.
    return clearTimers;
  }, [clearTimers]);

  const forge = useCallback(
    (targetPercent: number, onForged: () => void) => {
      if (running.current) return;
      running.current = true;

      const schedule = (delay: number, action: () => void) => {
        timers.current.push(setTimeout(action, delay));
      };

      setPhase("striking");
      setProgress(0);
      setStrike(0);

      const {
        strikeTravel,
        firstStrikeDelay,
        strikeInterval,
        resultDelay,
        idleDelay,
      } = FORGE_TIMELINE;

      // Импульс дошёл до шкалы — начинаем ковку.
      schedule(strikeTravel, () => setPhase("forging"));

      // Удары молота заполняют шкалу до целевого качества.
      for (let i = 1; i <= FORGE_STRIKES; i++) {
        schedule(strikeTravel + firstStrikeDelay + (i - 1) * strikeInterval, () => {
          setProgress((targetPercent * i) / FORGE_STRIKES);
          setStrike(i);
        });
      }

      const lastStrikeAt =
        strikeTravel + firstStrikeDelay + (FORGE_STRIKES - 1) * strikeInterval;

      // Показываем результат (в историю предмет попадает здесь же).
      schedule(lastStrikeAt + resultDelay, () => {
        onForged();
        setPhase("result");
      });

      // Возвращаемся в исходное состояние, чтобы можно было ковать снова.
      schedule(lastStrikeAt + resultDelay + idleDelay, () => {
        setPhase("idle");
        setStrike(0);
        running.current = false;
        clearTimers();
      });
    },
    [clearTimers],
  );

  return { phase, progress, strike, forge };
}
