import useSWR from "swr";
import { create, deleteById, getAll } from "../API/Fetcher";
import { COLLECTIONS } from "../API/collections";
import { useState, useEffect } from "react";
import type { EntityCreate } from "../types/Entity";
import { App, Button, Flex, Popconfirm, Select, type SelectProps } from "antd";

type attributeType = typeof COLLECTIONS.genres | typeof COLLECTIONS.systems | typeof COLLECTIONS.companies;

type Entity = {
  id: string;
  name: string;
};

// Пропсы, которые Antd Form автоматически прокинет в компонент
interface AttributeEditorProps {
  type: attributeType;
  value?: string; // Текущее id из формы
  onChange?: (value: string | undefined) => void; // Колбэк для формы
}

const typeToStr = (value: attributeType) => {
  const typeToStr = {
    [COLLECTIONS.genres]: "Жанр",
    [COLLECTIONS.systems]: "Система",
    [COLLECTIONS.companies]: "Компания",
  };

  return typeToStr[value];
};

export default ({ type, value, onChange }: AttributeEditorProps) => {
  const { data, isLoading, error, mutate } = useSWR<Entity[]>(type, getAll);
  const [options, setOptions] = useState<SelectProps["options"]>([]);
  const { message } = App.useApp();

  useEffect(() => {
    if (!data) return;
    const mapped = data.map((x) => ({
      value: x.id.toString(),
      label: x.name,
    }));
    setOptions(mapped);
  }, [data]);

  const handleDelete = async () => {
    if (!value) {
      message.warning("Нет выбранного элемента для удаления");
      return;
    }

    try {
      await deleteById(type, value);
      await mutate();
      message.destroy("Удалено");

      if (onChange) onChange(undefined);
    } catch (error) {
      message.error(
        "Не удалось удалить элемент. Возможно он используется в сохраненной версии этой или другой сессии?",
      );
    }
  };

  const handleChange = async (valueArr: string[]) => {
    const inputValue = valueArr[valueArr.length - 1];

    if (!inputValue) {
      if (onChange) onChange(undefined);
      return;
    }

    const existingEntity = data?.find(
      (x) =>
        x.id.toString() === inputValue ||
        x.name.toLowerCase() === inputValue.toLowerCase(),
    );

    if (existingEntity) {
      if (onChange) onChange(existingEntity.id);
    } else {
      try {
        const newEntity: EntityCreate = { name: inputValue };
        const createdEntity = await create<EntityCreate, Entity>(type, newEntity);

        await mutate();

        if (onChange) onChange(createdEntity.id);
      } catch (error) {
        message.error("Не удалось создать элемент");
      }
    }
  };

  if (isLoading || error || !data) {
    return <div style={{ width: "100%" }}>Загрузка {typeToStr(type)}...</div>;
  }

  const selectValue = value ? [value] : [];

  return (
    <Flex vertical={false} style={{ width: "100%", gap: "8px" }} align="center">
      <Select
        mode="tags"
        placeholder={`Выберите или введите свой ${typeToStr(type).toLowerCase()}`}
        maxCount={1}
        value={selectValue}
        onChange={handleChange}
        options={options}
        style={{ width: "100%" }}
      />
      <Popconfirm
        title="Точно?"
        onConfirm={handleDelete}
        description="Это действие удалит данные на сервере. Действие невозможно, если какая-то из сессий его использует."
      >
        <Button danger type="primary" disabled={!value}>
          Удалить
        </Button>
      </Popconfirm>
    </Flex>
  );
};
