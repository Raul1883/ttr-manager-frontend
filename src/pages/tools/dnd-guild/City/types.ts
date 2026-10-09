export interface CityRecord {
  id: string;
  name: string;
  level: number;
  description: string;
  image: string;
}

export interface BuildingData {
  id: string;
  name: string;
  level: number;
  description: string;
  img?: string;
  products?: Product[];
}

export interface Product {
  cost: number;
  description: string;
  name: string;
  quality:
    | "Обычный"
    | "Необычный"
    | "Редкий"
    | "Очень редкий"
    | "Легендарный"
    | "Низкое"
    | "Ниже среднего"
    | "Среднее"
    | "Хорошее"
    | "Отличное"
    | "Превосходное"
    | "Легендарное";
  count: number;
}
