import { describe, it, expect } from "vitest";
import { buildAntdTree } from "./treeBuilder";
import type { WikiRecord } from "./types";

// Фикстура: минимально валидная запись вики
function record(partial: Partial<WikiRecord>): WikiRecord {
  return {
    id: "id-" + partial.slug,
    title: partial.title ?? partial.slug!,
    slug: partial.slug!,
    content: "",
    isFolder: partial.isFolder ?? false,
    created: "",
    updated: "",
  };
}

describe("buildAntdTree", () => {
  it("плоские записи дают плоский список", () => {
    const tree = buildAntdTree([
      record({ slug: "Город", title: "Город" }),
      record({ slug: "Оружие", title: "Оружие" }),
    ]);

    expect(tree.map((n) => n.key)).toEqual(["id-Город", "id-Оружие"]);
    expect(tree.every((n) => n.isLeaf)).toBe(true);
  });

  it("вложенные slug собираются в иерархию", () => {
    const tree = buildAntdTree([
      record({ slug: "История", title: "История", isFolder: true }),
      record({ slug: "История/Война", title: "Война" }),
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].title).toBe("История");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children?.[0]).toMatchObject({ title: "Война", isLeaf: true });
  });

  it("папки идут перед статьями, внутри — по алфавиту", () => {
    const tree = buildAntdTree([
      record({ slug: "Бета", title: "Бета" }),
      record({ slug: "Альфа", title: "Альфа" }),
      record({ slug: "Папка", title: "Папка", isFolder: true }),
    ]);

    expect(tree.map((n) => n.title)).toEqual(["Папка", "Альфа", "Бета"]);
  });

  it("пустой список даёт пустое дерево", () => {
    expect(buildAntdTree([])).toEqual([]);
  });
});
