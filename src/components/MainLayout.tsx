import React, { useMemo, useState } from "react";
import { Button, Layout, Menu, Drawer, Grid } from "antd";
import type { MenuProps } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { AuthButton } from "./AuthButton";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../types/Role";
import type { Role } from "../types/Role";

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

interface LayoutProps {
  children?: React.ReactNode;
  header?: boolean;
  footer?: boolean;
  fluid?: boolean;
}

type HeaderItems = NonNullable<MenuProps["items"]>;

// Пункты меню строим обычной функцией, а не хуком внутри неё: useAuth
// вызывается в самом компоненте и передаётся сюда аргументами (иначе
// нарушаются rules-of-hooks).
const getHeaderItems = (
  isAuthorized: boolean,
  userRole: Role | null,
): HeaderItems => {
  if (!isAuthorized) {
    return [
      { key: "sessions", label: <Link to="/sessions">Игры</Link> },
      { key: "characters", label: <Link to="/login">Персонажи</Link> },
      { key: "tools", label: <Link to="/tools">Инструменты</Link> },
      { key: "exit", label: <AuthButton /> },
    ];
  }

  if (userRole === ROLES.master) {
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
  // Храним путь, на котором открыли меню: при переходе на другой адрес
  // drawerOpen сам становится false, без setState внутри эффекта.
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const location = useLocation();
  const screens = useBreakpoint();
  const { user, role } = useAuth();

  // Если экран меньше "md" (768px), считаем его мобильным. Сравниваем именно
  // с false: на первом рендере breakpoint ещё undefined, и мобильная вёрстка
  // не должна мигать на десктопе.
  const isMobile = screens.md === false;

  const items = useMemo(
    () => getHeaderItems(Boolean(user), role),
    [user, role],
  );

  const drawerOpen = drawerPath === location.pathname;
  const closeDrawer = () => setDrawerPath(null);

  const currentKey = location.pathname.split("/")[1] || "sessions";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {header && (
        <Header
          style={{
            // На мобильных шапка прилипает к верху во всю ширину, чтобы меню
            // всегда было под рукой при скролле длинных статей. На десктопе
            // оставляем обычное поведение — там меню и так перед глазами.
            position: isMobile ? "sticky" : "static",
            top: 0,
            zIndex: 100,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: isMobile ? 0 : "16px 24px 0 24px",
            padding: isMobile ? "0 8px 0 12px" : "0 24px",
            borderRadius: isMobile ? 0 : "4px",
            boxShadow: isMobile
              ? "0 1px 6px rgba(0, 0, 0, 0.08)"
              : "0 4px 12px rgba(0, 0, 0, 0.03)",
            height: "56px",
            lineHeight: "56px",
            backgroundColor: "#fff",
          }}
        >
          <Link
            to="/"
            style={{ color: "black" }}
            className="text-xl sm:text-2xl md:text-3xl font-bold whitespace-nowrap"
          >
            TTR manager
          </Link>

          {isMobile ? (
            <>
              {/* Кнопка-гамбургер для мобильных */}
              <Button
                type="text"
                aria-label="Открыть меню"
                icon={<MenuOutlined style={{ fontSize: "20px" }} />}
                onClick={() => setDrawerPath(location.pathname)}
                style={{ width: 40, height: 40 }}
              />
              <Drawer
                title="Меню"
                placement="right"
                onClose={closeDrawer}
                open={drawerOpen}
                size={280}
                styles={{ body: { padding: "8px 0" } }}
              >
                <Menu
                  mode="inline"
                  selectedKeys={[currentKey]}
                  items={items}
                  onClick={closeDrawer} // Закрываем при клике на пункт
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
                // На мобильных отступы задаёт сама страница (wiki), чтобы
                // фон статьи доходил до краёв экрана.
                padding: isMobile ? 0 : "24px",
              }
            : {
                padding: isMobile ? "12px" : "24px",
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
