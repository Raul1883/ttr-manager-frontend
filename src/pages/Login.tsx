import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Alert, Layout, Card } from "antd";
import { pb } from "../API/PocketBase";
import { COLLECTIONS } from "../API/collections";

const { Title } = Typography;

export const Login: React.FC = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const onFinish = async (values: { login: string; password: string }) => {
    setError("");
    setIsLoading(true);

    try {
      await pb
        .collection(COLLECTIONS.users)
        .authWithPassword(values.login, values.password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <Card>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Title
            level={2}
            style={{ textAlign: "center", fontWeight: 300, marginBottom: 24 }}
          >
            Вход
          </Title>

          <Form.Item
            name="login"
            rules={[{ required: true, message: "Пожалуйста, введите почту" }]}
          >
            <Input placeholder="Почта" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Пожалуйста, введите пароль" }]}
          >
            <Input.Password placeholder="Пароль" size="large" />
          </Form.Item>

          {error && (
            <Form.Item style={{ marginBottom: 16 }}>
              <Alert message={error} type="error" showIcon />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
            >
              {isLoading ? "Загрузка..." : "Войти"}
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Link to="/reg">Зарегистрироваться</Link>
          </div>
        </Form>
      </Card>
    </Layout>
  );
};
