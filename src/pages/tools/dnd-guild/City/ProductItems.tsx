import { useState } from "react";
import {
  Flex,
  Typography,
  Tag,
  Collapse,
  Button,
  Divider,
  Modal,
  Input,
  message,
} from "antd";
import type { CollapseProps } from "antd";
import { RoleGuard } from "../../../../utils/RoleGuard";
import { pb } from "../../../../API/PocketBase";
import type { BuildingData, Product } from "./types";

const { Text } = Typography;

const getQualityColor = (quality: Product["quality"]) => {
  switch (quality) {
    case "Обычный":
      return "default";
    case "Необычный":
      return "green";
    case "Редкий":
      return "blue";
    case "Очень редкий":
      return "purple";
    case "Легендарный":
      return "gold";
    default:
      return "default";
  }
};

export function ProductItems({ data }: { data: BuildingData }) {
  const [localProducts, setLocalProducts] = useState<Product[]>(
    data.products || [],
  );

  // Состояния для модалки и сырого JSON-текста
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jsonText, setJsonText] = useState("");

  // При открытии модалки конвертируем массив объектов в красивую JSON-строку
  const handleOpenEdit = () => {
    setJsonText(JSON.stringify(localProducts, null, 2));
    setIsEditModalOpen(true);
  };

  // Сохранение и валидация
  const handleSave = async () => {
    let parsedProducts: Product[];

    // 1. Проверяем, валидный ли это JSON
    try {
      parsedProducts = JSON.parse(jsonText);
      if (!Array.isArray(parsedProducts)) {
        throw new Error("Ожидался массив объектов");
      }
    } catch (error) {
      console.error(error);
      message.error("Ошибка в формате JSON. Проверьте синтаксис.");
      return; // Прерываем сохранение
    }

    // 2. Отправляем на сервер
    setIsSaving(true);
    try {
      await pb.collection("tools_guild_city").update(data.id, {
        products: parsedProducts,
      });

      setLocalProducts(parsedProducts);
      message.success("Список товаров успешно обновлен");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      message.error("Не удалось сохранить товары");
    } finally {
      setIsSaving(false);
    }
  };

  const productItems: CollapseProps["items"] = localProducts.map(
    (product, index) => ({
      key: index.toString(),
      label: (
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="small"
          className="w-full pr-2"
        >
          <Text strong>{product.name}</Text>
          <Flex gap="small">
            <Tag>кол-во: {product.count}</Tag>
            <Tag color={getQualityColor(product.quality)}>
              {product.quality}
            </Tag>
            <Tag color="gold" className="m-0">
              {product.cost} ⛃
            </Tag>
          </Flex>
        </Flex>
      ),
      children: (
        <Text type="secondary" className="whitespace-pre-wrap">
          {product.description}
        </Text>
      ),
    }),
  );

  return (
    <div className="max-h-[70vh] overflow-y-auto pt-4">
      <RoleGuard allowedRoles={["master"]}>
        <div className="mb-4">
          <Button type="primary" onClick={handleOpenEdit}>
            Редактировать JSON
          </Button>
          <Divider className="my-3" />
        </div>
      </RoleGuard>

      {localProducts.length > 0 ? (
        <Collapse items={productItems} ghost={false} />
      ) : (
        <Text type="secondary">В этом здании пока нет товаров.</Text>
      )}

      {/* Простая модалка с текстовым полем */}
      <Modal
        title={`Редактирование JSON: ${data.name}`}
        open={isEditModalOpen}
        onCancel={() => !isSaving && setIsEditModalOpen(false)}
        onOk={handleSave}
        confirmLoading={isSaving}
        okText="Сохранить"
        cancelText="Отмена"
        width={700}
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary" className="mb-2">
          Вставьте массив объектов. Убедитесь, что свойства обернуты в двойные
          кавычки.
        </Typography.Paragraph>

        <Input.TextArea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={15}
          className="font-mono"
          spellCheck={false}
        />
      </Modal>
    </div>
  );
}
