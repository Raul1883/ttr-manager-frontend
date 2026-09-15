import useSWR, { type KeyedMutator } from "swr";
import { Table } from "antd";
import { Button, type TableColumnsType } from "antd";
import MainLayout from "../../components/MainLayout";
import { pb } from "../../API/PocketBase";
import { SwrHandler } from "../../components/SwrHandler";
import { Link } from "react-router-dom";
import type {
  ApplicationRecord,
  ExpandedRecord,
} from "../../types/Application";
import DeleteOutlined from "@ant-design/icons/es/icons/DeleteOutlined";

const fetchApplications = async (): Promise<ApplicationRecord[]> => {
  const records = await pb.collection("applications").getFullList({
    sort: "-created",
    expand: "session,character,user",
  });
  return records as unknown as ApplicationRecord[];
};

const deleteApplications = async (
  id: string,
  mutate: KeyedMutator<ApplicationRecord[]>,
) => {
  await pb.collection("applications").delete(id);
  mutate();
};

export function Applications() {
  const { data, isLoading, error, mutate } = useSWR(
    "applications",
    fetchApplications,
  );
  const columns: TableColumnsType<ApplicationRecord> = [
    {
      title: "№",
      key: "index",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Пользователь",
      dataIndex: ["expand", "user"],
      key: "user",
      render: (user: ExpandedRecord, record) =>
        user?.name || user?.email || record.user,
    },
    {
      title: "Персонаж",
      dataIndex: ["expand", "character"],
      key: "character",
      render: (character: ExpandedRecord) => (
        <Link target="new" to={`/characters/${character.id}`}>
          {character.name}
        </Link>
      ),
    },
    {
      title: "Сессия",
      dataIndex: ["expand", "session"],
      key: "session",
      render: (session: ExpandedRecord) => (
        <Link target="new" to={`/sessions/${session.id}`}>
          {session.title}
        </Link>
      ),
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: "Дата создания",
      dataIndex: "created",
      key: "created",
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: "",
      dataIndex: "id",
      key: "delete",
      render: (value: string) => (
        <Button
          onClick={() => deleteApplications(value, mutate)}
          icon={<DeleteOutlined />}
        />
      ),
    },
  ];

  return (
    <MainLayout>
      <SwrHandler data={data} isLoading={isLoading} error={error}>
        <Table dataSource={data} columns={columns} rowKey="id" />
      </SwrHandler>
    </MainLayout>
  );
}
