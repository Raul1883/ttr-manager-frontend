/** Статус узла: neutral — гость без прогресса, locked/unlocked — для игрока. */
export type AchievementStatus = "neutral" | "locked" | "unlocked";

/** Одно достижение в графе. parents — идентификаторы предыдущих achievement-ов. */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  reward: string;
  /** URL картинки либо emoji-заглушка (для прототипа). */
  image: string;
  parents: string[];
}

/** Набор достижений, между которыми переключаются кнопками над графом. */
export interface AchievementTree {
  id: string;
  title: string;
  description: string;
  achievements: Achievement[];
  /**
   * Раскладка одиночных (без родителей и детей) достижений:
   * line — одной строкой, grid — с переносом в прямоугольник.
   */
  isolatedLayout?: "line" | "grid";
  /** Число колонок в режиме grid. */
  isolatedColumns?: number;
}

/** Запись коллекции achievement_graphs. */
export interface AchievementGraphRecord {
  id: string;
  title: string;
  description?: string;
  isolated_layout?: "line" | "grid";
  isolated_columns?: number | null;
  sort?: number | null;
}

/** Запись коллекции achievements. */
export interface AchievementRecord {
  id: string;
  graph: string;
  title: string;
  description?: string;
  reward?: string;
  image?: string;
  parents?: string[];
  sort?: number | null;
}

/** Запись коллекции character_achievements — прогресс конкретного персонажа. */
export interface CharacterAchievementRecord {
  id: string;
  character: string;
  achievement: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export type AchievementApplicationStatus = "pending" | "approved" | "rejected";

/** Запись коллекции achievement_applications — заявка на achievement. */
export interface AchievementApplicationRecord {
  id: string;
  character: string;
  achievement: string;
  comment?: string;
  status: AchievementApplicationStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created?: string;
  /** PB раскрывает связи при expand=character,achievement. */
  expand?: {
    character?: { id: string; name: string };
    achievement?: { id: string; title: string };
  };
}
