import {
  Form,
  Input,
  Select,
  Button,
  Table,
  Modal,
  InputNumber,
  Space,
  Popover,
  Typography,
} from "antd";
import { PlusOutlined, SettingOutlined } from "@ant-design/icons";
import type {
  ArrayField,
  Field,
  SelectField,
} from "../../types/CharacterSheet";
import { useState } from "react";

export type ArrayFieldProps = {
  field: ArrayField;
  fullName: string;
};

type CollSchema = {
  key: string;
  label: string;
  col: number;
};

export function InventoryTableField({ field, fullName }: ArrayFieldProps) {
  const listName = `${fullName}${field.label}`;
  const colsCount = 24;

  const getLS = () => {
    const sch = localStorage.getItem(`colls.${listName}`);

    if (!sch) {
      const defaultSchema = field.itemSchema.map((f) => ({
        key: `${fullName}${field.label}-${f.label}`,
        label: f.label,
        col: f.array_col || 1,
      }));

      return defaultSchema;
    }

    return JSON.parse(sch) as CollSchema[];
  };

  // 1. Состояние схемы колонок
  const [schema, setColSchema] = useState<CollSchema[]>(getLS());

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleColChange = (key: string, newCol: number | null) => {
    if (!newCol) return;
    setColSchema((prev) =>
      prev.map((item) => (item.key === key ? { ...item, col: newCol } : item)),
    );
  };

  function getSum() {
    return schema.reduce(
      (accumulator, currentValue) => accumulator + currentValue.col,
      0,
    );
  }

  const handleOkModal = () => {
    localStorage.setItem(`colls.${listName}`, JSON.stringify(schema));
    setIsSettingsOpen(false);
  };

  return (
    <div className="overflow-hidden mb-6">
      <h3 className="text-center pl-4 mb-2 font-semibold">{field.label}</h3>

      <Form.List name={listName}>
        {(fields, { add, remove }) => {
          const columns = field.itemSchema.map((column: any) => {
            const colKey = `${fullName}${field.label}-${column.label}`;
            // Ищем актуальную ширину в нашем state
            const currentSchemaObj = schema.find((x) => x.key === colKey);
            const colSpan = currentSchemaObj ? currentSchemaObj.col : 1;

            return {
              title: column.label,
              dataIndex: colKey,
              width: `${(colSpan / colsCount) * 100}%`,
              render: (_: any, record: any) => {
                return getFieldByType(
                  column.type,
                  column,
                  record.name,
                  record,
                  colKey,
                );
              },
            };
          });

          columns.push({
            title: "",
            dataIndex: "",
            width: `40px`, // Чуть фиксируем кнопку удаления, чтобы она не сжималась
            render: (_: any, record: any) => (
              <Button
                type="text"
                danger
                onClick={() => remove(record.name)}
                className="w-full flex items-center justify-center rounded-md"
              >
                -
              </Button>
            ),
          });

          return (
            <>
              <Table
                dataSource={fields}
                columns={columns}
                pagination={false}
                size="small"
              />

              <div className="flex justify-end mt-2 gap-x-2">
                <Button
                  type="dashed"
                  onClick={() => setIsSettingsOpen(true)}
                  icon={<SettingOutlined />}
                  className="hover:bg-gray-100"
                >
                  Ширина столбцов
                </Button>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  className="hover:bg-gray-100"
                >
                  Добавить строку
                </Button>
              </div>
            </>
          );
        }}
      </Form.List>

      {/* Модальное окно с настройками */}
      <Modal
        title={`Настройка ширины столбцов ${getSum()}/24 доли`}
        open={isSettingsOpen}
        onOk={() => setIsSettingsOpen(false)}
        onCancel={() => setIsSettingsOpen(false)}
        footer={[
          <Popover
            content={
              <Typography.Paragraph style={{ width: "400px" }}>
                В этом меню можно задать настройки ширины столбцов при помощи
                чисел. Желательно, чтобы в сумме их было 24, т.к. именно от
                этого числа отсчитывается относительное масштабирование.
                Подсказка сверху поможет понять, сколько именно сейчас долей
                занято.
              </Typography.Paragraph>
            }
            title="Что за числа?"
          >
            <Button disabled>Справка</Button>
          </Popover>,
          <Button key="ok" type="primary" onClick={handleOkModal}>
            Готово
          </Button>,
        ]}
      >
        <Space vertical className="w-full mt-4">
          {schema.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span>{item.label}</span>
              <InputNumber
                min={1}
                max={24}
                value={item.col}
                onChange={(val) => handleColChange(item.key, val)}
              />
            </div>
          ))}
        </Space>
      </Modal>
    </div>
  );
}

const getFieldByType = (
  type: string,
  field: Field,
  name: number,
  restField: any,
  fieldName: string,
) => {
  const { key, ...fieldProps } = restField;

  if (type === "select") {
    const select = field as SelectField;
    return (
      <Form.Item
        key={key}
        {...fieldProps}
        name={[name, fieldName]}
        style={{ margin: 0 }} // убираем внешние отступы, чтобы не растягивать ячейку
      >
        <Select
          className="w-full text-center"
          options={select.options.map((o) => ({ label: o, value: o }))}
        />
      </Form.Item>
    );
  }

  return (
    <Form.Item
      key={key}
      {...fieldProps}
      name={[name, fieldName]}
      style={{ margin: 0 }}
    >
      <Input.TextArea
        autoSize={{ minRows: 1 }}
        className="block text-center w-full outline-none resize-none overflow-hidden"
      />
    </Form.Item>
  );
};
