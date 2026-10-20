import { Button, Input, Modal, Typography } from "antd";
import type { Character } from "../../types/Character";
import { useState } from "react";
import EditOutlined from "@ant-design/icons/es/icons/EditOutlined";
import { pb } from "../../API/PocketBase";
import { COLLECTIONS } from "../../API/collections";
import useApp from "antd/es/app/useApp";

interface CharModalProps {
  mutate: any;
  character: Character;
}

export default ({ character, mutate }: CharModalProps) => {
  const [modal, setModal] = useState(false);
  const [name, newName] = useState<string>(character.name);
  const { message } = useApp();

  const handleSave = async () => {
    const body = {
      name: name,
    };
    try {
      await pb.collection(COLLECTIONS.characters).update(character.id, body);
      mutate();
      message.success("Успешно!");
      setModal(false);
    } catch {
      message.error("Что-то пошло не так");
    }
  };

  return (
    <div>
      <Button onClick={() => setModal(true)} icon={<EditOutlined />} />
      <Modal open={modal} onCancel={() => setModal(false)} onOk={handleSave}>
        <Typography.Title level={4}>Новое имя</Typography.Title>
        <Input value={name} onChange={(e) => newName(e.target.value)} />
      </Modal>
    </div>
  );
};
