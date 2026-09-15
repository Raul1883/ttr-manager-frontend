import { Button, Flex, Image, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import foolImg from "../assets/not-found-fool.webp";

const { Title, Text } = Typography;

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Flex
        vertical
        align="center"
        justify="center"
        style={{ minHeight: "70vh", padding: "40px 16px" }}
      >
        {/* Изображение */}
        <Image
          src={foolImg}
          alt="Страница не найдена"
          preview={false}
          style={{ maxWidth: 150, width: "100%", height: "auto" }}
        />

        {/* Текстовый блок */}
        <Title level={1} style={{ margin: "24px 0 8px" }}>
          404
        </Title>
        <Text type="secondary" style={{ fontSize: 16, marginBottom: 24 }}>
          Здесь пока ничего нет
        </Text>

        {/* Кнопки действий */}
        <Space size="middle">
          <Button size="large" onClick={() => navigate(-1)}>
            Назад
          </Button>
          <Button type="primary" size="large" onClick={() => navigate("/")}>
            На главную
          </Button>
        </Space>
      </Flex>
    </MainLayout>
  );
}