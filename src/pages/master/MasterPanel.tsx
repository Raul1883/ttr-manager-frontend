import MainLayout from "../../components/MainLayout";
import Menu from "../../components/Menu";

export const menuItems = [
  {
    title: "Сессии",
    path: "/manage/sessions",
    description: "Управление активными играми",
  },
  {
    title: "Заявки",
    path: "/manage/applications",
    description: "Просмотр активных заявок",
  },
  {
    title: "Игроки",
    path: "/manage/users",
    description: "Список пользователей и статистика",
  },
  // {
  //   title: "База знаний",
  //   path: "/manage/knowledge",
  //   description: "Пока не реализовано",
  // },
  // {
  //   title: "Компании",
  //   path: "/manage/companies",
  //   description: "Управление игровыми компаниями",
  // },
  {
    title: "Схемы",
    path: "/manage/schemas",
    description: "Управление шаблонами персонажей",
  },
];

const MainMenu = () => {
  return (
    <MainLayout>
      <Menu menuItems={menuItems} title="Мастеркая" />
    </MainLayout>
  );
};

export default MainMenu;
