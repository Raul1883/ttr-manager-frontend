import React, { useState } from "react";
import { Button, Layout, Menu, Drawer, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { AuthButton } from "./AuthButton";
import { useAuth } from "../contexts/AuthContext";

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

interface LayoutProps {
  children?: React.ReactNode;
  header?: boolean;
  footer?: boolean;
  fluid?: boolean;
}

const getHeaderItems = () => {
  const { user, role: userRole } = useAuth();

  if (!user) {
    return [
      { key: "sessions", label: <Link to="/sessions">Игры</Link> },
      { key: "characters", label: <Link to="/login">Персонажи</Link> },
      { key: "tools", label: <Link to="/tools">Инструменты</Link> },
      { key: "exit", label: <AuthButton /> },
    ];
  }

  if (userRole === "master") {
    return [
      { key: "sessions", label: <Link to="/sessions">Игры</Link> },
      { key: "characters", label: <Link to="/characters">Персонажи</Link> },
      { key: "tools", label: <Link to="/tools">Инструменты</Link> },
      {
        key: "manage",
        label: <Link to="/manage">Мастерская</Link>,
        children: [
          {
            label: <Link to="/manage/sessions">Сессии</Link>,
            key: "manage/sessions",
          },
          {
            label: <Link to="/manage/applications">Заявки</Link>,
            key: "manage/applications",
          },
          {
            label: <Link to="/manage/users">Игроки</Link>,
            key: "manage/users",
          },
          {
            label: <Link to="/manage/schemas">Схемы</Link>,
            key: "manage/schemas",
          },
        ],
      },
      { key: "exit", label: <AuthButton /> },
    ];
  }

  return [
    { key: "sessions", label: <Link to="/sessions">Игры</Link> },
    { key: "characters", label: <Link to="/characters">Персонажи</Link> },
    { key: "tools", label: <Link to="/tools">Инструменты</Link> },
    { key: "exit", label: <AuthButton /> },
  ];
};

const AppLayout = ({
  children,
  header = true,
  footer = true,
  fluid = false,
}: LayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const screens = useBreakpoint();
  
  // Если экран меньше "md" (768px), считаем его мобильным
  const isMobile = screens.md === false; 

  const items = getHeaderItems();
  const currentKey = location.pathname.split("/")[1] || "sessions";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {header && (
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            // Уменьшаем отступы на мобильных
            margin: isMobile ? "8px 12px 0 12px" : "16px 24px 0 24px",
            padding: isMobile ? "0 16px" : "0 24px",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
            height: "56px",
            lineHeight: "56px",
            backgroundColor: "#fff", // Убедитесь, что фон задан, если не используется тема по умолчанию
          }}
        >
          <Button type="text" style={{ height: "auto", padding: 0 }}>
            <Link className="text-2xl md:text-3xl font-bold" to="/">
              TTR manager
            </Link>
          </Button>

          {isMobile ? (
            <>
              {/* Кнопка-гамбургер для мобильных */}
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                onClick={() => setDrawerOpen(true)}
              />
              <Drawer
                title="Меню"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                width={280}
              >
                <Menu
                  mode="inline"
                  selectedKeys={[currentKey]}
                  items={items}
                  onClick={() => setDrawerOpen(false)} // Закрываем при клике на пункт
                  style={{ borderRight: "none" }}
                />
              </Drawer>
            </>
          ) : (
            /* Горизонтальное меню для ПК */
            <Menu
              mode="horizontal"
              selectedKeys={[currentKey]}
              items={items}
              style={{
                background: "transparent",
                border: "none",
                flexGrow: 1,
                justifyContent: "flex-end",
                marginLeft: "24px",
              }}
            />
          )}
        </Header>
      )}

      <Content
        style={
          fluid
            ? {
                width: "100%",
                padding: isMobile ? "16px" : "24px",
              }
            : {
                padding: isMobile ? "16px" : "24px",
                maxWidth: "1200px",
                width: "100%",
                margin: "0 auto",
              }
        }
      >
        <div style={{ minHeight: "100%", height: fluid ? "100%" : "auto" }}>
          {children}
        </div>
      </Content>

      {footer && (
        <Footer
          style={{
            textAlign: "center",
            background: "transparent",
            padding: isMobile ? "12px" : "24px",
          }}
        >
          TTR manager ©2026
        </Footer>
      )}
    </Layout>
  );
};

export default AppLayout;