import { useParams } from "react-router-dom";
import useSWR from "swr";
import { pb } from "../../../API/PocketBase";
import { type CharacterWithSchema } from "../../../types/Character";
import { useAuth } from "../../../contexts/AuthContext";
import SheetLayout from "./SheetLayout";
import { Form } from "antd";

import type { Layout } from "react-grid-layout";
import { useEffect, useState } from "react";
import { useForm } from "antd/es/form/Form";
import CharLayout from "./CharLayout";
import useApp from "antd/es/app/useApp";
import DownloadJSON from "../../../utils/DownloadJSON";

export default () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [layout, setLayout] = useState<Layout>();
  const [form] = useForm();
  const { message } = useApp();

  const { data, isLoading, error, mutate } = useSWR<CharacterWithSchema>(
    user && id ? ["characters", id] : null,
    ([collection, targetId]) =>
      pb.collection(collection).getOne(targetId as string, {
        expand: "list_schema",
      }),
  );

  // Layout init
  useEffect(() => {
    const saved = localStorage.getItem(`character-layout-${id}`);

    if (saved) {
      setLayout(JSON.parse(saved));
    } else {
      setLayout(data?.expand.list_schema.schema.layout);
    }
  }, [id, data]);

  const layoutReset = () => {
    setLayout(data?.expand.list_schema.schema.layout);
  };

  const copyLayout = async () => {
    await navigator.clipboard.writeText(JSON.stringify(layout));
    message.success("Скопировано!");
  };

  if (isLoading || error || !user || !data || !layout || !id)
    return <div>Что-то пошло не так :(. Попробуйте вернутся на главную и перелогиниться</div>;

  const onFinish = async (values: any) => {
    const body = {
      data_fiels: {
        ...values,
      },
    };

    try {
      await pb.collection("characters").update(id, body);
      mutate();
      message.success("Сохранено");
    } catch {
      message.error("Что-то пошло не так");
    }
  };

  const saveJson = () => {
    const values = {
      list_schema: data.list_schema,
      name: data.name,
      ...form.getFieldsValue(),
    };
    DownloadJSON(values);
    message.success("Сохранено");
  };

  const character = data?.data_fiels;
  const sections = data?.expand.list_schema.schema.sections;

  return (
    <CharLayout
      systemName={data.expand.list_schema.name}
      save={form.submit}
      resetLayout={layoutReset}
      saveJson={saveJson}
      copyLayout={copyLayout}
    >
      <Form form={form} onFinish={onFinish} initialValues={character}>
        <SheetLayout
          layout={layout}
          schema={sections}
          systemId={id}
          setLayout={setLayout}
        />
      </Form>
    </CharLayout>
  );
};
