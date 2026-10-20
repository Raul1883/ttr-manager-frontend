import React, { useMemo } from "react";
import { Card, Tag, Typography, Space, Timeline, Divider, Spin } from "antd";

import MainLayout from "../../../../components/MainLayout";
import FlagOutlined from "@ant-design/icons/es/icons/FlagOutlined";
import UserOutlined from "@ant-design/icons/es/icons/UserOutlined";
import MoonOutlined from "@ant-design/icons/es/icons/MoonOutlined";
import useSWR from "swr";
import { pb } from "../../../../API/PocketBase";
import { COLLECTIONS } from "../../../../API/collections";
import HistoryMasterPanel from "./HistoryMasterPanel";

const { Text, Paragraph, Title } = Typography;

const SEASONS = ["Весна", "Лето", "Осень", "Зима"];
const WEEKS_IN_SEASON = 9;

const getLoreTime = (absoluteWeek: number) => {
  const totalSeasons = Math.floor((absoluteWeek - 1) / WEEKS_IN_SEASON);
  const seasonName = SEASONS[totalSeasons % 4];
  const year = Math.floor(totalSeasons / 4) + 1;
  const weekOfSeason = ((absoluteWeek - 1) % WEEKS_IN_SEASON) + 1;

  return {
    groupKey: `${seasonName}`,
    seasonName,
    year,
    weekOfSeason,
  };
};

export interface Quest {
  id: string;
  week: number;
  title: string;
  location?: string;
  status: "Провал" | "Успех" | "Осложнения";
  summary: string;
  party: string[];
  casualties?: string[];
}

export const QuestChronologyPage: React.FC = () => {
  const { data, isLoading, error, mutate } = useSWR<Quest[]>(
    [COLLECTIONS.guildHistory],
    ([coll]) => pb.collection(coll).getFullList<Quest>(),
  );

  const groupedChronology = useMemo(() => {
    if (!data) return {};

    const groups: Record<string, (Quest & { weekOfSeason: number })[]> = {};

    const sortedQuests = [...data].sort((a, b) => b.week - a.week);

    sortedQuests.forEach((quest) => {
      const { groupKey, weekOfSeason } = getLoreTime(quest.week);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push({
        ...quest,
        party: quest.party ?? [],
        casualties: quest.casualties ?? [],
        weekOfSeason,
      });
    });

    return groups;
  }, [data]);

  if (isLoading || !data) {
    return (
      <MainLayout>
        <Spin />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div>Ошибка загрузки данных: {error.message}</div>
      </MainLayout>
    );
  }

  function getColorByStatus(status: string) {
    if (status == "Успех") return "success";
    if (status == "Осложнения") return "warning";
    return "red";
  }

  return (
    <MainLayout>
      <div>
        <Title level={2}>Архив</Title>
        <HistoryMasterPanel data={data} mutate={mutate} />

        {Object.entries(groupedChronology).map(([seasonTitle, quests]) => (
          <div key={seasonTitle}>
            <Divider style={{ borderColor: "gray" }}>
              <Title level={4}>{seasonTitle}</Title>
            </Divider>

            <Timeline
              titleSpan="100px"
              items={quests.map((quest) => ({
                title: (
                  <Text strong style={{ fontSize: 16 }}>
                    Неделя {quest.weekOfSeason}
                  </Text>
                ),
                content: (
                  <Card
                    size="small"
                    hoverable
                    style={{
                      width: "100%",
                      borderColor:
                        quest.status === "Провал" ? "#ffccc7" : undefined,
                      backgroundColor:
                        quest.status === "Провал" ? "#fff1f0" : "#ffffff",
                    }}
                    title={quest.title}
                    extra={
                      <Tag color={getColorByStatus(quest.status)}>
                        {quest.status}
                      </Tag>
                    }
                  >
                    <Space wrap style={{ marginBottom: 12 }}>
                      {quest.location && (
                        <Tag>
                          <FlagOutlined />
                          {"  "}
                          {quest.location}
                        </Tag>
                      )}
                    </Space>

                    <Paragraph style={{ marginBottom: 12 }}>
                      {quest.summary}
                    </Paragraph>

                    {quest.casualties && quest.casualties.length > 0 && (
                      <div
                        style={{
                          marginBottom: 12,
                          padding: "8px",
                          background: "#fff2f0",
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          type="danger"
                          strong
                          style={{
                            display: "block",
                            fontSize: 12,
                            marginBottom: 4,
                          }}
                        >
                          <MoonOutlined /> Павшие герои:
                        </Text>
                        <Space wrap>
                          {quest.casualties.map((dead) => (
                            <Tag key={dead} color="error">
                              {dead}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}

                    <div>
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <UserOutlined /> Состав партии:
                      </Text>
                      <Space wrap>
                        {quest.party.map((hero) => (
                          <Tag key={hero}>{hero}</Tag>
                        ))}
                      </Space>
                    </div>
                  </Card>
                ),
                color: getColorByStatus(quest.status),
              }))}
            />
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default QuestChronologyPage;
