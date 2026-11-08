import { afterEach, describe, expect, it, vi } from "vitest";
import {
  advantages,
  disadvantages,
  FORGE_LEVELS,
  PROBABILITY_MATRIX,
  QUALITY_META,
} from "./const";
import { generateWeapon } from "./gen";
import type { QualityTier } from "./types";

const LEVELS = FORGE_LEVELS.map((level) => level.value);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateWeapon", () => {
  it("при минимальном рандоме берёт первое качество уровня", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const weapon = generateWeapon({ lvl: 0, name: "Меч" });

    expect(weapon.quality).toBe("Низкое (2 недостатка)");
    expect(weapon.durability).toBe(2);
    expect(weapon.properties).toHaveLength(2);
    for (const property of weapon.properties) {
      expect(disadvantages).toContainEqual(property);
    }
  });

  it("при максимальном рандоме берёт последнее качество уровня", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);

    const weapon = generateWeapon({ lvl: 0, name: "Меч" });

    expect(weapon.quality).toBe("Ниже среднего (1 недостаток)");
    expect(weapon.properties).toHaveLength(1);
    expect(disadvantages).toContainEqual(weapon.properties[0]);
  });

  it("обрезает пробелы в названии", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(generateWeapon({ lvl: 1, name: "  Железный меч  " }).name).toBe(
      "Железный меч",
    );
  });

  it("переносит выбранную основу в результат", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const blueprint = {
      item: {
        id: "longsword",
        name: "Длинный меч",
        description: "Клинок.",
        properties: ["Фехтовальное"],
        damage: "1к8Р",
      },
      groupName: "Оружие",
      categoryName: "Длинное клинковое",
    };

    const weapon = generateWeapon({ lvl: 1, name: "Длинный меч", blueprint });

    expect(weapon.blueprint).toBe(blueprint);
  });

  it("для любого уровня и качества соблюдает прочность и правила свойств", () => {
    for (const lvl of LEVELS) {
      for (let i = 0; i < 300; i++) {
        const weapon = generateWeapon({ lvl, name: "" });
        const meta = QUALITY_META[weapon.quality];
        const rule = meta.properties;

        expect(weapon.durability).toBe(meta.durability);
        expect(weapon.properties).toHaveLength(rule ? rule.count : 0);

        const pool = rule?.pool === "advantages" ? advantages : disadvantages;
        for (const property of weapon.properties) {
          expect(pool).toContainEqual(property);
        }

        const titles = weapon.properties.map((property) => property.title);
        expect(new Set(titles).size).toBe(titles.length);
      }
    }
  });

  it("содержит метаданные для каждого качества из таблицы вероятностей", () => {
    for (const lvl of LEVELS) {
      const qualities = Object.keys(PROBABILITY_MATRIX[lvl]) as QualityTier[];
      expect(qualities.length).toBeGreaterThan(0);

      for (const quality of qualities) {
        expect(QUALITY_META[quality]).toBeDefined();
        expect(QUALITY_META[quality].progress).toBeGreaterThan(0);
        expect(QUALITY_META[quality].progress).toBeLessThanOrEqual(100);
      }
    }
  });
});
