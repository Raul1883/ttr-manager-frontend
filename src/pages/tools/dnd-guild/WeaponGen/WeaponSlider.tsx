import type { WeaponResult } from "./types";
import WeaponResultCard from "./WeaponResultCard";

interface WeaponSliderProps {
  history: WeaponResult[];
  onCopy: (weapon: WeaponResult, index: number) => Promise<boolean>;
}

/**
 * Горизонтальный «конвейер» результатов: нулевой экран — плейсхолдер,
 * дальше по одному экрану на каждый выкованный предмет.
 */
export default function WeaponSlider({ history, onCopy }: WeaponSliderProps) {
  const activeIndex = history.length;

  return (
    <div className="slider-viewport">
      <div
        className="slider-track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        <div
          className={`slider-pane ${activeIndex === 0 ? "active" : "inactive"}`}
        >
          <div className="forge-result-card forge-result-card--placeholder flex flex-col items-center justify-center">
            <p className="forge-desc text-center text-lg opacity-60">
              Выберите параметры и нажмите «Создать», чтобы создать предмет.
            </p>
          </div>
        </div>

        {history.map((weapon, index) => (
          <div
            key={index}
            className={`slider-pane ${activeIndex === index + 1 ? "active" : "inactive"}`}
          >
            <WeaponResultCard weapon={weapon} index={index} onCopy={onCopy} />
          </div>
        ))}
      </div>
    </div>
  );
}
