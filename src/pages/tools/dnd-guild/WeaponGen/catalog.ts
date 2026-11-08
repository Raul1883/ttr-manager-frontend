import type { CatalogCategory, CatalogGroup, CatalogItem } from "./types";

/** Имя константы в `tools_const`, где лежит JSON со справочником предметов. */
export const WEAPON_ITEMS_CONST = "weapon_gen_items";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.map((entry) => asString(entry)).filter(Boolean);
};

const parseItem = (raw: unknown): CatalogItem | null => {
  if (!isRecord(raw)) return null;

  const id = asString(raw.id);
  const name = asString(raw.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    description: asString(raw.description),
    properties: asStringArray(raw.properties),
    damage: asString(raw.damage) || undefined,
    ac: asString(raw.ac) || undefined,
    distance: asString(raw.distance) || undefined,
  };
};

const parseCategory = (raw: unknown): CatalogCategory | null => {
  if (!isRecord(raw)) return null;

  const id = asString(raw.id);
  const name = asString(raw.name);
  if (!id || !name) return null;

  const items = Array.isArray(raw.items)
    ? raw.items
        .map(parseItem)
        .filter((item): item is CatalogItem => item !== null)
    : [];

  return { id, name, items };
};

/**
 * Приводит `json_value` из `tools_const` к типизированному справочнику.
 * Данные приходят из админки PB, поэтому парсер защитный: битые группы,
 * категории и предметы пропускаются, а не роняют страницу.
 */
export function parseWeaponCatalog(raw: unknown): CatalogGroup[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((rawGroup): CatalogGroup | null => {
      if (!isRecord(rawGroup)) return null;

      const id = asString(rawGroup.id);
      const name = asString(rawGroup.name);
      if (!id || !name) return null;

      const categories = Array.isArray(rawGroup.categories)
        ? rawGroup.categories
            .map(parseCategory)
            .filter((category): category is CatalogCategory => category !== null)
        : [];

      return { id, name, categories };
    })
    .filter((group): group is CatalogGroup => group !== null);
}
