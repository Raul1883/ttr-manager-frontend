import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./utils/PrivateRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import Sessions from "./pages/Sessions/Sessions";
import ManageSessions from "./pages/master/ManageSessions";
import SessionsEditorV2 from "./pages/master/SessionsEditor";
import SessionInfo from "./pages/Sessions/Session";
import { AuthProvider } from "./contexts/AuthContext";
import { Login } from "./pages/Login";
import Characters from "./pages/characters/Characters";

import Users from "./pages/master/Users";
import Reg from "./pages/Reg";
import CharacterSchemas from "./pages/master/SystemSchemaEditor/ListSchemas";
import ToolsMainPage from "./pages/tools/ToolsMainPage";
import City from "./pages/tools/dnd-guild/City/City";
import GuildMainPage from "./pages/tools/dnd-guild/GuildMainPage";
import "antd/dist/reset.css"; // Или 'antd/dist/antd.css' для старой версии
import { ConfigProvider, App as AppAntD } from "antd";
import MainPage from "./pages/MainPage";

import React, { Suspense } from "react";
import MasterPanel from "./pages/master/MasterPanel";
import CharacterMain from "./pages/characters/renderV2/CharacterMain";
import MdEditor from "./pages/tools/wiki/MdEditor";
import GuildWeapon from "./pages/tools/dnd-guild/WeaponGen/GuildWeapon";
import HistoryMain from "./pages/tools/dnd-guild/History/HistoryMain";

const CharacterSchemasEditor = React.lazy(
  () => import("./pages/master/SystemSchemaEditor/ListSchemasEditor"),
);

const WikiPage = React.lazy(() => import("./pages/tools/wiki/WikiPage"));

const darkBgColor = "#e4dcc8";
const lightBgColor = "#fcf5e4";

const TypewriterTheme = {
  token: {
    fontFamily: '"iA Writer Mono V", "Courier New", Courier, monospace',
    fontFamilyCode: '"iA Writer Mono V", "Courier New", Courier, monospace',

    colorPrimary: "#979795",
    colorWarning: "#c99635",
    colorError: "#b04a4a",
    colorInfo: "#4a708b",

    colorText: "#2e2e2e",
    colorTextDescription: "#595959",
    colorBgContainer: lightBgColor,
    colorBgLayout: "#f4f4f4",

    colorBorder: "#d9d9d9",
    colorBorderSecondary: "#e8e8e8",

    borderRadius: 2,
    borderRadiusXS: 1,
    borderRadiusSM: 1,
    borderRadiusLG: 4,

    controlOutline: "rgba(0, 0, 0, 0.04)",
    colorBgTextHover: "rgba(0, 0, 0, 0.04)",
    colorBgTextActive: "rgba(0, 0, 0, 0.08)",
  },
  components: {
    Button: {
      // Кнопки делаем более строгими
      borderRadius: 2,
      controlHeight: 34,
      fontFamily: '"iA Writer Mono V", monospace',
    },
    Input: {
      // Поля ввода как на печатной машинке
      borderRadius: 0, // Прямые углы
      colorBgContainer: "#ffffff",
    },
    Typography: {
      // Специфика для текста
      colorText: "#2e2e2e",
    },
    Layout: {
      bodyBg: darkBgColor,
      headerBg: lightBgColor,
      siderBg: lightBgColor,
    },
    Modal: {
      contentBg: lightBgColor,
    },
    Select: {
      colorBgContainer: "#fff",
    },
    Tree: {
      indentSize: 12,
      paddingXS: 2,
      fontSize: 16,
    },
  },
};

function App() {
  return (
    <AppAntD>
      <ConfigProvider theme={TypewriterTheme}>
        <BrowserRouter basename="/">
          <AuthProvider>
            <Suspense fallback={<div>Загрузка...</div>}>
              <Routes>
                {/* Публичные страницы */}
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reg" element={<Reg />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Sessions */}
                <Route path="/sessions">
                  <Route index element={<Sessions />} />
                  <Route path=":id" element={<SessionInfo />} />
                </Route>

                {/* Tools (открытые разделы) */}
                <Route path="/tools">
                  <Route index element={<ToolsMainPage />} />

                  <Route path="wiki">
                    <Route index element={<WikiPage />} />
                    <Route path=":id" element={<WikiPage />} />
                  </Route>

                  <Route path="guild">
                    <Route index element={<GuildMainPage />} />
                    <Route path="city" element={<City />} />
                    <Route path="weapon" element={<GuildWeapon />} />
                    <Route path="history" element={<HistoryMain />} />
                  </Route>
                </Route>

                {/* 1. Доступно любым авторизованным пользователям */}
                <Route element={<PrivateRoute />}>
                  <Route path="/characters">
                    <Route index element={<Characters />} />
                    <Route path=":id" element={<CharacterMain />} />
                  </Route>

                  {/* 2. Доступно только с ролью "master" */}
                  <Route element={<PrivateRoute allowedRoles={["master"]} />}>
                    {/* Единственный защищённый подраздел внутри tools */}
                    <Route path="/tools/wiki/edit/:id" element={<MdEditor />} />

                    {/* Вся панель управления */}
                    <Route path="/manage">
                      <Route index element={<MasterPanel />} />
                      <Route path="users" element={<Users />} />

                      <Route path="sessions">
                        <Route index element={<ManageSessions />} />
                        <Route
                          path="new"
                          element={<SessionsEditorV2 mode="create" />}
                        />
                        <Route
                          path=":id"
                          element={<SessionsEditorV2 mode="edit" />}
                        />
                      </Route>

                      <Route path="schemas">
                        <Route index element={<CharacterSchemas />} />
                        <Route
                          path=":id"
                          element={<CharacterSchemasEditor />}
                        />
                      </Route>
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </AppAntD>
  );
}

export default App;
