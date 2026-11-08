/** Уровень кузнеца — ключ строки в таблице вероятностей. */
export type ForgeLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Название качества предмета. Строка целиком — это и подпись в интерфейсе,
 * и ключ таблиц в `const.ts`, поэтому опечатка в одном месте ловится типами.
 */
export type QualityTier =
  | "Низкое (2 недостатка)"
  | "Ниже среднего (1 недостаток)"
  | "Среднее (без свойств)"
  | "Хорошее (1 преимущество)"
  | "Отличное (Качество +1, 1 преимущество)"
  | "Превосходное (+1, 2 преимущества)"
  | "Легендарное (+2, 2 преимущества)";

/** Свойство предмета из таблиц преимуществ/недостатков. */
export interface WeaponProperty {
  title: string;
  description: string;
}

export interface GenFormData {
  lvl: ForgeLevel;
  name: string;
  /** Основа, выбранная в справочнике; без неё генерируется абстрактный предмет. */
  blueprint?: CatalogSelection;
}

export interface WeaponResult {
  quality: QualityTier;
  durability: number;
  properties: WeaponProperty[];
  name: string;
  /** Сведения о выбранной основе — попадают в карточку результата. */
  blueprint?: CatalogSelection;
}

/** Фазы анимации ковки: простой → импульс по карточкам → удары → результат. */
export type ForgePhase = "idle" | "striking" | "forging" | "result";

/** Предмет из справочника `weapon_gen_items` (коллекция `tools_const`). */
export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  properties: string[];
  /** Урон — только у оружия. */
  damage?: string;
  /** Класс доспеха — только у брони. */
  ac?: string;
  /** Дистанция — у луков, арбалетов и огнестрела. */
  distance?: string;
}

/** Выбранный предмет вместе с местом в справочнике. */
export interface CatalogSelection {
  item: CatalogItem;
  groupName: string;
  categoryName: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  items: CatalogItem[];
}

/** Группа справочника: «Оружие» или «Броня». */
export interface CatalogGroup {
  id: string;
  name: string;
  categories: CatalogCategory[];
}
