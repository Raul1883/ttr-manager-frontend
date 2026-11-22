import { pb } from "../../../../API/PocketBase";
import { COLLECTIONS } from "../../../../API/collections";
import type { Character } from "../../../../types/Character";
import type {
  Achievement,
  AchievementApplicationRecord,
  AchievementGraphRecord,
  AchievementRecord,
  AchievementTree,
  CharacterAchievementRecord,
} from "./types";

/** Минимальные поля персонажа, нужные для выбора прогресса. */
export type AchievementCharacter = Pick<Character, "id" | "name" | "owner">;

export const fetchAchievementGraphs = () =>
  pb
    .collection(COLLECTIONS.achievementGraphs)
    .getFullList<AchievementGraphRecord>({ sort: "sort" });

export const fetchAchievements = () =>
  pb
    .collection(COLLECTIONS.achievements)
    .getFullList<AchievementRecord>({ sort: "sort" });

/** Персонажи, доступные текущему пользователю (правила PB: свой или master). */
export const fetchCharacters = () =>
  pb
    .collection(COLLECTIONS.characters)
    .getFullList<AchievementCharacter>({ sort: "name" });

export const fetchCharacterAchievements = (characterId: string) =>
  pb
    .collection(COLLECTIONS.characterAchievements)
    .getFullList<CharacterAchievementRecord>({
      filter: `character = "${characterId}"`,
    });

/** Мастеру нужны все заявки, игроку — только его (правила PB). */
export const fetchAchievementApplications = () =>
  pb
    .collection(COLLECTIONS.achievementApplications)
    .getFullList<AchievementApplicationRecord>({
      sort: "-created",
      expand: "character,achievement",
    });

export function toAchievement(record: AchievementRecord): Achievement {
  return {
    id: record.id,
    title: record.title,
    description: record.description ?? "",
    reward: record.reward ?? "",
    image: record.image || "⭐",
    parents: record.parents ?? [],
  };
}

export function toTrees(
  graphs: AchievementGraphRecord[],
  achievements: AchievementRecord[],
): AchievementTree[] {
  return graphs.map((graph) => ({
    id: graph.id,
    title: graph.title,
    description: graph.description ?? "",
    isolatedLayout: graph.isolated_layout === "grid" ? "grid" : "line",
    isolatedColumns: graph.isolated_columns ?? 3,
    achievements: achievements
      .filter((item) => item.graph === graph.id)
      .map(toAchievement),
  }));
}
