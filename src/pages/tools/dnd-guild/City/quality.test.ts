import { describe, expect, it } from "vitest";
import { getQualityColor, QUALITY_GROUPS } from "./quality";
import type { ProductQuality } from "./quality";

const ALL_QUALITIES: ProductQuality[] = [
  "Обычный",
  "Необычный",
  "Редкий",
  "Очень редкий",
  "Легендарный",
  "Низкое",
  "Ниже среднего",
  "Среднее",
  "Хорошее",
  "Отличное",
  "Превосходное",
  "Легендарное",
];

describe("quality", () => {
  it("перечисляет каждое качество ровно один раз", () => {
    const values = QUALITY_GROUPS.flatMap((group) =>
      group.options.map((option) => option.value),
    );

    expect(values).toHaveLength(ALL_QUALITIES.length);
    expect(new Set(values)).toEqual(new Set(ALL_QUALITIES));
  });

  it("задаёт цвет для каждого качества", () => {
    for (const quality of ALL_QUALITIES) {
      expect(getQualityColor(quality)).toBeTruthy();
    }
  });
});
