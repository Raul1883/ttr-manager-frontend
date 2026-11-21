import { useRef, useState } from "react";
import { Button, Modal, Typography } from "antd";
import useApp from "antd/es/app/useApp";
import { pb } from "../../API/PocketBase";
import { COLLECTIONS } from "../../API/collections";
import { useAuth } from "../../contexts/AuthContext";
import {
  convertLssToCharacter,
  isDndSchemaName,
  isLssCharacter,
} from "./lssImport";

interface CharacterImportProps {
  mutate: () => void;
}

export default function CharacterImport({ mutate }: CharacterImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { message } = useApp();
  const [isLssInfoOpen, setIsLssInfoOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        if (isLssCharacter(jsonData)) {
          await importLssCharacter(jsonData);
        } else {
          await uploadCharacter(jsonData);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        console.error("Ошибка импорта персонажа", err);
        message.error("Не удалось импортировать персонажа");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const findDndSchemaId = async (): Promise<string | null> => {
    const schemas = await pb
      .collection(COLLECTIONS.listSchemas)
      .getFullList<{ id: string; name: string }>({ fields: "id,name" });
    const dnd = schemas.find((schema) => isDndSchemaName(schema.name));
    return dnd?.id ?? null;
  };

  const importLssCharacter = async (data: unknown) => {
    if (!user) return;

    const schemaId = await findDndSchemaId();
    if (!schemaId) {
      message.error("Схема D&D не найдена в PocketBase");
      return;
    }

    const body = convertLssToCharacter(data, schemaId, user.id);
    await pb.collection(COLLECTIONS.characters).create(body);
    message.success("Персонаж импортирован из Long Story Short");
    mutate();
  };

  const uploadCharacter = async (data: Record<string, unknown>) => {
    if (!user) {
      return;
    }
    const body = {
      name: data.name,
      owner: user.id,
      data_fields: {
        ...data,
      },
      list_schema: data.list_schema,
    };

    try {
      await pb.collection(COLLECTIONS.characters).create(body);
      mutate();
    } catch {
      message.error("Что-то пошло не так. Уникальное имя? Старая версия?");
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Button onClick={handleButtonClick}>Загрузить из JSON</Button>
      <Button onClick={() => setIsLssInfoOpen(true)}>lss?</Button>

      <Modal
        title="Импорт из Long Story Short"
        open={isLssInfoOpen}
        onCancel={() => setIsLssInfoOpen(false)}
        footer={null}
      >
        <Typography.Paragraph>
          Кнопка «Загрузить из JSON» автоматически распознаёт JSON персонажа
          Long Story Short.
        </Typography.Paragraph>

        <Typography.Title level={5}>Переносятся</Typography.Title>
        <ul className="list-disc pl-5 mb-4">
          <li>
            Имя, класс/подкласс, раса, предыстория, уровень, бонус мастерства.
          </li>
          <li>Характеристики: значение и модификатор.</li>
          <li>
            Спасброски и навыки: итоговое число уже с учётом бонуса мастерства и
            экспертизы.
          </li>
          <li>
            Хиты, временные ХП, кости хитов, скорость, инициатива (или мод.
            ЛОВ).
          </li>
          <li>
            Класс защиты — только если в LSS это простое число, не формула.
          </li>
          <li>Монеты: мм, см, зм, пм.</li>
          <li>Оружие: название, бонус атаки, урон/вид, примечание.</li>
          <li>
            Базовая характеристика заклинаний, модификатор, бонус атаки, СЛ
            спасброска.
          </li>
        </ul>

        <Typography.Title level={5}>Не переносятся</Typography.Title>
        <ul className="list-disc pl-5 mb-0">
          <li>КД из формул, спасброски от смерти, кости хитов</li>
          <li>Список заклинаний, ресурсы, ячейки как массив.</li>
          <li>Большие текстовые поля</li>
          <li>
            Поля, где нет однозначного соответствия в текущем D&amp;D-листе.
          </li>
        </ul>
      </Modal>
    </>
  );
}
