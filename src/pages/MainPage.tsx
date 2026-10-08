import { Typography, Card, Flex } from "antd";
import SessionsList from "./Sessions/SessionsList";
import MainLayout from "../components/MainLayout";

const { Paragraph } = Typography;

export default () => {
  return (
    <MainLayout>
      <Flex vertical align="center">
        <h1 className="text-5xl   text-7xl font-extrabold  bg-clip-text  pt-20 mb-6">
          Привет!
        </h1>

        <Card className="w-full max-w-3xl shadow-lg rounded-2xl border-0 transition-all hover:shadow-xl">
          <Typography>
            <Paragraph>
              Это небольшой сайт, который я разрабатываю самостоятельно для себя
              и своих друзей. В данный момент сайт находится в стадии
              разработки, поэтому не удивляйтесь, если что-то не работает или
              выглядит странно. Я буду рад, если вы оставите свои отзывы и
              предложения по улучшению сайта.
            </Paragraph>
            <Paragraph>
              Уже сейчас вы можете посмотреть активные игры и оставить на них
              заявку. Также доступен функционал создания персонажей на кастомных
              листах персонажа, которые могут показаться вам удобнее уже
              существующих.
            </Paragraph>
            <Paragraph>
              Также в разделе "Инструменты" вы можете найти различные
              инструменты для мастеров и игроков, которые помогут вам в
              проведении игр. В данный момент реализована актуальная вики для
              домашних правил, а также несколько полезных инструментов для
              гильдийских ваншотов.
            </Paragraph>
          </Typography>
        </Card>

        <div className="w-full mt-10">
          <SessionsList master={false} />
        </div>
      </Flex>
    </MainLayout>
  );
};
