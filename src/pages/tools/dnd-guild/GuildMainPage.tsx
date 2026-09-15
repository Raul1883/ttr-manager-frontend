import MainLayout from "../../../components/MainLayout";
import Menu, { type menuItem } from "../../../components/Menu";

const items: menuItem[] = [
  {
    title: "Город",
    path: "city",
    description: "Хоумрулы и инструменты для гильдийских ваншотов",
  },
  {
    title: "Оружие и доспехи",
    path: "weapon",
    description: "Генератор оружия и доспехов",
  },
  {
    title: "Архив",
    path: "history",
    description: "История заданий",
  },
    {
    title: "Некрополь",
    path: "necropolis",
    description: "Истории павших",
  },
];

export default () => {
  return (
    <MainLayout>
      <Menu menuItems={items} title="Гильдийские ваншоты" />
    </MainLayout>
  );
};
