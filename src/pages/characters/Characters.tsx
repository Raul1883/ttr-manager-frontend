import useSWR from "swr";
import { deleteById } from "../../API/Fetcher";
import { COLLECTIONS } from "../../API/collections";
import { useState } from "react";
import { Button, Card, Flex, Popconfirm, Space, Typography } from "antd";
import CharacterImport from "./CharacterImport";
import MainLayout from "../../components/MainLayout";
import { pb } from "../../API/PocketBase";
import type { Character } from "../../types/Character";
import NavButton from "../../components/NavButton";
import SystemsModal from "./SystemsModal";
import { useAuth } from "../../contexts/AuthContext";
import CharacterEditButton from "./CharacterEditButton";
import { SwrHandler } from "../../components/SwrHandler";
import { RoleGuard } from "../../utils/RoleGuard";
import { ROLES } from "../../types/Role";

export default function CharacterList() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const [myChars, setMyChars] = useState(true);
  const {
    data: characterData,
    isLoading: chrIsLoading,
    error: chrError,
    mutate,
  } = useSWR<Character[]>(
    user ? [COLLECTIONS.characters, user.id] : null,
    ([url]) =>
      pb.collection(url).getFullList({
        fields: "id,name,owner",
      }),
  );

  const deleteChar = async (id: string) => {
    await deleteById(COLLECTIONS.characters, id);
    await mutate();
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between mb-8 gap-2">
          <Typography.Title>Персонажи</Typography.Title>
          <Space>
            <RoleGuard allowedRoles={[ROLES.master]}>
              <Button
                onClick={() => {
                  setMyChars(!myChars);
                }}
              >
                {myChars ? "Все персонажи" : "Мои персонажи"}
              </Button>
            </RoleGuard>
            <CharacterImport mutate={mutate} />
            <Button
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              + Создать персонажа
            </Button>
          </Space>
        </div>

        <SwrHandler
          isLoading={chrIsLoading}
          error={chrError}
          data={characterData}
        >
          <Flex gap="medium" justify="" wrap>
            {characterData?.map((character) => {
              if (myChars && character.owner != user?.id) return null;

              return (
                <Card
                  key={character.id}
                  title={character.name}
                  style={{ width: 300 }}
                  extra={
                    <CharacterEditButton
                      character={character}
                      mutate={mutate}
                    />
                  }
                  actions={[
                    <NavButton to={`${character.id}`}>Подробнее</NavButton>,
                    <Popconfirm
                      title="Точно?"
                      onConfirm={() => deleteChar(character.id)}
                      okText="Да"
                      cancelText="Нет"
                      okButtonProps={{ danger: true }} // Делаем кнопку подтверждения красной
                    >
                      <Button danger>Удалить</Button>
                    </Popconfirm>,
                  ]}
                />
              );
            })}
          </Flex>
        </SwrHandler>
      </div>

      <SystemsModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        mutate={mutate}
      />
    </MainLayout>
  );
}
