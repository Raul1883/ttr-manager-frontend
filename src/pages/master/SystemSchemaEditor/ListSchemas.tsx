import useSWR from "swr";
import { deleteById, getAll } from "../../../API/Fetcher";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  ListSchemaPreview,
} from "../../../types/ListSchemasTypes";
import MainLayout from "../../../components/MainLayout";
import {
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Typography,
} from "antd";
import type { ListSchema } from "../../characters/types/CharacterSheet";
import { pb } from "../../../API/PocketBase";
import { COLLECTIONS } from "../../../API/collections";

export default () => {
  const [newName, setNewName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const { data, isLoading, error, mutate } = useSWR<ListSchemaPreview[]>(
    COLLECTIONS.listSchemas,
    getAll,
  );

  if (isLoading) {
    return (
      <MainLayout>
        <Divider>
          <Typography.Title>Схемы</Typography.Title>
        </Divider>
        <Spin size="large" />
      </MainLayout>
    );
  }
  if (error || !data) {
    return (
      <MainLayout>
        <Divider>
          <Typography.Title>Схемы</Typography.Title>
        </Divider>
        <Empty description="Ошибка загрузки схем" />
      </MainLayout>
    );
  }

  const handleDelete = async (id: string) => {
    await deleteById(COLLECTIONS.listSchemas, id);
    mutate();
  };

  const handleCreate = async () => {
    setIsModalOpen(false);

    const body: Omit<ListSchema, "id"> = {
      name: newName,
      schema: {
        sections: [
          {
            title: "Название секции",
            fields: [],
          },
        ],
        layout: [],
      },
    };

    await pb.collection(COLLECTIONS.listSchemas).create(body);
    mutate();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setNewName(e.target.value);
  };

  return (
    <MainLayout>
      <Divider>
        <Typography.Title>Схемы</Typography.Title>
      </Divider>
      <div className="flex items-center justify-center">
        <Flex style={{ width: "60%" }} vertical gap="medium">
          {data?.map((schema: ListSchemaPreview) => (
            <Card
              title={schema.name}
              key={schema.id}
              extra={
                <Space>
                  <Button onClick={() => navigate(schema.id.toString())}>
                    Редактировать
                  </Button>
                  <Popconfirm
                    title="Точно?"
                    onConfirm={() => {
                      handleDelete(schema.id);
                    }}
                  >
                    <Button danger>Удалить</Button>
                  </Popconfirm>
                </Space>
              }
              color="ant-layout-body-bg"
            />
          ))}

          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Создать
          </Button>
        </Flex>
      </div>

      <Modal
        title="Новая схема"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        onOk={handleCreate}
      >
        <Input value={newName} onChange={handleChange} />
      </Modal>
    </MainLayout>
  );
};
