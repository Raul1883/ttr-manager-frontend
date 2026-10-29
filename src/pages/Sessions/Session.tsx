import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import useSWR from "swr";
import type { SessionGet } from "../../types/Session";
import {
  Button,
  Card,
  Divider,
  Flex,
  Space,
  Tag,
  Typography,
  Alert,
  Popconfirm,
} from "antd";
import MainLayout from "../../components/MainLayout";
import { ApplySessionModal } from "./ApplySessionModal";
import { pb } from "../../API/PocketBase";
import { COLLECTIONS } from "../../API/collections";
import { useAuth } from "../../contexts/AuthContext";
import useApp from "antd/es/app/useApp";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const { message } = useApp();

  const {
    data: sessionData,
    error: sessionError,
    isLoading: isSessionLoading,
    mutate: mutateSession,
  } = useSWR<SessionGet>(
    id ? [COLLECTIONS.sessions, id] : null,
    ([url, targetId]) =>
      pb.collection(url).getOne(targetId as string, {
        expand: "company,genre,system,master,applications_via_session.user",
      }),
  );

  if (sessionError) {
    return (
      <MainLayout>
        <div className="flex justify-center mt-10">
          <Alert
            type="error"
            title="Ошибка"
            description="Ошибка загрузки данных. Попробуйте позже."
            showIcon
          />
        </div>
      </MainLayout>
    );
  }

  const myApplicationFilter =
    sessionData?.expand.applications_via_session?.filter(
      (x) => x.user == user?.id,
    );

  const myApplication = myApplicationFilter ? myApplicationFilter[0] : null;

  const deleteApplication = async () => {
    if (myApplication)
      try {
        await pb.collection(COLLECTIONS.applications).delete(myApplication.id);
        mutateSession();
        message.success("удалено!");
      } catch {
        message.error("что-то пошло не так!");
      }
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center mt-4 md:mt-10">
        <Card
          className="w-full md:max-w-4xl p-0 sm:p-6"
          loading={isSessionLoading || !sessionData}
        >
          {sessionData && (
            <>
              <Flex justify="space-between" align="center" wrap gap="small">
                <Typography.Title
                  level={2}
                  className="mb-2 md:mb-4 break-words"
                >
                  {sessionData.title}
                </Typography.Title>
                <Space size="small" wrap>
                  <Tag>{sessionData.expand.genre.name}</Tag>
                  <Tag>{sessionData.expand.system.name}</Tag>
                  <Tag>{sessionData.expand.company.name}</Tag>
                  <Tag>{sessionData.scheduled_at}</Tag>
                  <Tag>{sessionData.expand.master?.login}</Tag>
                </Space>
                <Button type="dashed">
                  <Link to="/sessions">Закрыть</Link>
                </Button>
              </Flex>

              <Divider />
              <p className="break-words">
                {sessionData.description
                  ? sessionData.description
                  : "Мастер игры ещё не составил описания, но наверняка будет крайне интересно."}
              </p>
              <Divider />

              {myApplication ? (
                <Space wrap>
                  <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    Редактировать заявку
                  </Button>
                  <Popconfirm title="Точно?" onConfirm={deleteApplication}>
                    <Button danger>Удалить заявку</Button>
                  </Popconfirm>
                </Space>
              ) : (
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                  Хочу играть!
                </Button>
              )}
            </>
          )}
        </Card>

        {id && (
          <ApplySessionModal
            open={isModalOpen}
            sessionId={id}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => mutateSession()}
            myApplication={myApplication}
          />
        )}
      </div>
    </MainLayout>
  );
}
