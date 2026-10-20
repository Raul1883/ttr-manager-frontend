import { Form, Input, Modal, Select, Spin } from "antd";
import type { ListSchemaPreview } from "../../types/ListSchemasTypes";
import useSWR from "swr";
import { pb } from "../../API/PocketBase";
import type { Character } from "../../types/Character";
import { useForm } from "antd/es/form/Form";
import { useAuth } from "../../contexts/AuthContext";

interface SystemModalProps {
  isModalOpen: boolean;
  setIsModalOpen: any;
  mutate: any;
}

export default ({ isModalOpen, setIsModalOpen, mutate }: SystemModalProps) => {
  const [form] = useForm();
  const { user } = useAuth();

  const {
    data: schemaData,
    isLoading: schemaIsLoading,
    error: schemaError,
  } = useSWR<ListSchemaPreview[]>(["list_schemas"], ([url]) =>
    pb.collection(url).getFullList({ fields: "id,name" }),
  );

  const onFinish = async (
    values: Omit<Character, "id" | "owner" | "data_fields">,
  ) => {
    setIsModalOpen(false);
    form.resetFields();

    const body = {
      owner: user?.id,
      data_fields: { name: values.name },
      ...values,
    };

    await pb.collection("characters").create(body);
    mutate();
  };

  if (schemaIsLoading || schemaError || !schemaData) {
    return (
      <Modal
        title="Выберите систему"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        footer={null}
      >
        <Spin />
      </Modal>
    );
  }

  return (
    <Modal
      title="Выберите систему"
      open={isModalOpen}
      onCancel={() => {
        setIsModalOpen(false);
      }}
      onOk={form.submit}
    >
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          label="Имя персонажа"
          name="name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="система"
          name="list_schema"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            options={schemaData?.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
