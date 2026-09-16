import React, { useState } from "react";
import useSWR from "swr";
import {
  Card,
  Row,
  Col,
  Modal,
  Typography,
  Space,
  Button,
  Divider,
  Empty,
} from "antd";
import { FireOutlined, UserOutlined, ReadOutlined } from "@ant-design/icons";

import { pb } from "../../../../API/PocketBase";
import MainLayout from "../../../../components/MainLayout";
import { SwrHandler } from "../../../../components/SwrHandler";
import useApp from "antd/es/app/useApp";
import { useAuth } from "../../../../contexts/AuthContext"; // <-- Импорт хука авторизации
import { NecropolisEditor } from "./Murder"; // Убедитесь в правильности пути

const { Title, Text, Paragraph } = Typography;

export interface UserExpand {
  id: string;
  login: string;
  email?: string;
  role?: string;
  contact_info?: string;
}

// Экспортируем интерфейс, чтобы им пользоваться в редакторе
export interface Fallen {
  id: string;
  name: string;
  level: number;
  race: string;
  class: string;
  title: string;
  description: string;
  img?: string;
  owner: string;
  candles: number;
  collectionId: string;
  expand?: {
    owner?: UserExpand;
  };
}

const fetchNecropolis = async (): Promise<Fallen[]> => {
  return await pb.collection("tools_necropolis").getFullList<Fallen>({
    sort: "created",
    expand: "owner",
  });
};

export function Necropolis() {
  const { data, isLoading, error, mutate } = useSWR(
    "Necropolis",
    fetchNecropolis,
  );

  const [selectedHero, setSelectedHero] = useState<Fallen | null>(null);

  const { message } = useApp();
  const { user } = useAuth(); // <-- Достаем текущего пользователя для проверки прав

  const handleLightCandle = async (e: React.MouseEvent, hero: Fallen) => {
    e.stopPropagation();
    if (localStorage.getItem(`necropolis-${hero.id}`)) {
      message.warning("Вы уже оказали честь");
      return;
    }

    localStorage.setItem(`necropolis-${hero.id}`, "true");

    try {
      const nextCandles = (hero.candles || 0) + 1;
      await pb
        .collection("tools_necropolis")
        .update(hero.id, { candles: nextCandles });

      mutate();
    } catch (err) {
      console.error("Ошибка при возложении свечи:", err);
    }
  };

  const getImageUrl = (hero: Fallen) => {
    if (!hero.img) return "/placeholder-tomb.jpg";
    return pb.files.getURL(hero, hero.img);
  };

  return (
    <MainLayout>
      <div style={{ padding: "24px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2}>ЗАЛ ПАВШИХ ГЕРОЕВ</Title>
          <NecropolisEditor mutate={mutate} />
        </div>
        <SwrHandler data={data} isLoading={isLoading} error={error}>
          {!data?.length ? (
            <Empty description="Кладбище пусто." />
          ) : (
            <Row gutter={[24, 32]} style={{ alignItems: "end" }}>
              {data.map((hero) => (
                <Col xs={24} sm={12} md={8} lg={6} key={hero.id}>
                  <Card
                    hoverable
                    onClick={() => setSelectedHero(hero)}
                    style={{
                      borderRadius: "64px 64px 8px 8px",
                      backgroundColor: "#242424",
                      borderColor: "#333",
                      overflow: "hidden",
                    }}
                    styles={{ body: { padding: 16 } }}
                    cover={
                      <div style={{ position: "relative" }}>
                        <img
                          alt={hero.name}
                          src={getImageUrl(hero)}
                          style={{
                            width: "100%",
                            height: 240,
                            objectFit: "cover",
                            objectPosition: "top center",
                            filter: "grayscale(80%)",
                          }}
                        />
                      </div>
                    }
                  >
                    <div style={{ textAlign: "center", marginBottom: 12 }}>
                      <Title
                        level={4}
                        style={{ color: "#fff", marginTop: 0, marginBottom: 4 }}
                      >
                        {hero.name}
                      </Title>
                      <Text style={{ color: "#bfbfbf" }}>
                        {hero.race.toLowerCase()} {hero.class.toLowerCase()}{" "}
                        {hero.level}
                      </Text>
                    </div>

                    {hero.title && (
                      <div style={{ textAlign: "center", margin: "16px 0" }}>
                        <Text italic style={{ color: "#a6a6a6" }}>
                          «{hero.title}»
                        </Text>
                      </div>
                    )}

                    <Divider
                      style={{ borderColor: "#444", margin: "16px 0" }}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#8c8c8c" }}>
                        <UserOutlined /> {hero.expand?.owner?.login}
                      </Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<FireOutlined />}
                        onClick={(e) => handleLightCandle(e, hero)}
                        style={{
                          color: hero.candles > 0 ? "#faad14" : "#8c8c8c",
                        }}
                      >
                        {hero.candles || 0}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <Modal
            open={!!selectedHero}
            onCancel={() => setSelectedHero(null)}
            centered
            // Если текущий юзер — владелец записи, показываем кнопку редактирования в футере
            footer={
              selectedHero && user?.id === selectedHero.owner ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 16,
                  }}
                >
                  <NecropolisEditor
                    mutate={mutate}
                    hero={selectedHero}
                    onSuccess={() => setSelectedHero(null)}
                  />
                </div>
              ) : null
            }
          >
            {selectedHero && (
              <div>
                <Space align="start" size="large" style={{ marginBottom: 20 }}>
                  <img
                    src={getImageUrl(selectedHero)}
                    alt={selectedHero.name}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      objectPosition: "top center",
                      borderRadius: 8,
                    }}
                  />
                  <div>
                    <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>
                      {selectedHero.name}
                    </Title>
                    <Text type="secondary" style={{ display: "block" }}>
                      {selectedHero.race.toLowerCase()}{" "}
                      {selectedHero.class.toLowerCase()} {selectedHero.level}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginTop: 4 }}
                    >
                      Игрок: <b>{selectedHero.expand?.owner?.login}</b>
                    </Text>
                  </div>
                </Space>

                {selectedHero.title && (
                  <Paragraph
                    italic
                    style={{ borderLeft: "3px solid #faad14", paddingLeft: 12 }}
                  >
                    «{selectedHero.title}»
                  </Paragraph>
                )}

                <Divider>
                  <Space>
                    <ReadOutlined /> Хроника гибели
                  </Space>
                </Divider>

                <Paragraph style={{ whiteSpace: "pre-line", fontSize: 15 }}>
                  {selectedHero.description}
                </Paragraph>
              </div>
            )}
          </Modal>
        </SwrHandler>
      </div>
    </MainLayout>
  );
}
