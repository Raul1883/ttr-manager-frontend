import { PlusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Space,
  Form,
  Input,
  InputNumber,
  Upload,
} from "antd";
import type { UploadFile } from "antd";
import { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { RoleGuard } from "../../../../utils/RoleGuard";
import { pb } from "../../../../API/PocketBase";
import useApp from "antd/es/app/useApp";

// Предполагается, что инстанс PocketBase импортируется откуда-то из ваших утилит

// Описываем структуру данных, которые мы ожидаем получить из формы
interface NecropolisFormValues {
  name: string;
  level: number;
  race: string;
  class: string;
  title?: string;
  description: string;
  img?: UploadFile[];
}

export function NecropolisEditor({ mutate }: { mutate: any }) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<NecropolisFormValues>();

  const { user } = useAuth();
  const {message} = useApp();

  const handleFinish = async (values: NecropolisFormValues) => {
    if (!user?.id) {
      message.error("Пользователь не авторизован");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", values.name);
      // FormData принимает только строки или Blob, переводим число в строку
      formData.append("level", values.level.toString());
      formData.append("race", values.race);
      formData.append("class", values.class);
      formData.append("title", values.title || "");
      formData.append("description", values.description);

      // Добавляем файл, если он есть.
      // AntD хранит оригинальный JS File в свойстве originFileObj
      if (values.img && values.img.length > 0) {
        const file = values.img[0].originFileObj;
        if (file) {
          formData.append("img", file as File);
        }
      }

      // Скрытые поля
      formData.append("owner", user.id);
      formData.append("candles", "0"); // Передаем как строку, PocketBase сам конвертирует в number

      await pb.collection("tools_necropolis").create(formData);
      mutate();
      message.success("История успешно записана!");
      setOpen(false);
      form.resetFields();
    } catch (error) {
      message.error("Произошла ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  // Нормализатор для Upload компонента, с типизацией event от Ant Design
  const normFile = (e: any): UploadFile[] => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  return (
    <Space>
      <RoleGuard allowedRoles={["player", "master"]}>
        <Button icon={<PlusCircleOutlined />} onClick={() => setOpen(true)}>
          Записать последнюю историю
        </Button>
      </RoleGuard>

      <Modal
        title="Новая запись в Некрополь"
        open={open}
        onCancel={() => !loading && setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form<NecropolisFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ level: 1 }}
        >
          <Form.Item
            label="Имя"
            name="name"
            rules={[{ required: true, message: "Пожалуйста, введите имя" }]}
          >
            <Input placeholder="Имя персонажа" />
          </Form.Item>

          <Form.Item
            label="Уровень"
            name="level"
            rules={[{ required: true, message: "Пожалуйста, укажите уровень" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} placeholder="1" />
          </Form.Item>

          <Form.Item
            label="Раса"
            name="race"
            rules={[{ required: true, message: "Пожалуйста, укажите расу" }]}
          >
            <Input placeholder="Раса" />
          </Form.Item>

          <Form.Item
            label="Класс"
            name="class"
            rules={[{ required: true, message: "Пожалуйста, укажите класс" }]}
          >
            <Input placeholder="Класс" />
          </Form.Item>

          <Form.Item
            label="Надпись"
            name="title"
            rules={[
              { required: true, message: "Пожалуйста, добавьте описание" },
            ]}
          >
            <Input placeholder="Надпись на могильном камне. Может быть цитатой" />
          </Form.Item>

          <Form.Item
            label="Описание истории"
            name="description"
            rules={[
              { required: true, message: "Пожалуйста, добавьте описание" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Как он пал..." />
          </Form.Item>

          <Form.Item
            label="Изображение"
            name="img"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Выбрать изображение</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}
          >
            <Space>
              <Button onClick={() => setOpen(false)} disabled={loading}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Создать запись
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
