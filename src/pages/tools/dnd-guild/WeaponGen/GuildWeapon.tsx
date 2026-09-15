import { useState } from "react";
import MainLayout from "../../../../components/MainLayout";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Tag,
  Typography,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { advantages, disadvantages } from "./const";
import { generateWeapon } from "./gen";
import useApp from "antd/es/app/useApp";

export default () => {
  const [form] = useForm();
  const [modal, setModal] = useState(false);
  const [viewType, setViewType] = useState(true);
  const [genCount, setGenCount] = useState(0);
  const { message } = useApp();
  const [result, setResult] = useState<{
    quality: string;
    durability: number;
    properties: { title: string; description: string }[];
    name: string;
  } | null>(null);

  function handleFinish(values: any): void {
    setGenCount(genCount + 1);
    setResult(generateWeapon(values));
  }

  const handleCopy = async () => {
    try {
      const namePlaceHolder = `Нечто #${genCount}`;
      const props =
        result?.properties.length == 0
          ? ""
          : result?.properties
              .map((x) => `${x.title}. ${x.description}`)
              .join("\r\n");
      const info = `${result?.name || namePlaceHolder} (${result?.durability}/${result?.durability})
${result?.quality}
${props}`;
      await navigator.clipboard.writeText(info);
      message.success("Текст скопирован в буфер обмена");
    } catch (err) {
      message.error("Не удалось скопировать текст");
      console.error("Ошибка копирования:");
    }
  };

  return (
    <MainLayout>
      <Card
        title="Генератор"
        actions={[
          <Button onClick={form.submit}>Сгенерировать</Button>,
          <Button onClick={() => setModal(true)}>Свойства</Button>,
        ]}
      >
        <Typography.Text>
          Это генератор для системы кузнечного ремесла, может примяняться при
          создании персонажа, либо во время игры мастером. Если вы не знаете,
          что это, можете почитать wiki, раздел домашних правил.
        </Typography.Text>

        <Typography.Title level={4}>Параметры</Typography.Title>
        <Form form={form} onFinish={handleFinish}>
          <Form.Item
            name="lvl"
            label="Уровень кузнеца"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: 0, label: "0. Новичок" },
                { value: 1, label: "1. Подмастерье" },
                { value: 2, label: "2. Сельский кузнец" },
                { value: 3, label: "3. Опытный кузнец" },
                { value: 4, label: "4. Профильный мастер" },
                { value: 5, label: "5. Высший мастер" },
              ]}
            />
          </Form.Item>

          <Form.Item name="name" label="Название предмета">
            <Input />
          </Form.Item>
        </Form>
      </Card>
      <Divider />

      {result && (
        <Card
          title={`Результат генерации №${genCount}`}
          extra={<Tag>{result.quality}</Tag>}
          actions={[<Button onClick={handleCopy}>Копировать</Button>]}
        >
          <Typography.Title level={3}>{result.name}</Typography.Title>

          {result.properties.length == 0 ? (
            <div>Нет преимуществ, но зато и недостатков тоже нет</div>
          ) : (
            <div>
              <Typography.Title level={4}>Свойства</Typography.Title>
              {result.properties.map((x) => (
                <div>
                  <Typography.Title level={5}>{x.title}</Typography.Title>
                  <Typography.Paragraph>{x.description}</Typography.Paragraph>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Modal
        open={modal}
        onCancel={() => setModal(false)}
        footer={[
          <Button onClick={() => setViewType(!viewType)}>
            Перейти на {viewType ? "Недостатки" : "Преимущества"}
          </Button>,
        ]}
        title={!viewType ? "Недостатки" : "Преимущества"}
      >
        {/* Условный рендеринг в зависимости от выбора */}
        {viewType ? (
          <div>
            {advantages.map((x, index) => (
              <div key={index}>
                <Typography.Title level={5}>{x.title}</Typography.Title>
                <Typography.Paragraph>{x.description}</Typography.Paragraph>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {disadvantages.map((x, index) => (
              <div key={index}>
                <Typography.Title level={5}>{x.title}</Typography.Title>
                <Typography.Paragraph>{x.description}</Typography.Paragraph>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};
