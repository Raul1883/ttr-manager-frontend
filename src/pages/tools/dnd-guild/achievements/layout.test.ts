import { describe, expect, it } from "vitest";
import { layoutAchievements, NODE_HEIGHT, NODE_WIDTH } from "./layout";
import type { Achievement } from "./types";

const make = (id: string, parents: string[] = []): Achievement => ({
  id,
  title: id,
  description: "",
  reward: "",
  image: "★",
  parents,
});

describe("layoutAchievements", () => {
  it("раскладывает цепочку по возрастающим уровням", () => {
    const { nodes } = layoutAchievements([
      make("a"),
      make("b", ["a"]),
      make("c", ["b"]),
    ]);

    expect(nodes.map((node) => node.depth)).toEqual([0, 1, 2]);
    expect(nodes[1].y - nodes[0].y).toBeGreaterThan(NODE_HEIGHT);
    expect(nodes[0].x).toBe(nodes[1].x);
  });

  it("учитывает родителя из более глубокой строки", () => {
    const { nodes } = layoutAchievements([
      make("a"),
      make("b", ["a"]),
      make("c", ["a"]),
      make("d", ["b", "c"]),
    ]);

    expect(nodes.find((node) => node.id === "d")?.depth).toBe(2);
  });

  it("центрирует короткую строку относительно широкой", () => {
    const { nodes } = layoutAchievements([
      make("root"),
      make("a", ["root"]),
      make("b", ["root"]),
      make("c", ["root"]),
    ]);

    const root = nodes.find((node) => node.id === "root");
    const children = nodes.filter((node) => node.parents.includes("root"));

    expect(root).toBeDefined();
    expect(children).toHaveLength(3);
    expect(root!.x).toBeGreaterThan(children[0].x);
    expect(root!.x + NODE_WIDTH / 2).toBe(children[1].x + NODE_WIDTH / 2);
  });

  it("по умолчанию ставит одиночные достижения в одну строку", () => {
    const { nodes } = layoutAchievements([
      make("a"),
      make("b"),
      make("c"),
      make("d"),
    ]);

    expect(new Set(nodes.map((node) => node.y)).size).toBe(1);
  });

  it("переносит одиночные достижения в прямоугольник в режиме grid", () => {
    const items = ["a", "b", "c", "d", "e", "f"].map((id) => make(id));
    const { nodes } = layoutAchievements(items, {
      isolatedLayout: "grid",
      isolatedColumns: 3,
    });

    expect(nodes).toHaveLength(6);
    expect(new Set(nodes.map((node) => node.y)).size).toBe(2);
    expect(nodes[1].x - nodes[0].x).toBeGreaterThan(NODE_WIDTH);
    expect(nodes[3].x).toBe(nodes[0].x);
    expect(nodes[3].y).toBeGreaterThan(nodes[0].y);
  });

  it("возвращает размеры, достаточные для всех карточек", () => {
    const { width, height, nodes } = layoutAchievements([
      make("a"),
      make("b", ["a"]),
    ]);

    expect(width).toBeGreaterThanOrEqual(Math.max(...nodes.map((n) => n.x + NODE_WIDTH)));
    expect(height).toBeGreaterThanOrEqual(
      Math.max(...nodes.map((n) => n.y + NODE_HEIGHT)),
    );
  });
});
