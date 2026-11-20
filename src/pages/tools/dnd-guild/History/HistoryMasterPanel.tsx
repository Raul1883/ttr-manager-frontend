import { useMemo, useState } from "react";
import {
  AutoComplete,
  Button,
  Card,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tabs,
  Typography,
} from "antd";
import useApp from "antd/es/app/useApp";
import { pb } from "../../../../API/PocketBase";
import { COLLECTIONS } from "../../../../API/collections";
import type { Quest } from "./HistoryMain";
import { RoleGuard } from "../../../../utils/RoleGuard";
import { ROLES } from "../../../../types/Role";

interface PanelProps {
  data: Quest[];
  mutate: () => void;
}

type QuestFormValues = {
  week: number;
  title: string;
  status: Quest["status"];
  location?: string;
  summary: string;
  party?: string[];
  casualties?: string[];
};

export default function HistoryMasterPanel({ data, mutate }: PanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [form] = Form.useForm<QuestFormValues>();

  const { message } = useApp();

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(data.map((quest) => quest.location).filter(Boolean) as string[]),
      )
        .sort((a, b) => a.localeCompare(b, "ru"))
        .map((value) => ({ value })),
    [data],
  );

  const participantOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data.flatMap((quest) => [
            ...(quest.party ?? []),
            ...(quest.casualties ?? []),
          ]),
        ),
      )
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "ru"))
        .map((value) => ({ value })),
    [data],
  );

  const resetToCreateMode = () => {
    setEditingQuest(null);
    form.resetFields();
    form.setFieldsValue({ week: data.length + 1 });
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveTab("1");
    resetToCreateMode();
  };

  const startEdit = (quest: Quest) => {
    setEditingQuest(quest);
    form.setFieldsValue({
      week: quest.week,
      title: quest.title,
      status: quest.status,
      location: quest.location,
      summary: quest.summary,
      party: quest.party ?? [],
      casualties: quest.casualties ?? [],
    });
    setActiveTab("1");
  };

  const handleFinish = async (values: QuestFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        party: values.party || [],
        casualties: values.casualties || [],
      };

      if (editingQuest) {
        await pb
          .collection(COLLECTIONS.guildHistory)
          .update(editingQuest.id, payload);
        message.success("Запись обновлена");
      } else {
        await pb.collection(COLLECTIONS.guildHistory).create(payload);
        message.success("Квест успешно добавлен");
      }

      mutate();
      resetToCreateMode();
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      message.error("Ошибка при сохранении: " + text);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pb.collection(COLLECTIONS.guildHistory).delete(id);
      message.success("Запись удалена");
      if (editingQuest?.id === id) {
        resetToCreateMode();
      }
      mutate();
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      message.error("Ошибка при удалении: " + text);
    }
  };

  const questForm = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ week: data.length + 1 }}
    >
      <Form.Item name="week" label="Неделя" rules={[{ required: true }]}>
        <InputNumber style={{ width: "100%" }} min={1} />
      </Form.Item>

      <Form.Item
        name="title"
        label="Название квеста"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
        <Select
          options={[
            { value: "Успех", label: "Успех" },
            { value: "Провал", label: "Провал" },
            { value: "Осложнения", label: "Осложнения" },
          ]}
        />
      </Form.Item>

      <Form.Item name="location" label="Локация">
        <AutoComplete
          options={locationOptions}
          filterOption={(inputValue, option) =>
            (option?.value ?? "")
              .toLowerCase()
              .includes(inputValue.toLowerCase())
          }
          allowClear
        />
      </Form.Item>

      <Form.Item
        name="summary"
        label="Краткое описание"
        rules={[{ required: true }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item name="party" label="Участники (введите имя и нажмите Enter)">
        <Select
          mode="tags"
          options={participantOptions}
          placeholder="Например: Арагорн, Гимли"
        />
      </Form.Item>

      <Form.Item name="casualties" label="Потери (введите имя и нажмите Enter)">
        <Select
          mode="tags"
          options={participantOptions}
          placeholder="Если есть..."
        />
      </Form.Item>

      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        {editingQuest ? (
          <Button onClick={resetToCreateMode}>Отмена</Button>
        ) : (
          <span />
        )}
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          {editingQuest ? "Сохранить изменения" : "Добавить запись"}
        </Button>
      </Space>
    </Form>
  );

  const manageList = (
    <Flex vertical gap="middle">
      {[...data].reverse().map((item) => (
        <Card
          key={item.id}
          size="small"
          actions={[
            <Button key="edit" type="text" onClick={() => startEdit(item)}>
              Редактировать
            </Button>,
            <Popconfirm
              key="delete"
              title="Точно удалить?"
              onConfirm={() => handleDelete(item.id)}
              okText="Да"
              cancelText="Нет"
            >
              <Button danger type="text">
                Удалить
              </Button>
            </Popconfirm>,
          ]}
        >
          <Card.Meta
            title={`[Неделя ${item.week}] ${item.title}`}
            description={
              <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                {item.summary}
              </Typography.Paragraph>
            }
          />
        </Card>
      ))}
    </Flex>
  );

  return (
    <div>
      <RoleGuard allowedRoles={[ROLES.master]}>
        <Button
          type="primary"
          onClick={() => {
            setIsOpen(true);
            resetToCreateMode();
          }}
        >
          Управление историей
        </Button>

        <Modal
          title={editingQuest ? "Редактирование записи" : "Панель администратора"}
          open={isOpen}
          onCancel={handleClose}
          footer={null}
          destroyOnClose
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "1",
                label: editingQuest ? "Редактировать запись" : "Добавить запись",
                children: questForm,
              },
              {
                key: "2",
                label: "Управление записями",
                children: manageList,
              },
            ]}
          />
        </Modal>
      </RoleGuard>
    </div>
  );
}
