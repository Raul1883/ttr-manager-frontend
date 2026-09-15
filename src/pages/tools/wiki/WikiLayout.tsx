// Компонент WikiLayout.tsx
import React, { useState } from "react";
import { Layout, Splitter, Grid, Drawer, FloatButton } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { WikiSidebar } from "./WikiSidebar";
import MainLayout from "../../../components/MainLayout";
import "../../../css/markdown.css";

const { Content } = Layout;
const { useBreakpoint } = Grid;

export const WikiLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  
  // Если экран меньше "md" (768px), считаем его мобильным
  const isMobile = screens.md === false;

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
          <Content style={{ padding: "16px" }}>{children}</Content>

          {/* Плавающая кнопка для вызова оглавления */}
          <FloatButton
            icon={<BookOutlined />}
            type="primary"
            style={{ right: 24, bottom: 24 }}
            onClick={() => setDrawerOpen(true)}
          />

          {/* Выезжающая панель с оглавлением */}
          <Drawer
            title="Оглавление"
            placement="left" // Выезжает слева
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={300}
            styles={{ body: { padding: 0 } }} // Обнуляем паддинги, чтобы Sidebar встал ровно
          >
            {/* Оборачиваем Sidebar в div с кликом, чтобы он закрывался при выборе статьи (опционально) */}
            <div >
              <WikiSidebar />
            </div>
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
          <Splitter.Panel defaultSize="20%" min="200px">
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