import {
  PROBABILITY_MATRIX,
  QUALITY_META,
  advantages,
  disadvantages,
} from "./const";
import type {
  ForgeLevel,
  GenFormData,
  QualityTier,
  WeaponResult,
} from "./types";

/** Выбор элемента с заданными весами (аналог random.choices). */
function weightedRandom<T>(
  items: readonly T[],
  weightOf: (item: T) => number,
): T {
  const total = items.reduce((acc, item) => acc + weightOf(item), 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= weightOf(item);
    if (rand <= 0) return item;
  }
  // Страховка от погрешности округления: последний элемент всегда валиден.
  return items[items.length - 1];
}

/** Перемешивание массива (Fisher–Yates) для выборки без повторений. */
function shuffle<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Взять N случайных уникальных элементов из массива. */
function sampleN<T>(array: readonly T[], n: number): T[] {
  if (n <= 0) return [];
  return shuffle(array).slice(0, Math.min(n, array.length));
}

function pickQuality(lvl: ForgeLevel): QualityTier {
  const weights = PROBABILITY_MATRIX[lvl];
  const qualities = Object.keys(weights) as QualityTier[];
  return weightedRandom(qualities, (quality) => weights[quality] ?? 0);
}

export function generateWeapon({
  lvl,
  name,
  blueprint,
}: GenFormData): WeaponResult {
  const quality = pickQuality(lvl);
  const meta = QUALITY_META[quality];

  const rule = meta.properties;
  const pool = rule?.pool === "advantages" ? advantages : disadvantages;
  const properties = rule ? sampleN(pool, rule.count) : [];

  return {
    quality,
    durability: meta.durability,
    properties,
    name: name.trim(),
    blueprint,
  };
}
