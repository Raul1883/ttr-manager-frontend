import useSWR from "swr";
import type { SessionGet } from "../../types/Session";
import SessionPreview from "./SessionPreview";
import { Empty, Flex, Spin } from "antd";
import { pb } from "../../API/PocketBase";

export default ({ master = false }: { master: boolean }) => {
  const {
    data: sessionsData,
    error: sessionsError,
    isLoading: isSessionsLoading,
    mutate,
  } = useSWR<SessionGet[]>(["sessions"], ([url]) =>
    pb.collection(url).getFullList({
      expand: "company,genre,system,master,applications_via_session.user",
    }),
  );

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(`Точно?`);
    if (!confirmDelete) return;

    await pb.collection("sessions").delete(id);
    await mutate();
  };

  if (isSessionsLoading) return <Spin />;

  if (sessionsError || !sessionsData || sessionsData?.length == 0)
    return <Empty description="Нет данных" />;

  return (
    <Flex wrap gap="large" justify="space-between">
      {sessionsData?.map((session) => (
        <SessionPreview
          key={session.id}
          session={session}
          master={master}
          handleDelete={handleDelete}
        />
      ))}
    </Flex>
  );
};
