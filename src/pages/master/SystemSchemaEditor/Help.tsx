import { Typography } from "antd";
import { useState } from "react";

export default () => {
  return (
    <div>
      <div className="space-y-6">
        <div>
          <Typography.Title level={3}>Шпаргалка по JSON-схеме</Typography.Title>

          <Typography.Text>
            Схема состоит из секций (`sections`), а секции — из полей
            (`fields`).
          </Typography.Text>
        </div>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Секция</h3>

          <div className="bg-gray-100 rounded-md p-3 font-mono text-xs overflow-x-auto">
            {`{
  "title": "Основное",
  "layout": "compact",
  "columns": 2,
  "fields": []
}`}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">title</span> — название секции
            </div>

            <div>
              <span className="font-medium">fields</span> — список полей
            </div>

            <div>
              <span className="font-medium">layout</span> — тип отображения
            </div>

            <div>
              <span className="font-medium">columns</span> — колонки
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge text="compact = сетка" />
            <Badge text="list = список" />
            <Badge text="unbound = свободно" />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Базовое поле</h3>

          <div className="bg-gray-100 rounded-md p-3 font-mono text-xs overflow-x-auto">
            {`{
  "key": "name",
  "label": "Имя",
  "type": "text"
}`}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">key</span> — уникальный ID
            </div>

            <div>
              <span className="font-medium">label</span> — подпись
            </div>

            <div>
              <span className="font-medium">type</span> — тип поля
            </div>

            <div>
              <span className="font-medium">defaultValue</span> — значение по
              умолчанию
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Типы полей</h3>
          <p>? помечены необязательные параметры</p>

          <div className="grid grid-cols-2 gap-3">
            <FieldCard
              title="text"
              description="Короткий текст"
              example='{
            "type": "text",
            "key": "name",
            "label": "Имя",
          },'
            />

            <FieldCard
              title="textarea"
              description="Большой текст"
              example='{
            "type": "textarea",
            "label": "",
            "key": "notes"
          }
          ,'
            />

            <FieldCard
              title="number"
              description="Число"
              example='{"type": "number",
                "key": "protection",
                "label": "ПБ"}'
            />

            <FieldCard
              title="minmax"
              description="Текущее / максимум"
              example='{"type": "minmax",
                "key": "health",
                "label": "Здоровье"}'
            />

            <FieldCard title="checkbox" description="Да / нет" />

            <FieldCard
              title="select"
              description="Список вариантов"
              example={`"options": ["человек", "эльф", "гном"]`}
            />

            <FieldCard
              title="header"
              description="Строка в общем потоке"
              example='{"type": "header",
            "ui": "row",
            "key": "int_skills",
            "label": "НАВЫКИ ИНТЕЛЛЕКТА"}'
            />

            <FieldCard
              title="array"
              description="Список полей. Инвентарь"
              example='
                      {
            "type": "array",
            "key": "inventory",
            "label": "",
            "itemSchema": [
              {
                "array_col": 8,
                "type": "text",
                "key": "name",
                "label": "Название"
              }              
            ]
          }'
            />
          </div>
        </section>
      </div>
    </div>
  );
};

type BadgeProps = {
  text: string;
};

function Badge({ text }: BadgeProps) {
  return (
    <div className="px-2 py-1 rounded bg-gray-200 text-xs text-gray-700">
      {text}
    </div>
  );
}

type FieldCardProps = {
  title: string;
  description: string;
  example?: string;
};

function FieldCard({ title, description, example }: FieldCardProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(example || "");

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Ошибка копирования:");
    }
  };

  return (
    <div className="border rounded-md p-3 bg-white">
      <div className="font-mono text-xs text-indigo-600 mb-1">{title}</div>

      <div className="text-sm text-gray-600">{description}</div>
      {example && (
        <button onClick={handleCopy} className="text-xs text-gray-500 mt-2">
          {copied ? "Скопировано!" : example}
        </button>
      )}
    </div>
  );
}
