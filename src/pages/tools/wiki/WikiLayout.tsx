// Компонент WikiLayout.tsx
import React, { useState } from "react";
import { Layout, Splitter, Grid, Drawer, Button } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { WikiSidebar } from "./WikiSidebar";
import MainLayout from "../../../components/MainLayout";
import "../../../css/markdown.css";

const { Content } = Layout;
const { useBreakpoint } = Grid;

export const WikiLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Как и в MainLayout: открытость панели привязана к пути, на котором её
  // открыли, поэтому при переходе по статье она закрывается сама — без
  // setState внутри эффекта.
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const screens = useBreakpoint();
  const location = useLocation();

  // Если экран меньше "md" (768px), считаем его мобильным
  const isMobile = screens.md === false;

  const drawerOpen = drawerPath === location.pathname;

  return (
    <MainLayout fluid footer={false}>
      {isMobile ? (
        /* ================= МОБИЛЬНАЯ ВЕРСИЯ ================= */
        <div
          style={{
            background: "#fcf5e4",
            borderRadius: "4px",
            minHeight: "calc(100vh - 56px)",
            position: "relative", // Для правильного позиционирования внутри
          }}
        >
          {/* Панель над статьёй: прилипает под шапкой, чтобы оглавление было
              доступно в любой момент чтения (на тач-устройствах нет hover). */}
          <div
            className="sticky z-[99] flex items-center gap-2 border-b px-3 py-2"
            style={{ top: 56, background: "#fcf5e4", borderColor: "#e8e8e8" }}
          >
            <Button
              size="small"
              icon={<BookOutlined />}
              onClick={() => setDrawerPath(location.pathname)}
            >
              Оглавление
            </Button>
          </div>

          <Content style={{ padding: "12px" }}>{children}</Content>

          {/* Выезжающая панель с оглавлением */}
          <Drawer
            title="Оглавление"
            placement="left" // Выезжает слева
            onClose={() => setDrawerPath(null)}
            open={drawerOpen}
            width="min(320px, 88vw)"
            styles={{
              body: { padding: 0, overflowY: "auto" },
              // На узких экранах панель занимает почти всю ширину
              wrapper: { maxWidth: "100vw" },
            }}
          >
            <WikiSidebar />
          </Drawer>
        </div>
      ) : (
        /* ================= ДЕСКТОПНАЯ ВЕРСИЯ ================= */
        <Splitter
          style={{
            background: "#fcf5e4",
            borderRadius: "4px",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          {/* Фиксированная ширина: процентный defaultSize на узких десктопах
              (768–1000px) давал слишком тонкую колонку с деревом */}
          <Splitter.Panel defaultSize={240} min={200}>
            <WikiSidebar />
          </Splitter.Panel>
          <Splitter.Panel>
            <Content style={{ padding: "24px" }}>{children}</Content>
          </Splitter.Panel>
        </Splitter>
      )}
    </MainLayout>
  );
};
