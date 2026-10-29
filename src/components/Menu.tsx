import { Card, Divider, Typography } from "antd";
import { Link } from "react-router-dom";

export interface menuItem {
  title: string;
  path: string;
  description: string;
}

export interface menuProps {
  title?: string;
  menuItems: menuItem[];
}



export default function Menu(props: menuProps) {
  return (
    <div>
      <div className="p-0 sm:p-8">

        {props.title && (
          <Divider>
            <Typography.Title className="text-center sm:text-left">
              {props.title}
            </Typography.Title>
          </Divider>
        )}


        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {props.menuItems.map((item) => (
            <Card
              key={item.path}
              title={item.title}
              extra={<Link to={item.path}>Перейти</Link>}
              className="w-full"
            >
              {item.description}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
