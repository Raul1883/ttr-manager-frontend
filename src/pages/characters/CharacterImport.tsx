import React, { useRef } from "react";

import { Button } from "antd";
import { pb } from "../../API/PocketBase";
import { useAuth } from "../../contexts/AuthContext";
import useApp from "antd/es/app/useApp";

export default ({ mutate }: { mutate: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { message } = useApp();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        uploadCharacter(jsonData, mutate);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        console.error("Ошибка парсинга JSON");
      }
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const uploadCharacter = async (data: any, mutate: any) => {
    if (!user) {
      return;
    }
    const body = {
      name: data.name,
      owner: user.id,
      data_fiels: {
        ...data,
      },
      list_schema: data.list_schema,
    };

    try {
      await pb.collection("characters").create(body);
      mutate();
    } catch {
      message.error("Что-то пошло не так. Уникальное имя? Старая версия?");
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Button onClick={handleButtonClick}>Загрузить из JSON</Button>
    </div>
  );
};
