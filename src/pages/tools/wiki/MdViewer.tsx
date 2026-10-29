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

export default function MdViewer() {
  const { id } = useParams();

  const { data, error, isLoading } = useSWR<WikiRecord>(
    id ? id : null,
    fetcher,
  );

  if (isLoading || error)
    return (
      <div className="markdown-body mt-4 mx-auto w-full max-w-3xl">
        <Skeleton active />
      </div>
    );

  if (!id || !data?.content)
    return <Empty description="Пусто!" className="pt-10" />;

  return (
    <div className="mt-4 mx-auto w-full max-w-3xl">
      <div className="flex justify-between items-center flex-wrap gap-2">
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
}
