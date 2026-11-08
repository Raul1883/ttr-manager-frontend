import { describe, expect, it } from "vitest";
import { parseWeaponCatalog } from "./catalog";

const RAW = [
  {
    id: "weapon",
    name: "Оружие",
    categories: [
      {
        id: "short_bladed",
        name: "Короткое клинковое",
        items: [
          {
            id: "knife",
            name: "Нож",
            damage: "1к4",
            properties: ["Легкое", "Метательное"],
            description: "Универсальный инструмент.",
          },
        ],
      },
      {
        id: "bows",
        name: "Луки",
        items: [
          {
            id: "shortbow",
            name: "Короткий лук",
            damage: "1к6",
            distance: "60/180",
            properties: [],
            description: "",
          },
        ],
      },
    ],
  },
  {
    id: "armor",
    name: "Броня",
    categories: [
      {
        id: "light",
        name: "Легкая броня",
        items: [
          {
            id: "leather",
            name: "Кожаная",
            ac: "11",
            properties: [],
            description: "Из вываренной кожи.",
          },
        ],
      },
    ],
  },
];

describe("parseWeaponCatalog", () => {
  it("разбирает группы, категории и предметы", () => {
    const groups = parseWeaponCatalog(RAW);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ id: "weapon", name: "Оружие" });
    expect(groups[0].categories[0].items[0]).toEqual({
      id: "knife",
      name: "Нож",
      description: "Универсальный инструмент.",
      properties: ["Легкое", "Метательное"],
      damage: "1к4",
      ac: undefined,
      distance: undefined,
    });
    expect(groups[1].categories[0].items[0].ac).toBe("11");
  });

  it("сохраняет серверный порядок групп и категорий", () => {
    const groups = parseWeaponCatalog(RAW);

    expect(groups.map((group) => group.id)).toEqual(["weapon", "armor"]);
    expect(groups[0].categories.map((category) => category.id)).toEqual([
      "short_bladed",
      "bows",
    ]);
  });

  it("не падает на неожиданном значении", () => {
    expect(parseWeaponCatalog(null)).toEqual([]);
    expect(parseWeaponCatalog("not a catalog")).toEqual([]);
    expect(parseWeaponCatalog({ groups: [] })).toEqual([]);
  });

  it("пропускает битые группы, категории и предметы", () => {
    const groups = parseWeaponCatalog([
      null,
      { id: "weapon", name: "Оружие", categories: [null, { id: "no-name" }] },
      {
        id: "armor",
        name: "Броня",
        categories: [
          {
            id: "light",
            name: "Легкая броня",
            items: [null, { name: "Без id" }, { id: "leather", name: "Кожаная" }],
          },
        ],
      },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].categories).toEqual([]);
    expect(groups[1].categories[0].items).toHaveLength(1);
    expect(groups[1].categories[0].items[0].id).toBe("leather");
  });

  it("фильтрует нестроковые и пустые свойства", () => {
    const groups = parseWeaponCatalog([
      {
        id: "weapon",
        name: "Оружие",
        categories: [
          {
            id: "short_bladed",
            name: "Короткое клинковое",
            items: [
              {
                id: "knife",
                name: "Нож",
                properties: ["Легкое", 42, "  ", null, "Метательное"],
              },
            ],
          },
        ],
      },
    ]);

    expect(groups[0].categories[0].items[0].properties).toEqual([
      "Легкое",
      "Метательное",
    ]);
  });
});
