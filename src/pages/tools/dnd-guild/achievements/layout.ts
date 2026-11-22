import type { Achievement, AchievementTree } from "./types";

export const NODE_WIDTH = 300;
export const NODE_HEIGHT = 112;

const COLUMN_GAP = 72;
const ROW_GAP = 120;
const PADDING = 48;
const ISOLATED_GAP = 72;

export interface PositionedAchievement extends Achievement {
  /** Уровень в дереве: у корня 0, у ребёнка на один больше любого родителя. */
  depth: number;
  x: number;
  y: number;
}

export interface GraphLayout {
  nodes: PositionedAchievement[];
  width: number;
  height: number;
}

type IsolatedLayout = NonNullable<AchievementTree["isolatedLayout"]>;

export interface LayoutOptions {
  isolatedLayout?: IsolatedLayout;
  isolatedColumns?: number;
}

/**
 * Раскладывает достижения по строкам-поколениям. Уровень считаем как
 * наибольший путь от корня, поэтому один ребёнок может опираться на несколько
 * родителей из разных строк — связи просто протянутся через строку.
 * Одиночные достижения по умолчанию идут той же строкой, а в режиме grid
 * переносятся в прямоугольную сетку под основным графом.
 */
export function layoutAchievements(
  achievements: Achievement[],
  options: LayoutOptions = {},
): GraphLayout {
  const knownIds = new Set(achievements.map((item) => item.id));
  const depthById = new Map<string, number>(
    achievements.map((item) => [item.id, 0]),
  );

  // Relaxation по всем рёбрам: за один проход не всегда известны глубины
  // родителей, поэтому повторяем, пока ничего не изменится.
  for (let pass = 0; pass < achievements.length; pass++) {
    let changed = false;
    for (const item of achievements) {
      const parentDepths = item.parents
        .filter((id) => knownIds.has(id))
        .map((id) => (depthById.get(id) ?? 0) + 1);
      const depth = Math.max(0, ...parentDepths);
      if (depth > (depthById.get(item.id) ?? 0)) {
        depthById.set(item.id, depth);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const parentIds = new Set(achievements.flatMap((item) => item.parents));
  const isolated = achievements.filter(
    (item) => item.parents.length === 0 && !parentIds.has(item.id),
  );
  const isolatedIds = new Set(isolated.map((item) => item.id));
  const gridIsolated = options.isolatedLayout === "grid";

  const byDepth = new Map<number, Achievement[]>();
  for (const item of achievements) {
    if (gridIsolated && isolatedIds.has(item.id)) continue;
    const depth = depthById.get(item.id) ?? 0;
    const row = byDepth.get(depth) ?? [];
    row.push(item);
    byDepth.set(depth, row);
  }

  const maxPerRow = Math.max(
    1,
    ...[...byDepth.values()].map((row) => row.length),
  );
  const stepX = NODE_WIDTH + COLUMN_GAP;
  const stepY = NODE_HEIGHT + ROW_GAP;
  const nodes: PositionedAchievement[] = [];

  for (const [depth, row] of byDepth) {
    // Центрируем каждую строку относительно самой широкой — граф симметричен.
    const offset = ((maxPerRow - row.length) * stepX) / 2;
    row.forEach((item, index) => {
      nodes.push({
        ...item,
        depth,
        x: PADDING + offset + index * stepX,
        y: PADDING + depth * stepY,
      });
    });
  }

  if (gridIsolated && isolated.length > 0) {
    const columns = Math.max(1, options.isolatedColumns ?? 3);
    const maxDepth = byDepth.size > 0 ? Math.max(...byDepth.keys()) : -1;
    const startY =
      PADDING +
      (maxDepth + 1) * stepY +
      (maxDepth >= 0 ? ISOLATED_GAP : 0);

    isolated.forEach((item, index) => {
      nodes.push({
        ...item,
        depth: 0,
        x: PADDING + (index % columns) * stepX,
        y: startY + Math.floor(index / columns) * stepY,
      });
    });
  }

  nodes.sort((a, b) => a.y - b.y || a.x - b.x);

  const maxX = Math.max(PADDING, ...nodes.map((node) => node.x + NODE_WIDTH));
  const maxY = Math.max(PADDING, ...nodes.map((node) => node.y + NODE_HEIGHT));

  return { nodes, width: maxX + PADDING, height: maxY + PADDING };
}
