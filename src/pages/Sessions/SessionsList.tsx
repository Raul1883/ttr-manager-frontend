import useSWR from "swr";
import type { SessionGet } from "../../types/Session";
import SessionPreview from "./SessionPreview";
import { Empty, Spin } from "antd";
import { pb } from "../../API/PocketBase";
import { COLLECTIONS } from "../../API/collections";

export default function SessionsList({ master = false }: { master: boolean }) {
  const {
    data: sessionsData,
    error: sessionsError,
    isLoading: isSessionsLoading,
    mutate,
  } = useSWR<SessionGet[]>([COLLECTIONS.sessions], ([url]) =>
    pb.collection(url).getFullList({
      expand: "company,genre,system,master,applications_via_session.user",
    }),
  );

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(`Точно?`);
    if (!confirmDelete) return;

    await pb.collection(COLLECTIONS.sessions).delete(id);
    await mutate();
  };

  if (isSessionsLoading) return <Spin />;

  if (sessionsError || !sessionsData || sessionsData?.length == 0)
    return <Empty description="Нет данных" />;

  return (
    // Сетка вместо Flex: на телефоне карточки идут в один столбец во всю
    // ширину, на планшете — в два, на широком экране — в три.
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sessionsData?.map((session) => (
        <SessionPreview
          key={session.id}
          session={session}
          master={master}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
}
