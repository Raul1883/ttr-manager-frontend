import { Divider, Typography } from "antd";
import SessionsList from "./SessionsList";
import MainLayout from "../../components/MainLayout";

export default () => {
  return (
    <MainLayout>
      <Divider>
        <Typography.Title>Сессии</Typography.Title>
      </Divider>

      <div className="w-full">
        <SessionsList master={false} />
      </div>
    </MainLayout>
  );
};
