import { Button, Space, Divider } from "antd";

// Иконки Ant Design
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  TableOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

// Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useEffect } from "react";

// --- 1. КОМПОНЕНТ РЕДАКТОРА ---
export const TiptapMarkdownEditor = ({
  value = "",
  onChange,
}: {
  value?: string;
  onChange?: (val: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      // Добавляем расширения для таблиц
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const markdown = (editor.storage as any).markdown.getMarkdown();
      onChange?.(markdown);
    },
  });

  useEffect(() => {
    if (editor && value) {
      const currentMarkdown = (editor.storage as any).markdown.getMarkdown();
      if (value !== currentMarkdown) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Панель инструментов */}
      <div className="bg-gray-50 border-b border-gray-200 p-2">
        <Space wrap>
          <Button
            type={editor.isActive("bold") ? "primary" : "default"}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <Button
            type={editor.isActive("italic") ? "primary" : "default"}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <Button
            type={editor.isActive("strike") ? "primary" : "default"}
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <Button
            type={
              editor.isActive("heading", { level: 1 }) ? "primary" : "default"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            H1
          </Button>
          <Button
            type={
              editor.isActive("heading", { level: 2 }) ? "primary" : "default"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </Button>
          <Button
            type={
              editor.isActive("heading", { level: 3 }) ? "primary" : "default"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            H3
          </Button>
          <Button
            type={editor.isActive("bulletList") ? "primary" : "default"}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <Button
            type={editor.isActive("orderedList") ? "primary" : "default"}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />

          <Divider type="vertical" />

          {/* Кнопка создания таблицы */}
          <Button
            icon={<TableOutlined />}
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            title="Вставить таблицу"
          />

          {/* Управление таблицей (показываем только если курсор внутри таблицы) */}
          {editor.isActive("table") && (
            <Space.Compact>
              <Button
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                + Столбец
              </Button>
              <Button
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                + Строка
              </Button>
              <Button
                danger
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="Удалить столбец"
              >
                - Столбец
              </Button>
              <Button
                danger
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="Удалить строку"
              >
                - Строка
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Удалить таблицу полностью"
              />
            </Space.Compact>
          )}
        </Space>
      </div>

      {/* Поле ввода */}
      <div
        className="p-4 min-h-75 cursor-text markdown-body"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} className="outline-none" />
      </div>
    </div>
  );
};
