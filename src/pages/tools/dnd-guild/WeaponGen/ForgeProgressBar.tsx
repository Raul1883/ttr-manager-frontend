import { useEffect, useRef } from "react";

interface ForgeProgressBarProps {
  progress: number; // От 0 до 100
  strikeTrigger: number; // Счетчик ударов (меняется, чтобы запустить эффект тряски)
}

/** Радиус и толщина кольца в системе координат viewBox (0 0 100 100). */
const RADIUS = 42;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ForgeProgressBar({
  progress,
  strikeTrigger,
}: ForgeProgressBarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const percent = Math.min(100, Math.max(0, Math.round(progress)));
  // Заполнение кольца по тому же правилу, что и у полосы: доля от 100%.
  const dashOffset = CIRCUMFERENCE * (1 - percent / 100);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element || strikeTrigger === 0) return;

    // Перезапуск CSS-анимации: снять класс, форсировать reflow, навесить снова.
    // Чтение размеров заставляет браузер применить стили — иначе повторное
    // добавление того же класса не запустит анимацию заново.
    element.classList.remove("anim-shake");
    element.getBoundingClientRect();
    element.classList.add("anim-shake");
  }, [strikeTrigger]);

  return (
    <div
      ref={wrapperRef}
      className="forge-progress-ring-wrapper"
      onAnimationEnd={(event) =>
        event.currentTarget.classList.remove("anim-shake")
      }
    >
      <svg
        className="forge-progress-ring"
        viewBox="0 0 100 100"
        role="progressbar"
        aria-label="Прогресс ковки"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <circle
          className="forge-progress-ring-track"
          cx="50"
          cy="50"
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          className="forge-progress-ring-fill"
          cx="50"
          cy="50"
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 50 50)"
        />
      </svg>

      <span className="forge-progress-value">{percent}%</span>
    </div>
  );
}
