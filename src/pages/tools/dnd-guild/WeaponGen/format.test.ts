import { describe, expect, it } from "vitest";
import { formatWeaponText } from "./format";
import type { WeaponResult } from "./types";

const weapon: WeaponResult = {
  quality: "Среднее (без свойств)",
  durability: 3,
  properties: [],
  name: "Меч",
};

describe("formatWeaponText", () => {
  it("склеивает название, прочность и качество", () => {
    expect(formatWeaponText(weapon, 0)).toBe(
      "Меч (3/3)\nСреднее (без свойств)",
    );
  });

  it("подставляет заглушку вместо пустого названия", () => {
    expect(formatWeaponText({ ...weapon, name: "" }, 2)).toBe(
      "Нечто #3 (3/3)\nСреднее (без свойств)",
    );
  });

  it("добавляет сведения об оружии из справочника", () => {
    const result = formatWeaponText(
      {
        ...weapon,
        name: "Длинный лук",
        blueprint: {
          item: {
            id: "longbow",
            name: "Длинный лук",
            description: "Высокий лук.",
            properties: ["Двуручное"],
            damage: "1к8К",
            distance: "150/600",
          },
          groupName: "Оружие",
          categoryName: "Луки",
        },
      },
      0,
    );

    expect(result).toBe(
      [
        "Длинный лук (3/3)",
        "Среднее (без свойств)",
        "Основа: Оружие · Луки",
        "Урон: 1к8К",
        "Дистанция: 150/600",
        "Свойства основы: Двуручное",
        "Высокий лук.",
      ].join("\n"),
    );
  });

  it("добавляет КД брони из справочника", () => {
    const result = formatWeaponText(
      {
        ...weapon,
        name: "Кожаная",
        blueprint: {
          item: {
            id: "leather",
            name: "Кожаная",
            description: "Из вываренной кожи.",
            properties: ["Поглощение(Р1)"],
            ac: "11 + Лов",
          },
          groupName: "Броня",
          categoryName: "Легкая броня",
        },
      },
      0,
    );

    expect(result).toContain("Основа: Броня · Легкая броня");
    expect(result).toContain("КД: 11 + Лов");
    expect(result).toContain("Свойства основы: Поглощение(Р1)");
  });

  it("добавляет каждое свойство отдельной строкой", () => {
    const result = formatWeaponText(
      {
        ...weapon,
        properties: [
          { title: "Прочный", description: "Хиты увеличены." },
          { title: "Лёгкое", description: "Вес вдвое меньше." },
        ],
      },
      0,
    );

    expect(result).toBe(
      "Меч (3/3)\nСреднее (без свойств)\nПрочный. Хиты увеличены.\nЛёгкое. Вес вдвое меньше.",
    );
  });
});
