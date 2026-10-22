import { useState } from "react";
import { Flex, Typography, Tag, Collapse, Button, Empty } from "antd";
import type { CollapseProps } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { RoleGuard } from "../../../../utils/RoleGuard";
import { ROLES } from "../../../../types/Role";
import type { BuildingData, Product } from "./types";
import { ProductEditor } from "./ProductEditor";
import { getQualityColor } from "./quality";

const { Text } = Typography;

interface ProductItemsProps {
  data: BuildingData;
  onProductsSaved?: (products: Product[]) => void;
}

export function ProductItems({ data, onProductsSaved }: ProductItemsProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const products = data.products ?? [];

  const productItems: CollapseProps["items"] = products.map(
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
          {product.description || "Описание не указано."}
        </Text>
      ),
    }),
  );

  return (
    <div className="max-h-[70vh] overflow-y-auto pt-4">
      <RoleGuard allowedRoles={[ROLES.master]}>
        <div className="mb-4">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsEditorOpen(true)}
          >
            Редактировать товары
          </Button>
        </div>
      </RoleGuard>

      {products.length > 0 ? (
        <Collapse items={productItems} ghost={false} />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="В этом здании пока нет товаров."
        />
      )}

      <ProductEditor
        building={data}
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={(products) => {
          onProductsSaved?.(products);
        }}
      />
    </div>
  );
}
