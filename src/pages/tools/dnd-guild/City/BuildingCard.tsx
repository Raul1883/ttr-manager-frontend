import { useState } from "react";
import { Card, Button, Modal, Flex, Typography, Popover } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProductItems } from "./ProductItems";
import type { BuildingData } from "./types";

const { Text } = Typography;

const levelToBills = [1, 3, 5, 7, 9];

export default ({ data }: { data: BuildingData }) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isProductsModalOpen, setIsProductsModalOpen] =
    useState<boolean>(false);

  return (
    <>
      <Card
        className="w-70 pb-2"
        cover={
          <img
            alt={data.name}
            src={data.img}
            className="h-40 object-contain p-2"
          />
        }
        title={data.name}
        extra={
          <Popover
            content={
              <Typography.Text>
                Купчих для улучшения: {levelToBills[data.level] ?? 0}
              </Typography.Text>
            }
            trigger="hover"
            placement="bottomLeft"
          >
            lvl {data.level}
          </Popover>
        }
        actions={
          data.products
            ? [
                <Button onClick={() => setIsDetailsModalOpen(true)}>
                  Подробнее
                </Button>,
                <Button onClick={() => setIsProductsModalOpen(true)}>
                  Товары
                </Button>,
              ]
            : [
                <Button onClick={() => setIsDetailsModalOpen(true)}>
                  Подробнее
                </Button>,
              ]
        }
      />

      {/* Модалка с описанием здания */}
      <Modal
        title={data.name}
        open={isDetailsModalOpen}
        onCancel={() => setIsDetailsModalOpen(false)}
        footer={null}
        width="60%"
        centered
      >
        <Flex
          vertical
          gap="small"
          className="max-h-[70vh] overflow-y-auto pt-2"
        >
          <Text type="secondary">
            Купчих для улучшения: {levelToBills[data.level] ?? 0}
          </Text>
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.description}
            </ReactMarkdown>
          </div>
        </Flex>
      </Modal>

      {/* Модалка со списком товаров */}
      <Modal
        title={`Товары: ${data.name}`}
        open={isProductsModalOpen}
        onCancel={() => setIsProductsModalOpen(false)}
        footer={null}
        width="50%"
        centered
      >
        <ProductItems data={data} />
      </Modal>
    </>
  );
};
