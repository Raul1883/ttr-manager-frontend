import { useMemo, useState } from "react";
import {
  Button,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useApp from "antd/es/app/useApp";
import { pb } from "../../../../API/PocketBase";
import { COLLECTIONS } from "../../../../API/collections";
import type { BuildingData, Product } from "./types";
import {
  getQualityColor,
  QUALITY_GROUPS,
  type ProductQuality,
} from "./quality";

const { Text } = Typography;

interface ProductFormValues {
  name: string;
  quality: ProductQuality;
  cost: number;
  count: number;
  description?: string;
}

interface ProductRow extends Product {
  index: number;
}

interface ProductEditorProps {
  building: BuildingData;
  open: boolean;
  onClose: () => void;
  onSaved: (products: Product[]) => void;
}

const DEFAULT_VALUES: Partial<ProductFormValues> = {
  quality: "Обычный",
  cost: 0,
  count: 1,
};

export function ProductEditor({
  building,
  open,
  onClose,
  onSaved,
}: ProductEditorProps) {
  const [products, setProducts] = useState<Product[]>(
    building.products ?? [],
  );
  const [search, setSearch] = useState("");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form] = Form.useForm<ProductFormValues>();
  const { message } = useApp();

  // Сбрасываем черновик при каждом открытии прямо во время рендера —
  // это рекомендованный React способ реагировать на смену пропса open
  // без каскадного рендера из useEffect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setProducts(building.products ?? []);
      setSearch("");
    }
  }

  const rows = useMemo<ProductRow[]>(
    () => products.map((product, index) => ({ ...product, index })),
    [products],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        (row.description ?? "").toLowerCase().includes(query),
    );
  }, [rows, search]);

  const handleOpenCreate = () => {
    setEditingIndex(null);
    form.resetFields();
    form.setFieldsValue(DEFAULT_VALUES);
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (row: ProductRow) => {
    setEditingIndex(row.index);
    form.setFieldsValue({
      name: row.name,
      quality: row.quality,
      cost: row.cost,
      count: row.count,
      description: row.description,
    });
    setIsItemModalOpen(true);
  };

  const handleDelete = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemFinish = (values: ProductFormValues) => {
    const product: Product = {
      name: values.name.trim(),
      quality: values.quality,
      cost: values.cost,
      count: values.count,
      description: values.description?.trim() ?? "",
    };

    setProducts((prev) =>
      editingIndex === null
        ? [...prev, product]
        : prev.map((item, i) => (i === editingIndex ? product : item)),
    );
    setIsItemModalOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await pb.collection(COLLECTIONS.guildCity).update(building.id, {
        products,
      });
      message.success("Список товаров обновлён");
      onSaved(products);
      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении товаров:", error);
      message.error("Не удалось сохранить товары");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: TableColumnsType<ProductRow> = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Качество",
      dataIndex: "quality",
      key: "quality",
      width: 180,
      filters: QUALITY_GROUPS.flatMap((group) =>
        group.options.map((option) => ({
          text: option.label,
          value: option.value,
        })),
      ),
      onFilter: (value, row) => row.quality === value,
      render: (quality: ProductQuality) => (
        <Tag color={getQualityColor(quality)}>{quality}</Tag>
      ),
    },
    {
      title: "Цена",
      dataIndex: "cost",
      key: "cost",
      width: 110,
      align: "right",
      sorter: (a, b) => a.cost - b.cost,
      render: (cost: number) => <Text>{cost} ⛃</Text>,
    },
    {
      title: "Кол-во",
      dataIndex: "count",
      key: "count",
      width: 100,
      align: "right",
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: "Действия",
      key: "actions",
      width: 110,
      align: "center",
      render: (_, row) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={`Изменить ${row.name}`}
            onClick={() => handleOpenEdit(row)}
          />
          <Popconfirm
            title="Удалить товар?"
            description={row.name}
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(row.index)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Удалить ${row.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={`Товары: ${building.name}`}
      open={open}
      onCancel={() => !isSaving && onClose()}
      width={900}
      centered
      destroyOnHidden
      footer={
        <Flex justify="space-between" align="center" gap="middle" wrap>
          <Text type="secondary">Всего товаров: {products.length}</Text>
          <Space>
            <Button onClick={onClose} disabled={isSaving}>
              Отмена
            </Button>
            <Button
              type="primary"
              loading={isSaving}
              onClick={handleSave}
              disabled={products.length === 0 && !building.products?.length}
            >
              Сохранить
            </Button>
          </Space>
        </Flex>
      }
    >
      <Flex vertical gap="middle">
        <Flex justify="space-between" align="center" gap="middle" wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Поиск по названию или описанию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-80"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            Добавить товар
          </Button>
        </Flex>

        <Table<ProductRow>
          rowKey="index"
          size="small"
          columns={columns}
          dataSource={filteredRows}
          pagination={false}
          scroll={{ y: 420 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  products.length === 0
                    ? "Товаров пока нет — добавьте первый"
                    : "Ничего не найдено"
                }
              />
            ),
          }}
        />

        <Text type="secondary">
          Цена указывается в золотых монетах. Качество — это редкость предмета
          или его состояние.
        </Text>
      </Flex>

      <Modal
        title={editingIndex === null ? "Новый товар" : "Редактирование товара"}
        open={isItemModalOpen}
        onCancel={() => setIsItemModalOpen(false)}
        footer={null}
        forceRender
        centered
      >
        <Form<ProductFormValues>
          form={form}
          layout="vertical"
          onFinish={handleItemFinish}
          initialValues={DEFAULT_VALUES}
        >
          <Form.Item
            label="Название"
            name="name"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Укажите название товара",
              },
            ]}
          >
            <Input placeholder="Например, Стальной меч" maxLength={120} />
          </Form.Item>

          <Form.Item
            label="Качество"
            name="quality"
            rules={[{ required: true, message: "Выберите качество" }]}
          >
            <Select
              options={QUALITY_GROUPS}
              placeholder="Редкость или состояние"
              showSearch={{ optionFilterProp: "label" }}
            />
          </Form.Item>

          <Flex gap="middle">
            <Form.Item
              label="Цена, ⛃"
              name="cost"
              className="flex-1"
              rules={[{ required: true, message: "Укажите цену" }]}
            >
              <InputNumber min={0} precision={0} className="w-full" />
            </Form.Item>

            <Form.Item
              label="Количество"
              name="count"
              className="flex-1"
              rules={[{ required: true, message: "Укажите количество" }]}
            >
              <InputNumber min={0} precision={0} className="w-full" />
            </Form.Item>
          </Flex>

          <Form.Item label="Описание" name="description">
            <Input.TextArea
              rows={4}
              maxLength={1000}
              showCount
              placeholder="Что это за товар и чем он полезен"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsItemModalOpen(false)}>Отмена</Button>
              <Button type="primary" htmlType="submit">
                {editingIndex === null ? "Добавить" : "Сохранить"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
}
