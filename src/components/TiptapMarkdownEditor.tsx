import { Button, Space } from "antd";

// Иконки Ant Design
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

// Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { useEffect } from "react";

// --- 1. КОМПОНЕНТ РЕДАКТОРА ---
// Ant Design Form автоматически передает value и onChange в кастомные компоненты
export const TiptapMarkdownEditor = ({
  value = "",
  onChange,
}: {
  value?: string;
  onChange?: (val: string) => void;
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: value,
    onUpdate: ({ editor }) => {
      // Обходим строгость TS через as any
      const markdown = (editor.storage as any).markdown.getMarkdown();
      onChange?.(markdown);
    },
  });

  useEffect(() => {
    if (editor && value) {
      // И здесь тоже
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
        </Space>
      </div>

      {/* Поле ввода */}
      {/* Класс markdown-body (или prose) нужен, чтобы внутри редактора стили заголовков и списков выглядели так же, как в вашем MdLayout */}
      <div
        className="p-4 min-h-75 cursor-text markdown-body"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} className="outline-none" />
      </div>
    </div>
  );
};
