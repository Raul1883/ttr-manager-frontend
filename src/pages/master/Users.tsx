import useSWR from "swr";
import { getAll } from "../../API/Fetcher";
import { COLLECTIONS } from "../../API/collections";
import MainLayout from "../../components/MainLayout";
import { Table, Tag, type TableProps } from "antd";
import UserActions from "./UserActions";
import type { Role } from "../../types/Role";
import { ROLES } from "../../types/Role";

export interface UserRead {
  id: string;
  login: string;
  contact_info?: string | null;
  role: Role;
}

export default () => {
  const {
    data: users,
    error,
    isLoading,
    mutate,
  } = useSWR<UserRead[]>(COLLECTIONS.users, getAll, {
    revalidateOnFocus: false,
  });

  // Обработка состояний загрузки и ошибки
  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-gray-600">
        Загрузка пользователей...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Ошибка загрузки: {error.message}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <div className="p-4 text-gray-500">Пользователи не найдены.</div>;
  }

  const tableData = users.map((x) => {
    return {
      key: x.id,
      id: x.id,
      login: x.login,
      contact_info: x.contact_info,
      role: x.role,
    };
  });

  const columns: TableProps<UserRead>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Логин",
      dataIndex: "login",
      key: "login",
    },
    {
      title: "Контакты",
      dataIndex: "contact_info",
      key: "contact_info",
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      render: (text) => (
        <Tag color={text == ROLES.master ? "blue" : "green"}>{text}</Tag>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => <UserActions data={record} mutate={mutate} />,
    },
  ];

  return (
    <MainLayout>
      <Table<UserRead> dataSource={tableData} columns={columns} />
    </MainLayout>
  );
};
