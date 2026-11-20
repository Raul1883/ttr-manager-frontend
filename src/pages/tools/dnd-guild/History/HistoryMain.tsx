import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Space,
  Spin,
  Tag,
  Timeline,
  Typography,
} from "antd";

import MainLayout from "../../../../components/MainLayout";
import BarChartOutlined from "@ant-design/icons/es/icons/BarChartOutlined";
import FlagOutlined from "@ant-design/icons/es/icons/FlagOutlined";
import MoonOutlined from "@ant-design/icons/es/icons/MoonOutlined";
import UserOutlined from "@ant-design/icons/es/icons/UserOutlined";
import useSWR from "swr";
import { pb } from "../../../../API/PocketBase";
import { COLLECTIONS } from "../../../../API/collections";
import HistoryMasterPanel from "./HistoryMasterPanel";

const { Text, Paragraph, Title } = Typography;

const SEASONS = ["Весна", "Лето", "Осень", "Зима"];
const WEEKS_IN_SEASON = 9;

const SEASON_COLORS: Record<string, string> = {
  Весна: "#7a9e7e",
  Лето: "#c9a66b",
  Осень: "#b07d62",
  Зима: "#7a9eb1",
};

const STATUS_COLORS: Record<string, string> = {
  Успех: "#52c41a",
  Осложнения: "#faad14",
  Провал: "#ff4d4f",
};

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

  const [showStats, setShowStats] = useState(false);

  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        statusCounts: {} as Record<string, number>,
        locations: [] as [string, number][],
        participants: [] as [string, number][],
      };
    }

    const statusCounts: Record<string, number> = {
      Успех: 0,
      Осложнения: 0,
      Провал: 0,
    };
    const locationCounts: Record<string, number> = {};
    const partyCounts: Record<string, number> = {};

    data.forEach((quest) => {
      statusCounts[quest.status] = (statusCounts[quest.status] ?? 0) + 1;
      if (quest.location) {
        locationCounts[quest.location] =
          (locationCounts[quest.location] ?? 0) + 1;
      }
      (quest.party ?? []).forEach((name) => {
        if (name) {
          partyCounts[name] = (partyCounts[name] ?? 0) + 1;
        }
      });
    });

    const toSorted = (counts: Record<string, number>) =>
      Object.entries(counts).sort((a, b) => b[1] - a[1]);

    return {
      total: data.length,
      statusCounts,
      locations: toSorted(locationCounts),
      participants: toSorted(partyCounts),
    };
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

  const latestWeek = Math.max(...data.map((quest) => quest.week), 1);
  const currentLore = getLoreTime(latestWeek);

  const statusEntries = ["Успех", "Осложнения", "Провал"].map((status) => ({
    status,
    count: stats.statusCounts[status] ?? 0,
    percent:
      stats.total > 0
        ? Math.round(((stats.statusCounts[status] ?? 0) / stats.total) * 100)
        : 0,
  }));

  return (
    <MainLayout>
      <div>
        <Title level={2}>Архив</Title>

        <div
          style={{
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            {currentLore.seasonName} · {currentLore.year}-й год · неделя{" "}
            {currentLore.weekOfSeason}
          </Text>
          <Button
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => setShowStats((value) => !value)}
          >
            {showStats ? "Скрыть статистику" : "Статистика"}
          </Button>
        </div>

        {showStats && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Text strong>Статусы заданий</Text>
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      height: 12,
                      overflow: "hidden",
                      borderRadius: 6,
                      background: "#f0f0f0",
                    }}
                  >
                    {statusEntries.map(({ status, count }) =>
                      stats.total > 0 && count > 0 ? (
                        <div
                          key={status}
                          title={`${status}: ${count}`}
                          style={{
                            width: `${(count / stats.total) * 100}%`,
                            background: STATUS_COLORS[status],
                          }}
                        />
                      ) : null,
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {statusEntries.map(({ status, count, percent }) => (
                      <div
                        key={status}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Space size={8}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              background: STATUS_COLORS[status],
                            }}
                          />
                          <Text>{status}</Text>
                        </Space>
                        <Text type="secondary">
                          {count} ({percent}%)
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Text strong>Локации</Text>
                <div style={{ marginTop: 8 }}>
                  {stats.locations.length === 0 ? (
                    <Text type="secondary">Нет данных</Text>
                  ) : (
                    stats.locations.slice(0, 10).map(([name, count]) => (
                      <div key={name} style={{ marginBottom: 6 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <Text ellipsis style={{ maxWidth: "75%" }}>
                            {name}
                          </Text>
                          <Text type="secondary">{count}</Text>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 4,
                            background: "#f0f0f0",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(count / stats.locations[0][1]) * 100}%`,
                              background: "#8c8c8c",
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <Text strong>Участники</Text>
                <div style={{ marginTop: 8 }}>
                  {stats.participants.length === 0 ? (
                    <Text type="secondary">Нет данных</Text>
                  ) : (
                    stats.participants.slice(0, 10).map(([name, count]) => (
                      <div key={name} style={{ marginBottom: 6 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <Text ellipsis style={{ maxWidth: "75%" }}>
                            {name}
                          </Text>
                          <Text type="secondary">{count}</Text>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 4,
                            background: "#f0f0f0",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(count / stats.participants[0][1]) * 100}%`,
                              background: "#595959",
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Всего заданий: {stats.total}</Text>
            </div>
          </Card>
        )}

        <HistoryMasterPanel data={data} mutate={mutate} />

        {Object.entries(groupedChronology).map(([seasonTitle, quests]) => (
          <div key={seasonTitle}>
            <Divider style={{ borderColor: "gray" }}>
              <Title level={4}>{seasonTitle}</Title>
            </Divider>

            <Timeline
              titleSpan="100px"
              items={quests.map((quest) => {
                const lore = getLoreTime(quest.week);

                return {
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
                  styles: {
                    rail: {
                      borderInlineStartWidth: 3,
                      borderInlineStartColor: SEASON_COLORS[lore.seasonName],
                    },
                  },
                };
              })}
            />
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default QuestChronologyPage;
