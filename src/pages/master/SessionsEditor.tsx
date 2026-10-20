import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { getById } from "../../API/Fetcher";
import type { CollectionName } from "../../API/collections";
import type { SessionGet, SessionPost } from "../../types/Session";
import AttributeEditor from "../../components/AttributeEditor";
import MainLayout from "../../components/MainLayout";
import { App, Button, Card, Form, Input } from "antd";
import NavButton from "../../components/NavButton";
import { pb } from "../../API/PocketBase";
import { COLLECTIONS } from "../../API/collections";
import { useAuth } from "../../contexts/AuthContext";

interface SessionFormProps {
  mode: "create" | "edit";
}

export default ({ mode }: SessionFormProps) => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = mode === "edit";
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<SessionGet>(
    isEditMode && id ? [COLLECTIONS.sessions, id] : null,
    ([url, targetId]) =>
      getById<SessionGet>(url as CollectionName, targetId as string),
  );

  useEffect(() => {
    if (isEditMode && data) {
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        system: data.system,
        genre: data.genre,
        company: data.company,
        scheduled_at: data.scheduled_at,
      });
    }
  }, [isEditMode, data, form]);

  const onFinish = async (values: Omit<SessionPost, "master">) => {
    try {
      const body = {
        ...values,
        master: user?.id,
      };

      if (isEditMode && id) {
        const response: SessionGet = await pb
          .collection(COLLECTIONS.sessions)
          .update(id, body);

        mutate(response);

        message.success("Успешно!");
      } else {
        await pb.collection(COLLECTIONS.sessions).create(body);
        message.success("Успешно!");
      }
      navigate("/manage/sessions");
    } catch (error) {
      message.error("Ошибка при сохранении данных");
    }
  };

  if (isEditMode) {
    if (error)
      return <div className="p-4 text-red-500">Ошибка загрузки сессии</div>;
    if (isLoading) return <div className="p-4">Загрузка...</div>;
    if (!data) return <div className="p-4">Сессия не найдена</div>;
  }

  return (
    <MainLayout>
      {/* Привязываем инстанс формы и вешаем onFinish */}
      <Form
        form={form}
        name="session"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ system_id: undefined, genre_id: undefined }}
      >
        <Card
          title={isEditMode ? `Редактор сессии #${id}` : "Создание сессии"}
          actions={[
            // htmlType="submit" заставит форму валидироваться и триггернуть onFinish
            <Button type="primary" htmlType="submit">
              Сохранить
            </Button>,
            <NavButton type="dashed" to={-1}>
              Отмена
            </NavButton>,
          ]}
        >
          <Form.Item<SessionPost>
            label="Название"
            name="title"
            rules={[{ required: true, message: "Название обязательно" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<SessionPost> label="Описание" name="description">
            <Input.TextArea autoSize />
          </Form.Item>

          <Form.Item<SessionPost>
            label="Время"
            name="scheduled_at"
            rules={[{ required: true, message: "Дата обязательна" }]}
          >
            <Input.TextArea autoSize />
          </Form.Item>

          <Form.Item<SessionPost>
            label="Жанр"
            name="genre"
            rules={[{ required: true, message: "Выберите жанр" }]}
          >
            <AttributeEditor type={COLLECTIONS.genres} />
          </Form.Item>

          <Form.Item<SessionPost>
            label="Система"
            name="system"
            rules={[{ required: true, message: "Выберите систему" }]}
          >
            <AttributeEditor type={COLLECTIONS.systems} />
          </Form.Item>

          <Form.Item<SessionPost>
            label="Компания"
            name="company"
            rules={[{ required: true, message: "Выберите компанию" }]}
          >
            <AttributeEditor type={COLLECTIONS.companies} />
          </Form.Item>
        </Card>
      </Form>
    </MainLayout>
  );
};
