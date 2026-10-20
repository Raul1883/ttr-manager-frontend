import useSWR from "swr";
import { useParams } from "react-router-dom";
import { pb } from "../../../API/PocketBase";
import { COLLECTIONS } from "../../../API/collections";
import type { WikiRecord } from "./types";
import NavButton from "../../../components/NavButton";
import EditOutlined from "@ant-design/icons/es/icons/EditOutlined";
import { Empty, Skeleton, Space, Tag } from "antd";
import { RoleGuard } from "../../../utils/RoleGuard";
import { ROLES } from "../../../types/Role";
import MdLayout from "../../../components/MdLayout";

const fetcher = async (id: string) => {
  try {
    const res = await pb.collection<WikiRecord>(COLLECTIONS.wiki).getOne(id);
    return res;
  } catch {
    const secondRes = await pb
      .collection<WikiRecord>(COLLECTIONS.wiki)
      .getFullList({ filter: `title = "${id}"` });

    return secondRes[0];
  }
};

export default () => {
  const { id } = useParams();

  const { data, error, isLoading } = useSWR<WikiRecord>(
    id ? id : null,
    fetcher,
  );

  if (isLoading || error)
    return (
      <div className="markdown-body mx-8 mt-4 max-w-[80%] w-250">
        <Skeleton active />
      </div>
    );

  if (!id || !data?.content)
    return <Empty description="Пусто!" className="pt-10" />;

  return (
    <div className="mx-8 mt-4 max-w-[80%] w-250">
      <div className="flex justify-between  flex-row">
        <div></div>
        <Space align="center">
          <Tag>{data?.slug}</Tag>
          <RoleGuard allowedRoles={[ROLES.master]}>
            <NavButton to={`/tools/wiki/edit/${id}`} icon={<EditOutlined />} />
          </RoleGuard>
        </Space>
      </div>

      <MdLayout content={data?.content || "Документ пуст"} />
    </div>
  );
};
