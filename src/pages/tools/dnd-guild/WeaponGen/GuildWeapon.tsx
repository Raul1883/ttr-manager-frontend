import { useState } from "react";
import MainLayout from "../../../../components/MainLayout";
import ForgeControls from "./ForgeControls";
import WeaponSlider from "./WeaponSlider";
import { QUALITY_META } from "./const";
import { generateWeapon } from "./gen";
import { useWeaponForge } from "./useWeaponForge";
import { useWeaponGenerator } from "./useWeaponGenerator";
import type { CatalogSelection, ForgeLevel } from "./types";
import "./generator.css";
import { Typography } from "antd";

export default function GuildWeapon() {
  const [lvl, setLvl] = useState<ForgeLevel>(1);
  const [name, setName] = useState("");
  const [blueprint, setBlueprint] = useState<CatalogSelection>();

  const { history, commitWeapon, copyWeapon } = useWeaponGenerator();
  const { phase, progress, strike, forge } = useWeaponForge();

  // Выбор в справочнике задаёт и название, и сведения об основе, которые
  // затем попадут в карточку результата и текст для копирования.
  const handleBlueprintSelect = (selection: CatalogSelection) => {
    setName(selection.item.name);
    setBlueprint(selection);
  };

  const handleForge = () => {
    if (phase !== "idle") return;

    // Статы известны заранее: по качеству выбираем, до какого процента
    // шкалы будут бить молот, а в историю предмет попадёт в конце анимации.
    const weapon = generateWeapon({ lvl, name, blueprint });
    forge(QUALITY_META[weapon.quality].progress, () => commitWeapon(weapon));
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto forge-container">
        <Typography.Title>Кузня</Typography.Title>

        <ForgeControls
          lvl={lvl}
          name={name}
          phase={phase}
          progress={progress}
          strike={strike}
          onLvlChange={setLvl}
          onNameChange={setName}
          onBlueprintSelect={handleBlueprintSelect}
          onForge={handleForge}
        />

        <WeaponSlider history={history} onCopy={copyWeapon} />
      </div>
    </MainLayout>
  );
}
