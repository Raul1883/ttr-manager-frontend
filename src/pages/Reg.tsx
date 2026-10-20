import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Alert,
  Space,
  Layout,
  Flex,
  Popover,
  Tag,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import { pb } from "../API/PocketBase";
import { COLLECTIONS } from "../API/collections";
import { ROLES } from "../types/Role";

// interface RegistrationData {
//   login: string;
//   password: string;
//   contact_info: string;
//   secret_key: string;
// }
interface RegistrationData {
  email: string;
  login: string;
  contact_info: string;
  password: string;
  passwordConfirm: string;
}

export default () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();

  const onFinish = async (values: RegistrationData) => {
    setLoading(true);
    setError(null);

    try {
      await pb.collection(COLLECTIONS.users).create({ role: ROLES.player, ...values });
      form.resetFields();

      modal.success({
        title: "Успешно!",
        content: `Регистрация успешно завершена`,
        onOk: () => {
          navigate("/login");
        },
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Flex justify="center" align="center">
        <Card
          title="Новый аккаунт"
          style={{ width: "40%", marginTop: "50px" }}
          extra={
            <Popover
              content={
                <Space vertical>
                  <Tag>Двухфакторки нет делайте сложный пароль</Tag>
                  <Tag>За восстановлением пароля к одному из админов</Tag>
                </Space>
              }
            >
              Подробнее
            </Popover>
          }
        >
          <Form
            form={form}
            name="registration"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            size="medium"
          >
            <Form.Item
              label="email"
              name="email"
              rules={[
                { required: true, message: "Введите почту", type: "email" },
              ]}
            >
              <Input placeholder="Почта" />
            </Form.Item>
            <Form.Item
              label="Ник"
              name="login"
              rules={[{ required: true, message: "Введите логин" }]}
            >
              <Input placeholder="Логин" />
            </Form.Item>

            <Form.Item
              label="Контактная информация"
              name="contact_info"
              rules={[{ required: true, message: "Введите контактные данные" }]}
            >
              <Input placeholder="ник в дс, телег, etc" />
            </Form.Item>
            <Form.Item
              label="Пароль"
              name="password"
              rules={[{ required: true, message: "Введите пароль" }]}
            >
              <Input.Password placeholder="Пароль" />
            </Form.Item>
            <Form.Item
              label="Пароль ещё раз"
              name="passwordConfirm"
              rules={[{ required: true, message: "Введите пароль" }]}
            >
              <Input.Password placeholder="Пароль" />
            </Form.Item>

            {error && (
              <Form.Item>
                <Alert
                  title="Ошибка!"
                  description={error}
                  type="error"
                  showIcon
                />
              </Form.Item>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {loading ? "Делается..." : "Сделать"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Flex>
      {contextHolder}
    </Layout>
  );
};
