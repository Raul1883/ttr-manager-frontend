import { Checkbox, Form, Input, Modal, Typography } from "antd";
import type { WikiRecord, WikiRecordCreate } from "./types";
import FormItem from "antd/es/form/FormItem";
import { useForm } from "antd/es/form/Form";
import useApp from "antd/es/app/useApp";
import { pb } from "../../../API/PocketBase";
import { COLLECTIONS } from "../../../API/collections";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

interface ModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  mutate: () => void;
  slug: string; // родительский путь (папка, в которой создаём)
}

export default ({ isModalOpen, closeModal, mutate, slug }: ModalProps) => {
  const [form] = useForm();
  const { message } = useApp();
  const navigate = useNavigate();

  // Следим за значениями полей, чтобы обновлять отображение склеенного пути
  const path = Form.useWatch("path", form);
  const title = Form.useWatch("title", form);

  // Формируем итоговый slug для отображения и отправки
  const fullSlug = path
    ? `${path.replace(/\/+$/, "")}/${title || ""}`
    : title || "";

  const onFinish = async (values: {
    path: string;
    title: string;
    isFolder: boolean;
  }) => {
    // Склеиваем путь и имя в один slug
    const slug = values.path
      ? `${values.path.replace(/\/+$/, "")}/${values.title}`
      : values.title;

    // Создаём объект для отправки (поля title и slug обязательны в WikiRecordCreate)
    const payload: WikiRecordCreate = {
      title: values.title,
      slug: slug,
      isFolder: values.isFolder,
      content: "",
    };

    const res = await pb.collection<WikiRecord>(COLLECTIONS.wiki).create(payload);
    message.success("Создано!");
    navigate(`/tools/wiki/edit/${res.id}`);
    mutate();
  };

  return (
    <Modal
      open={isModalOpen}
      onCancel={closeModal}
      title="Создать"
      onOk={form.submit}
    >
      <Form
        onFinish={onFinish}
        form={form}
        initialValues={{
          path: slug || "", // переданный родительский путь
          title: "",
          isFolder: false,
        }}
      >
        <FormItem name="path" label="Путь (каталоги)">
          <Input placeholder="папка/подпапка" />
        </FormItem>

        <FormItem
          name="title"
          label="Имя"
          rules={[{ required: true, message: "Введите имя" }]}
        >
          <Input placeholder="название страницы" />
        </FormItem>

        {/* Отображение склеенного значения */}
        <FormItem label="Полный путь (будет сохранён)">
          <Text code>{fullSlug || "—"}</Text>
        </FormItem>

        <FormItem name="isFolder" label="Папка?" valuePropName="checked">
          <Checkbox />
        </FormItem>
      </Form>
    </Modal>
  );
};
