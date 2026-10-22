import BuildingCard from "./BuildingCard";
import MainLayout from "../../../../components/MainLayout";
import { Card, Spin, Typography } from "antd";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import useSWR from "swr";
import { pb } from "../../../../API/PocketBase";
import { COLLECTIONS } from "../../../../API/collections";
import GetPbConst from "../../../../API/GetPbConst";
import type { CityRecord, Product } from "./types";

export default function CityPage() {
  const { data, isLoading, error, mutate } = useSWR<CityRecord[]>(
    [COLLECTIONS.guildCity],
    ([url]) => pb.collection(url).getFullList({ requestKey: null }),
  );

  // Обновляем кэш SWR сразу после сохранения, чтобы карточка здания
  // не показывала старый список до повторного запроса на сервер.
  const handleProductsSaved = (buildingId: string, products: Product[]) => {
    mutate(
      (current) =>
        current?.map((building) =>
          building.id === buildingId ? { ...building, products } : building,
        ),
      { revalidate: false },
    );
  };

  const { data: billsCount } = useSWR(
    [COLLECTIONS.toolsConst, "guild_bills_count"],
    GetPbConst,
  );

  if (isLoading || error || !billsCount) return <Spin />;

  return (
    <MainLayout>
      <Card>
        <Typography>
          <Title>Город</Title>
          <Paragraph>
            Гильдия — это целая система различных организаций, взаимодействующих
            между собой. Гильдия платит ратуше, чтобы получать больше заказов,
            спонсирует ближайший трактир, чтобы наёмники могли в нём обедать,
            строит свои кузницы и тренировочные залы, чтобы повышать
            квалификацию своих наёмников.
          </Paragraph>
          <Paragraph>
            Для улучшения здания, принадлежащего или спонсируемого гильдией
            необходимо потратить купчие. Купчие – это документы на право
            собственности земли – как внутри города, так и на территории
            княжества. На выкупленной земле открываются новые филиалы, склады и
            производства, которые и позволяют качественно повысить уровень
            обслуживания.
          </Paragraph>
          <Paragraph>
            На этой странице вы можете ознакомиться с текущим состоянием города
            и узнать о текущий возможностях зданий.
          </Paragraph>
          <Paragraph>Доступно купчих: {billsCount.number_value}</Paragraph>
        </Typography>
      </Card>

      <div className="w-[90%] mx-auto my-4 flex items-end justify-between  gap-4 flex-wrap">
        {!data ? (
          <div>Ошибка загрузки</div>
        ) : (
          data.map((x) => (
            <BuildingCard
              key={x.id}
              data={{ img: pb.files.getURL(x, x.image), ...x }}
              onProductsSaved={(products) =>
                handleProductsSaved(x.id, products)
              }
            />
          ))
        )}
      </div>
    </MainLayout>
  );
}
