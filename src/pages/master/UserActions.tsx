import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
} from "antd";
import type { UserRead } from "./Users";
import { useState } from "react";
import useApp from "antd/es/app/useApp";
import { deleteById, update } from "../../API/Fetcher";

interface UserEditProps {
  data: UserRead;
  mutate: any;
}

interface FormData {
  login: string;
  contact_info: string;
  role: "player" | "master";
}

export default (props: UserEditProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { message } = useApp();

  const onFinish = (values: FormData): void => {
    updateUser(values);

    setIsOpen(false);
  };

  const updateUser = async (values: FormData) => {
    try {
      await update("users", props.data.id, values);
      props.mutate();
      message.success(`Сохранены поля для пользователя ${props.data.login}:`);
    } catch (err) {
      message.error("Не удалось обновить пользователя . Попробуйте снова.");
    }
  };

  const handleDelete = (userId: string) => {
    deleteById("users", userId);
    props.mutate();
  };

  return (
    <Space size="medium">
      <Button onClick={() => setIsOpen(true)}>Редактировать</Button>
      <Popconfirm
        title="Точно?"
        description={`Это действие удалит ${props.data.login} навсегда!`}
        onConfirm={() => {
          handleDelete(props.data.id);
        }}
      >
        <Button type="dashed" danger>
          Удалить
        </Button>
      </Popconfirm>
      <Form
        onFinish={onFinish}
        autoComplete="off"
        initialValues={props.data}
        form={form}
      >
        <Modal
          open={isOpen}
          onCancel={() => {
            setIsOpen(false);
          }}
          onOk={form.submit}
          title={`Редактировать ${props.data.login}`}
        >
          <Form.Item label="Логин" name="login" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Контакты"
            name="contact_info"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Роль" name="role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "player", label: "player" },
                { value: "master", label: "master" },
              ]}
            />
          </Form.Item>
          <Tag>За сменой пароля к главному администратору</Tag>
        </Modal>
      </Form>
    </Space>
  );
};
