import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tabs,
  Popconfirm,
  Card,
  Flex,
  Typography,
} from "antd";
import { pb } from "../../../../API/PocketBase";
import type { Quest } from "./HistoryMain";
import useApp from "antd/es/app/useApp";
import { RoleGuard } from "../../../../utils/RoleGuard";

interface PanelProps {
  data: Quest[];
  mutate: () => void;
}

export default ({ data, mutate }: PanelProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm();

  const { message } = useApp();

  const handleFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Если поля party/casualties остались пустыми, отправляем пустой массив
      const newQuest = {
        ...values,
        party: values.party || [],
        casualties: values.casualties || [],
      };

      await pb.collection("tools_guild_history").create(newQuest);
      message.success("Квест успешно добавлен!");

      form.resetFields(); // Очищаем форму
      mutate(); // Обновляем данные на клиенте

      // Можно закрыть модалку: setIsOpen(false);
    } catch (error: any) {
      message.error("Ошибка при добавлении: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- УДАЛЕНИЕ ЗАПИСИ ---
  const handleDelete = async (id: string) => {
    try {
      await pb.collection("tools_guild_history").delete(id);
      message.success("Запись удалена");
      mutate(); // Обновляем данные
    } catch (error: any) {
      message.error("Ошибка при удалении: " + error.message);
    }
  };

  // --- СОДЕРЖИМОЕ ВКЛАДКИ "ДОБАВИТЬ" ---
  const AddForm = (
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
        <Input />
      </Form.Item>

      <Form.Item
        name="summary"
        label="Краткое описание"
        rules={[{ required: true }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      {/* Select с mode="tags" автоматически собирает введенный текст в массив строк */}
      <Form.Item name="party" label="Участники (введите имя и нажмите Enter)">
        <Select mode="tags" placeholder="Например: Арагорн, Гимли" />
      </Form.Item>

      <Form.Item name="casualties" label="Потери (введите имя и нажмите Enter)">
        <Select mode="tags" placeholder="Если есть..." />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={isSubmitting} block>
        Добавить запись
      </Button>
    </Form>
  );

  // --- СОДЕРЖИМОЕ ВКЛАДКИ "УПРАВЛЕНИЕ" ---
  const ManageList = (
    <Flex vertical gap="middle">
      {data.map((item) => (
        <Card
          key={item.id}
          size="small"
          actions={[
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
      <RoleGuard allowedRoles={["master"]}>
        <Button type="primary" onClick={() => setIsOpen(true)}>
          Управление историей
        </Button>

        <Modal
          title="Панель администратора"
          open={isOpen}
          onCancel={() => setIsOpen(false)}
          footer={null} // Отключаем стандартные кнопки модалки, у нас своя кнопка в форме
        >
          <Tabs
            defaultActiveKey="1"
            items={[
              { key: "1", label: "Добавить запись", children: AddForm },
              { key: "2", label: "Управление записями", children: ManageList },
            ]}
          />
        </Modal>
      </RoleGuard>
    </div>
  );
};
