import {
  Button,
  Drawer,
  Empty,
  List,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type {
  AchievementApplicationRecord,
  AchievementApplicationStatus,
} from "./types";

interface AchievementApplicationsDrawerProps {
  open: boolean;
  onClose: () => void;
  applications: AchievementApplicationRecord[];
  characters: Array<{ id: string; name: string }>;
  achievements: Array<{ id: string; title: string }>;
  busyId?: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const STATUS: Record<
  AchievementApplicationStatus,
  { label: string; color: string }
> = {
  pending: { label: "На согласовании", color: "processing" },
  approved: { label: "Одобрена", color: "success" },
  rejected: { label: "Отклонена", color: "error" },
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export default function AchievementApplicationsDrawer({
  open,
  onClose,
  applications,
  characters,
  achievements,
  busyId,
  onApprove,
  onReject,
}: AchievementApplicationsDrawerProps) {
  // Активные заявки поднимаем наверх — мастер работает именно с ними.
  const sorted = [...applications].sort((a, b) => {
    const aActive = a.status === "pending" ? 0 : 1;
    const bActive = b.status === "pending" ? 0 : 1;
    return aActive - bActive;
  });
  const pendingCount = applications.filter((item) => item.status === "pending").length;

  return (
    <Drawer
      title="Заявки на достижения"
      size={640}
      open={open}
      onClose={onClose}
      extra={
        <span className="text-xs text-[#595959]">
          активных: {pendingCount}
        </span>
      }
    >
      <Typography.Paragraph type="secondary">
        Игрок отправляет заявку с необязательным комментарием. После одобрения
        достижение записывается в прогресс его персонажа.
      </Typography.Paragraph>

      <List
        dataSource={sorted}
        locale={{ emptyText: <Empty description="Заявок пока нет" /> }}
        renderItem={(application) => {
          const characterName =
            application.expand?.character?.name ??
            characters.find((item) => item.id === application.character)?.name ??
            application.character;
          const achievementTitle =
            application.expand?.achievement?.title ??
            achievements.find((item) => item.id === application.achievement)
              ?.title ??
            application.achievement;
          const status = STATUS[application.status] ?? STATUS.pending;
          const date = formatDate(application.created);

          return (
            <List.Item
              actions={
                application.status === "pending"
                  ? [
                      <Popconfirm
                        key="approve"
                        title="Одобрить заявку?"
                        onConfirm={() => onApprove(application.id)}
                      >
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckOutlined />}
                          disabled={Boolean(busyId)}
                        >
                          Одобрить
                        </Button>
                      </Popconfirm>,
                      <Popconfirm
                        key="reject"
                        title="Отклонить заявку?"
                        onConfirm={() => onReject(application.id)}
                      >
                        <Button
                          danger
                          size="small"
                          icon={<CloseOutlined />}
                          disabled={Boolean(busyId)}
                        >
                          Отклонить
                        </Button>
                      </Popconfirm>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                title={
                  <Space size={8} wrap>
                    <span>{achievementTitle}</span>
                    <Tag color={status.color}>{status.label}</Tag>
                  </Space>
                }
                description={
                  <div className="space-y-1">
                    <div className="text-xs">
                      <b>Персонаж: </b>
                      {characterName}
                    </div>
                    {application.comment && (
                      <div className="text-xs text-[#595959]">
                        <b>Комментарий: </b>
                        {application.comment}
                      </div>
                    )}
                    {date && (
                      <div className="text-[11px] text-[#979795]">
                        отправлена {date}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </Drawer>
  );
}
