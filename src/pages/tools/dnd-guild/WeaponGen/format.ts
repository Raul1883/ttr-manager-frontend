import type { WeaponResult } from "./types";

/**
 * Текст для буфера обмена. Чистая функция, чтобы формат можно было
 * проверить тестом и не дублировать в компоненте.
 */
export function formatWeaponText(item: WeaponResult, index: number): string {
  const title = item.name.trim() || `Нечто #${index + 1}`;
  const properties = item.properties
    .map((property) => `${property.title}. ${property.description}`)
    .join("\n");

  const blueprint = item.blueprint;
  const blueprintLines = blueprint
    ? [
        `Основа: ${blueprint.groupName} · ${blueprint.categoryName}`,
        blueprint.item.damage ? `Урон: ${blueprint.item.damage}` : "",
        blueprint.item.ac ? `КД: ${blueprint.item.ac}` : "",
        blueprint.item.distance
          ? `Дистанция: ${blueprint.item.distance}`
          : "",
        blueprint.item.properties.length > 0
          ? `Свойства основы: ${blueprint.item.properties.join(", ")}`
          : "",
        blueprint.item.description,
      ].filter(Boolean)
    : [];

  return [
    `${title} (${item.durability}/${item.durability})`,
    item.quality,
    ...blueprintLines,
    properties,
  ]
    .filter(Boolean)
    .join("\n");
}
