import { describe, it, expect } from "vitest";
import type { Root, Paragraph } from "mdast";
import { remarkWikiLinks } from "./remarkWikiLinks";

// Хелпер: запускает трансформер плагина на текстовом узле и возвращает детей
function transformText(value: string) {
  const tree: Root = {
    type: "root",
    children: [{ type: "paragraph", children: [{ type: "text", value }] }],
  };

  const transformer = remarkWikiLinks();
  transformer(tree);

  const paragraph = tree.children[0] as Paragraph;
  return paragraph.children;
}

describe("remarkWikiLinks", () => {
  it("простая ссылка [[Имя]] заменяется на ссылку с тем же отображаемым текстом", () => {
    const children = transformText("См. [[Город]] для деталей");

    expect(children).toEqual([
      { type: "text", value: "См. " },
      {
        type: "link",
        url: `/tools/wiki/${encodeURIComponent("Город")}`,
        children: [{ type: "text", value: "Город" }],
      },
      { type: "text", value: " для деталей" },
    ]);
  });

  it("алиас [[Путь/Статья|Текст]] — url из пути, отображение из алиаса", () => {
    const children = transformText("[[История/Война|события]]");

    expect(children).toEqual([
      {
        type: "link",
        url: `/tools/wiki/${encodeURIComponent("История/Война")}`,
        children: [{ type: "text", value: "события" }],
      },
    ]);
  });

  it("несколько ссылок в одном узле обрабатываются по очереди", () => {
    const children = transformText("[[Первое]] и [[Второе]]");

    expect(children).toHaveLength(3);
    expect(children[0]).toMatchObject({ type: "link" });
    expect(children[1]).toEqual({ type: "text", value: " и " });
    expect(children[2]).toMatchObject({ type: "link" });
  });

  it("текст без ссылок остаётся без изменений", () => {
    const children = transformText("обычный текст без разметки");

    expect(children).toEqual([
      { type: "text", value: "обычный текст без разметки" },
    ]);
  });

  it("незакрытая скобка [[ не создаёт ссылку", () => {
    const children = transformText("скобка [[открыта, но не закрыта");

    expect(children).toEqual([
      { type: "text", value: "скобка [[открыта, но не закрыта" },
    ]);
  });
});
