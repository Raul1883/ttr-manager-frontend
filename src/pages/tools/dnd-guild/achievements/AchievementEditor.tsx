import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Typography,
} from "antd";
import useApp from "antd/es/app/useApp";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { AchievementImage } from "./AchievementNode";
import { wouldCreateCycle } from "./graph";
import type { Achievement, AchievementTree } from "./types";

interface FormValues {
  title: string;
  description: string;
  reward: string;
  image: string;
  parents: string[];
}

interface TreeDraft {
  title: string;
  description: string;
  isolatedLayout: "line" | "grid";
  isolatedColumns: number;
}

interface AchievementEditorProps {
  open: boolean;
  tree: AchievementTree;
  onClose: () => void;
  onTreePatch: (patch: Partial<AchievementTree>) => Promise<void>;
  onAchievementSave: (achievement: Achievement) => Promise<Achievement>;
  onAchievementDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onCreateTree: () => Promise<string>;
}

const layoutOptions: Array<{ value: "line" | "grid"; label: string }> = [
  { value: "line", label: "Линия" },
  { value: "grid", label: "Сетка" },
];

const toDraft = (tree: AchievementTree): TreeDraft => ({
  title: tree.title,
  description: tree.description,
  isolatedLayout: tree.isolatedLayout ?? "line",
  isolatedColumns: tree.isolatedColumns ?? 3,
});

