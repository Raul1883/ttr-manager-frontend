import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import { Tree, Spin, Alert, Typography, Button, Space, Menu } from "antd";
import type { MenuProps } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { buildAntdTree } from "./treeBuilder";
import { pb } from "../../../API/PocketBase";
import { COLLECTIONS } from "../../../API/collections";
import type { WikiRecord } from "./types";
import FileTextOutlined from "@ant-design/icons/es/icons/FileTextOutlined";
import FolderOutlined from "@ant-design/icons/es/icons/FolderOutlined";
import PlusCircleOutlined from "@ant-design/icons/es/icons/PlusCircleOutlined";
import { RoleGuard } from "../../../utils/RoleGuard";
import CreateModal from "./CreateModal";
import { useAuth } from "../../../contexts/AuthContext";
import { ROLES } from "../../../types/Role";

const fetcher = (url: string) =>
  pb
    .collection<WikiRecord>(url)
    .getFullList({ fields: "id,title,slug,isFolder" });

export const WikiSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [slug, setSetSlug] = useState<string>("");

  // Состояния для контекстного меню
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [currentNode, setCurrentNode] = useState<any>(null);

  const { user } = useAuth(); // получаем текущего пользователя, чтобы проверить роль
  const isMaster = user?.role === ROLES.master;

  const {
    data: paths,
    error,
    isLoading,
    mutate,
  } = useSWR(COLLECTIONS.wiki, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  const antdTreeData = useMemo(() => {
    if (!paths) return [];
    return buildAntdTree(paths);
  }, [paths]);

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    selectedKeys;
    if (!info.node.isLeaf) return;
    const targetUrl = info.node.key as string;
    navigate(`/tools/wiki/${targetUrl}`);
  };

  const selectedKey = decodeURIComponent(location.pathname);

  // ---- Контекстное меню ----
  const handleRightClick = ({
    event,
    node,
  }: {
    event: React.MouseEvent;
    node: any;
  }) => {
    event.preventDefault();
    if (!isMaster) return;

    setCurrentNode(node);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setMenuVisible(true);
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const { key } = e;
    switch (key) {
      case "create":
        if (currentNode?.isLeaf) {
          setSetSlug(currentNode.slug); // предположим, что в node есть parentId
        } else {
          setSetSlug(currentNode.slug); // для папки – создаём внутри
        }
        setIsModalOpen(true);
        break;
      case "edit":
        navigate(`/tools/wiki/edit/${currentNode.key}`);
        // здесь можно открыть модалку редактирования
        break;

      default:
        break;
    }
    setMenuVisible(false);
  };

  // Закрываем меню при клике вне его
  useEffect(() => {
    const closeMenu = () => setMenuVisible(false);
    if (menuVisible) {
      document.addEventListener("click", closeMenu);
      return () => document.removeEventListener("click", closeMenu);
    }
  }, [menuVisible]);

  // Сбрасываем modalParentId при закрытии модалки
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSetSlug("");
  };

  // --- Рендер ---
  if (isLoading) {
    return (
      <aside className="overflow-y-auto pt-8">
        <Typography.Title level={4} className="ml-4">
          <Spin />
          {"  TTR wiki"}
        </Typography.Title>
      </aside>
    );
  }

  if (!paths || paths.length === 0) {
    return <div>Вики пуста</div>;
  }

  if (error) {
    return (
      <div>
        <Alert
          description="Не удалось загрузить структуру wiki"
          title="Ошибка!"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <aside className="overflow-y-auto pt-8">
      <Space>
        <Typography.Title level={4} className="ml-4">
          TTR wiki
        </Typography.Title>
        <RoleGuard allowedRoles={[ROLES.master]}>
          <Button
            icon={<PlusCircleOutlined />}
            onClick={() => {
              setSetSlug(""); // создаём корневой элемент
              setIsModalOpen(true);
            }}
          />
        </RoleGuard>
      </Space>

      <Tree
        treeData={antdTreeData}
        selectedKeys={[selectedKey]}
        onSelect={handleSelect}
        showIcon
        onRightClick={handleRightClick}
        expandAction="click"
        icon={(props) =>
          props.isLeaf ? <FileTextOutlined /> : <FolderOutlined />
        }
      />

      {/* Контекстное меню */}
      {menuVisible && (
        <RoleGuard allowedRoles={[ROLES.master]}>
          <Menu
            style={{
              position: "fixed",
              left: menuPosition.x,
              top: menuPosition.y,
              zIndex: 1000,
              boxShadow:
                "0 3px 6px -4px rgba(0,0,0,.12), 0 6px 16px 0 rgba(0,0,0,.08)",
            }}
            onClick={handleMenuClick}
            items={[
              {
                key: "create",
                label: "Создать",
                icon: <PlusCircleOutlined />,
              },
              {
                key: "edit",
                label: "Редактировать",
              },
            ]}
          />
        </RoleGuard>
      )}

      <CreateModal
        isModalOpen={isModalOpen}
        closeModal={handleCloseModal}
        mutate={mutate}
        slug={`${slug}/`} // передаём в модалку
      />
    </aside>
  );
};
