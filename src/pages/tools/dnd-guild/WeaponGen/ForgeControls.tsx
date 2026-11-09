import { useState } from "react";
import { FORGE_LEVELS, toForgeLevel } from "./const";
import type { CatalogSelection, ForgeLevel, ForgePhase } from "./types";
import ForgeProgressBar from "./ForgeProgressBar";
import BlueprintPicker from "./BlueprintPicker";
import imgLevel0 from "../../../../assets/weapon-gen/forge-level-0.svg";
import imgLevel1 from "../../../../assets/weapon-gen/forge-level-1.svg";
import imgLevel2 from "../../../../assets/weapon-gen/forge-level-2.svg";
import imgLevel3 from "../../../../assets/weapon-gen/forge-level-3.svg";
import imgLevel4 from "../../../../assets/weapon-gen/forge-level-4.svg";
import imgLevel5 from "../../../../assets/weapon-gen/forge-level-5.svg";

import shortSword from "../../../../assets/weapon-gen/short-bladed.svg";
import midSword from "../../../../assets/weapon-gen/medium-bladed.svg";
import longSword from "../../../../assets/weapon-gen/long-bladed.svg";
import bow from "../../../../assets/weapon-gen/bow.svg";
import crossbow from "../../../../assets/weapon-gen/crossbow.svg";
import firearm from "../../../../assets/weapon-gen/gunshot.svg";
import shortPolearm from "../../../../assets/weapon-gen/short-polearm.svg";
import longPolearm from "../../../../assets/weapon-gen/long-polearm.svg";

import bar from "../../../../assets/weapon-gen/select.svg";
import { Typography } from "antd";

interface ForgeControlsProps {
  lvl: ForgeLevel;
  name: string;
  phase: ForgePhase;
  progress: number;
  strike: number;
  onLvlChange: (lvl: ForgeLevel) => void;
  onNameChange: (name: string) => void;
  onBlueprintSelect: (selection: CatalogSelection) => void;
  onForge: () => void;
}

// Иллюстрация кузнеца для каждого уровня — ключи совпадают с FORGE_LEVELS,
// поэтому пропущенный уровень ловится типами.
const LEVEL_IMAGE: Record<ForgeLevel, string> = {
  0: imgLevel0,
  1: imgLevel1,
  2: imgLevel2,
  3: imgLevel3,
  4: imgLevel4,
  5: imgLevel5,
};

const GROUP_IMAGE: Record<string, string> = {
  "Короткое древковое": shortPolearm,
  "Длинное древковое": longPolearm,
  "Короткое клинковое": shortSword,
  "Среднее клинковое": midSword,
  "Длинное клинковое": longSword,
  Луки: bow,
  Арбалеты: crossbow,
  "Огнестрельное оружие": firearm,
  "Легкая броня": longSword,
  "Средняя броня": longSword,
  "Пластинчатая и латная броня (Тяжелая)": longSword,
  Шлема: longSword,
  Щиты: longSword,
};

export default function ForgeControls({
  lvl,
  name,
  phase,
  progress,
  strike,
  onLvlChange,
  onNameChange,
  onBlueprintSelect,
  onForge,
}: ForgeControlsProps) {
  const isBusy = phase !== "idle";
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("");
  const levelLabel =
    FORGE_LEVELS.find((level) => level.value === lvl)?.label ?? "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
      <div
        className={`forge-card flex flex-col ${phase === "striking" ? "anim-bump-down" : ""}`}
        style={{ animationDelay: "200ms" }}
      >
        <Typography.Title level={4}>Уровень кузнеца</Typography.Title>

        <img
          className="max-h-48 w-full object-contain mb-3"
          src={LEVEL_IMAGE[lvl]}
          alt={`Кузнец: ${levelLabel}`}
        />

        <select
          id="forge-level"
          value={lvl}
          disabled={isBusy}
          onChange={(event) => onLvlChange(toForgeLevel(event.target.value))}
          className="forge-input"
        >
          {FORGE_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`blueprint-card justify-between forge-card flex flex-col ${phase === "striking" ? "anim-bump-left" : ""}`}
        style={{ animationDelay: "100ms" }}
      >
        <Typography.Title level={4}>Чертеж</Typography.Title>

        <button
          type="button"
          className="blueprint-trigger"
          onClick={() => setIsPickerOpen(true)}
          disabled={isBusy}
          aria-haspopup="dialog"
          aria-label="Выбрать чертеж из справочника"
        >
          <img
            className={`block max-h-32 w-full object-contain ${phase === "result" || phase === "forging" ? "anim-rotate-item" : ""}`}
            src={GROUP_IMAGE[currentCategory] || bar}
            alt={`Категория: ${currentCategory}`}
          />
        </button>

        <input
          id="forge-name"
          type="text"
          value={name}
          disabled={isBusy}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Например: Железный меч"
          className="forge-input"
        />

        {isPickerOpen && (
          <BlueprintPicker
            onClose={() => setIsPickerOpen(false)}
            onSelect={(selection) => {
              onBlueprintSelect(selection);
              setCurrentCategory(selection.categoryName);
              setIsPickerOpen(false);
            }}
          />
        )}
      </div>

      <div
        className={`forge-card forge-card-empty flex flex-col items-center justify-between gap-4 ${phase === "striking" ? "anim-strike" : ""}`}
      >
        <Typography.Title level={4}>Создание</Typography.Title>

        <ForgeProgressBar progress={progress} strikeTrigger={strike} />

        <button
          type="button"
          onClick={onForge}
          disabled={isBusy}
          className="forge-button"
        >
          {isBusy ? "Поковка..." : "Ковать"}
        </button>
      </div>
    </div>
  );
}