export default function AchievementEditor({
  open,
  tree,
  onClose,
  onTreePatch,
  onAchievementSave,
  onAchievementDelete,
  onRefresh,
  onCreateTree,
}: AchievementEditorProps) {
  const { message } = useApp();
  const [form] = Form.useForm<FormValues>();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TreeDraft>(() => toDraft(tree));
  const [busy, setBusy] = useState(false);

  const { id, title, description, isolatedLayout, isolatedColumns } = tree;
  useEffect(() => {
    setDraft({
      title,
      description,
      isolatedLayout: isolatedLayout ?? "line",
      isolatedColumns: isolatedColumns ?? 3,
    });
  }, [id, title, description, isolatedLayout, isolatedColumns]);

  const run = async (action: () => Promise<void>, okText?: string) => {
    setBusy(true);
    try {
      await action();
      if (okText) message.success(okText);
    } catch {
      message.error("Не удалось выполнить действие");
    } finally {
      setBusy(false);
    }
  };

  const openForm = (achievement?: Achievement) => {
    setEditingId(achievement?.id ?? null);
    form.setFieldsValue({
      title: achievement?.title ?? "",
      description: achievement?.description ?? "",
      reward: achievement?.reward ?? "",
      image: achievement?.image ?? "⭐",
      parents: achievement?.parents ?? [],
    });
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const saveAchievement = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      // antd сам покажет ошибки валидации в полях формы.
      return;
    }

    setBusy(true);
    try {
      await onAchievementSave({
        id: editingId ?? "",
        title: (values.title ?? "").trim(),
        description: (values.description ?? "").trim(),
        reward: (values.reward ?? "").trim(),
        image: (values.image ?? "").trim() || "⭐",
        parents: values.parents ?? [],
      });
      closeForm();
      message.success("Достижение сохранено");
    } catch {
      message.error("Не удалось сохранить достижение");
    } finally {
      setBusy(false);
    }
  };

  const removeAchievement = (id: string) =>
    run(() => onAchievementDelete(id), "Достижение удалено");

  const parentOptions = tree.achievements
    .filter((item) => item.id !== editingId)
    .map((item) => ({ value: item.id, label: item.title }));

  return (
    <Drawer
      title={`Редактирование: ${tree.title}`}
      size={560}
      open={open}
      onClose={onClose}
      extra={
        <Space size={8}>
          <Button
            icon={<PlusOutlined />}
            disabled={busy || !tree.id}
            onClick={() => run(async () => void (await onCreateTree()), "Новый граф создан")}
          >
            Новый граф
          </Button>
          <Button
            icon={<ReloadOutlined />}
            disabled={busy}
            onClick={() => run(onRefresh, "Данные обновлены")}
          >
            Обновить
          </Button>
        </Space>
      }
    >
      <Typography.Paragraph type="secondary">
        Изменения сохраняются в PocketBase и сразу видны всем игрокам.
      </Typography.Paragraph>

      <Divider titlePlacement="left">Набор</Divider>
      <Space orientation="vertical" size={12} className="w-full">
        <Input
          placeholder="Название набора"
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
        <Input.TextArea
          rows={2}
          placeholder="Описание набора"
          value={draft.description}
          onChange={(event) =>
            setDraft({ ...draft, description: event.target.value })
          }
        />
        <Space size={8} wrap>
          <Select
            value={draft.isolatedLayout}
            options={layoutOptions}
            style={{ width: 140 }}
            onChange={(value) => setDraft({ ...draft, isolatedLayout: value })}
          />
          <InputNumber
            placeholder="Колонок"
            min={1}
            max={6}
            value={draft.isolatedColumns}
            disabled={draft.isolatedLayout !== "grid"}
            onChange={(value) =>
              setDraft({ ...draft, isolatedColumns: value ?? 3 })
            }
          />
        </Space>
        <Button
          type="primary"
          disabled={busy || !tree.id}
          onClick={() =>
            run(() => onTreePatch(draft), "Настройки набора сохранены")
          }
        >
          Сохранить настройки
        </Button>
      </Space>

      <Divider titlePlacement="left">Достижения</Divider>
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        disabled={busy || !tree.id}
        onClick={() => openForm()}
      >
        Добавить достижение
      </Button>

      <div className="mt-3 flex flex-col gap-2">
        {tree.achievements.length === 0 ? (
          <Empty description="Пока нет достижений" />
        ) : (
          tree.achievements.map((item) => (
            <Card
              size="small"
              key={item.id}
              title={
                <Space size={8}>
                  <AchievementImage
                    image={item.image}
                    title={item.title}
                    size={32}
                  />
                  <span>{item.title}</span>
                </Space>
              }
              extra={
                <Space size={0}>
                  <Button
                    type="link"
                    size="small"
                    title="Изменить"
                    icon={<EditOutlined />}
                    onClick={() => openForm(item)}
                  />
                  <Popconfirm
                    title="Удалить достижение?"
                    onConfirm={() => removeAchievement(item.id)}
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      title="Удалить"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              }
            >
              <div className="text-xs text-[#595959]">{item.description}</div>
              <div className="mt-1 text-xs">
                <b>Награда: </b>
                {item.reward}
              </div>
              <div className="mt-1 text-xs text-[#979795]">
                Требуется:{" "}
                {item.parents
                  .map(
                    (id) =>
                      tree.achievements.find((parent) => parent.id === id)
                        ?.title ?? id,
                  )
                  .join(", ") || "—"}
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        title={editingId ? "Изменить достижение" : "Новое достижение"}
        open={formOpen}
        onCancel={closeForm}
        onOk={saveAchievement}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={busy}
        width={520}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: "Введите заголовок" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="reward" label="Награда">
            <Input />
          </Form.Item>
          <Form.Item
            name="image"
            label="Изображение (emoji или URL)"
            extra="Оставьте пустым, чтобы использовать ⭐"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="parents"
            label="Требуемые достижения"
            rules={[
              {
                validator: (
                  _rule: unknown,
                  value: string[] | undefined,
                ): Promise<void> => {
                  const parents = value ?? [];
                  if (editingId && parents.includes(editingId)) {
                    return Promise.reject(
                      new Error("Достижение не может требовать само себя"),
                    );
                  }
                  if (
                    editingId &&
                    wouldCreateCycle(tree.achievements, editingId, parents)
                  ) {
                    return Promise.reject(new Error("Связи образуют цикл"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              mode="multiple"
              options={parentOptions}
              placeholder="Выберите предыдущие достижения"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
}
