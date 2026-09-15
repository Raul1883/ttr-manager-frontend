import { Empty, Spin } from "antd";

interface SwrHandlerProps {
  emptyText?: string;
  errorText?: string;
  data: any[] | undefined;
  isLoading: boolean;
  error: any;
  children: React.ReactNode;
}

export function SwrHandler({
  emptyText,
  errorText,
  data,
  isLoading,
  error,
  children,
}: SwrHandlerProps) {
  if (isLoading) return <Spin />;

  if (error) return <Empty description={errorText || "Что-то пошло не так"} />;

  if (!data) return <Empty description={emptyText || "Пока нет заявок"} />;
  return children;
}
