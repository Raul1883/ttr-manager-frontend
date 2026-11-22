import type { Achievement } from "./types";

/**
 * Проверяет, создаст ли назначение родителей цикл. Обходим ссылки родителей
 * в глубину: если от любого выбранного родителя достижим сам редактируемый
 * узел — связь недопустима.
 */
export function wouldCreateCycle(
  achievements: Achievement[],
  id: string,
  parents: string[],
): boolean {
  const byId = new Map(achievements.map((item) => [item.id, item]));
  const stack = [...parents];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current === id) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    stack.push(...(byId.get(current)?.parents ?? []));
  }

  return false;
}
