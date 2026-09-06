import useSWR from "swr";
import { pb } from "../../../API/PocketBase";
import type { WikiRecord, WikiRecordCreate } from "./types";
import { WikiLayout } from "./WikiLayout";
import { useNavigate, useParams } from "react-router-dom";
import {
  Checkbox,
  Empty,
  FloatButton,
  Form,
  Input,
  Popconfirm,
  Skeleton,
  Typography,
} from "antd";
import { useState } from "react";
import FormItem from "antd/es/form/FormItem";
import useApp from "antd/es/app/useApp";
import MdLayout from "../../../components/MdLayout";
import { useForm } from "antd/es/form/Form";
import SaveOutlined from "@ant-design/icons/es/icons/SaveOutlined";
import EyeOutlined from "@ant-design/icons/es/icons/EyeOutlined";
import DeleteOutlined from "@ant-design/icons/es/icons/DeleteOutlined";

const fetcher = async (id: string) => {
  try {
    const res = await pb.collection<WikiRecord>("wiki").getOne(id);
    return res;
  } catch {
    const secondRes = await pb
      .collection<WikiRecord>("wiki")
      .getFullList({ filter: `title = "${id}"` });

    return secondRes[0];
  }
};

export default () => {
  const { id } = useParams();
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const { message } = useApp();
  const navigate = useNavigate();
  const [form] = useForm();

  const { data, error, isLoading } = useSWR<WikiRecord>(
    id ? id : null,
    fetcher,
  );

  if (isLoading || !id)
    return (
      <div className="markdown-body mx-8 mt-4 max-w-[80%] w-250">
        <Skeleton active />
      </div>
    );

  if (error)
    return (
      <div className="markdown-body mx-8 mt-4 max-w-[80%] w-250">
        <Empty />
      </div>
    );

  const hadleDelete = async () => {
    await pb.collection("wiki").delete(id);
    message.success("Перезагрузи страницу");
    message.success("Удалено!");
    navigate(`/tools/wiki/${id}`);
  };

  const hadleSave = async (values: WikiRecordCreate) => {
    try {
      await pb.collection("wiki").update(id, values);
      message.success("Сохранено!");
      navigate(`/tools/wiki/${id}`);
    } catch {
      message.error("Что-то пошло не так!");
    }
  };

  return (
    <WikiLayout>
      <div className="ml-4 mt-4 mx-8  mr-20">
        <Typography.Title>Редактор</Typography.Title>
        {isEdit ? (
          <Form initialValues={data} onFinish={hadleSave} form={form}>
            <FormItem name="title" label="Название" required>
              <Input />
            </FormItem>
            <FormItem name="slug" label="Путь" required>
              <Input placeholder="папка/папка/файл" />
            </FormItem>

            <FormItem name="isFolder" label="Папка?" valuePropName="checked">
              <Checkbox />
            </FormItem>
            <Typography.Title level={3}>Контент</Typography.Title>
            <FormItem name="content">
              <Input.TextArea autoSize />
            </FormItem>
          </Form>
        ) : (
          <MdLayout content={form.getFieldValue("content")} />
        )}
      </div>
      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24 }}>
        <FloatButton
          icon={<EyeOutlined />}
          onClick={() => setIsEdit(!isEdit)}
        />
        <FloatButton icon={<SaveOutlined />} onClick={form.submit} />

        <Popconfirm title={"Точно?"} onConfirm={hadleDelete}>
          <FloatButton icon={<DeleteOutlined />} />
        </Popconfirm>
      </FloatButton.Group>
    </WikiLayout>
  );
};
