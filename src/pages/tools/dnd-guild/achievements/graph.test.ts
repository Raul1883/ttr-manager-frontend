import { describe, expect, it } from "vitest";
import { wouldCreateCycle } from "./graph";
import type { Achievement } from "./types";

const make = (id: string, parents: string[] = []): Achievement => ({
  id,
  title: id,
  description: "",
  reward: "",
  image: "★",
  parents,
});

describe("wouldCreateCycle", () => {
  const achievements = [make("a"), make("b", ["a"]), make("c", ["b"])];

  it("Запрещает ссылку на самого себя", () => {
    expect(wouldCreateCycle(achievements, "a", ["a"])).toBe(true);
  });

  it("Находит косвенный цикл", () => {
    expect(wouldCreateCycle(achievements, "a", ["c"])).toBe(true);
  });

  it("Пропускает корректную связь", () => {
    expect(wouldCreateCycle(achievements, "c", ["b"])).toBe(false);
  });

  it("Игнорирует неизвестные идентификаторы", () => {
    expect(wouldCreateCycle(achievements, "a", ["unknown"])).toBe(false);
  });
});
