import type { Product } from "./types";

export type ProductQuality = Product["quality"];

export interface QualityOption {
  value: ProductQuality;
  label: string;
}

// Качества в данных перемешаны: часть описывает редкость предмета,
// часть — его состояние. В форме показываем их отдельными группами,
// чтобы мастер не путался в плоском списке из 12 значений.
export const QUALITY_GROUPS: { label: string; options: QualityOption[] }[] = [
  {
    label: "Редкость предмета",
    options: [
      { value: "Обычный", label: "Обычный" },
      { value: "Необычный", label: "Необычный" },
      { value: "Редкий", label: "Редкий" },
      { value: "Очень редкий", label: "Очень редкий" },
      { value: "Легендарный", label: "Легендарный" },
    ],
  },
  {
    label: "Состояние предмета",
    options: [
      { value: "Низкое", label: "Низкое" },
      { value: "Ниже среднего", label: "Ниже среднего" },
      { value: "Среднее", label: "Среднее" },
      { value: "Хорошее", label: "Хорошее" },
      { value: "Отличное", label: "Отличное" },
      { value: "Превосходное", label: "Превосходное" },
      { value: "Легендарное", label: "Легендарное" },
    ],
  },
];

const QUALITY_COLORS: Record<ProductQuality, string> = {
  Обычный: "default",
  Необычный: "green",
  Редкий: "blue",
  "Очень редкий": "purple",
  Легендарный: "gold",
  Низкое: "#ff7875",
  "Ниже среднего": "#ff9c6e",
  Среднее: "green",
  Хорошее: "#262626",
  Отличное: "blue",
  Превосходное: "purple",
  Легендарное: "gold",
};

export const getQualityColor = (quality: ProductQuality): string =>
  QUALITY_COLORS[quality] ?? "default";
