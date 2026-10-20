import { Button, ConfigProvider, message, Space, Typography } from "antd";

import { Layout } from "antd";
import Dice from "./Dice";
import { useNavigate } from "react-router-dom";
import { RoleGuard } from "../../../utils/RoleGuard";
import { ROLES } from "../../../types/Role";

const { Header, Content } = Layout;

interface CharLayoutProps {
  children?: React.ReactNode;
  systemName: string;
  save: () => void;
  resetLayout: () => void;
  saveJson: () => void;
  copyLayout: () => void;
}

export default ({
  children,
  systemName,
  save,
  resetLayout,
  saveJson,
  copyLayout,
}: CharLayoutProps) => {
  const navigate = useNavigate();

  const theme = {
    token: {
      borderRadius: 2,
      wireframe: false,
      colorPrimary: "#6e6e6e",
      colorInfo: "#6e6e6e",
    },
    components: {
      Input: {
        paddingInline: 1,
        paddingBlock: 2,
      },
      Form: {
        itemMarginBottom: 4,
      },
      Table: {
        cellPaddingBlock: 0,
        cellPaddingInline: 0,

        cellPaddingBlockSM: 0,
        cellPaddingInlineSM: 0,
      },
      Select: {
        controlHeight: 28,
      },
      Layout: {
        headerHeight: 56,
      },
    },
  };

  const hadleExit = () => {
    save();

    message.warning(
      "Если вернешься в того же персонажа — перезагрузи страницу.",
    );
    message.warning("!");
    navigate(-1);
  };

  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "10px",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
          }}
        >
          <Space>
            <Button onClick={save}>Сохранить</Button>
            <Button onClick={resetLayout}>Разметка по умолчанию</Button>
            <Button onClick={saveJson}>Скачать json</Button>
            <Dice />
            <Button onClick={hadleExit}>Домой</Button>
            <RoleGuard allowedRoles={[ROLES.master]}>
              <Button onClick={copyLayout}>Copy Layout</Button>
            </RoleGuard>
          </Space>
          <Typography.Title style={{ margin: 0 }}>
            {systemName}
          </Typography.Title>
        </Header>

        <Content>
          <div>{children}</div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};
