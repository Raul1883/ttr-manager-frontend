import { advantages, disadvantages } from "./const";
import type { WeaponProperty } from "./types";

interface PropertyGroupProps {
  title: string;
  hint: string;
  properties: WeaponProperty[];
  tone: "advantage" | "disadvantage";
}

/** Группа свойств: заголовок, пояснение и раскрывающиеся описания. */
function PropertyGroup({
  title,
  hint,
  properties,
  tone,
}: PropertyGroupProps) {
  return (
    <section className={`forge-props-group forge-props-group--${tone}`}>
      <header className="forge-props-head">
        <h3 className="forge-props-title">{title}</h3>
        <span className="forge-props-count">{properties.length}</span>
      </header>
      <p className="forge-props-hint">{hint}</p>

      <div className="forge-props-list">
        {properties.map((property) => (
          <details key={property.title} className="forge-prop-entry">
            <summary className="forge-prop-summary">
              <span className="forge-prop-name">{property.title}</span>
              <span className="forge-prop-chevron" aria-hidden="true">
                ▾
              </span>
            </summary>
            <p className="forge-prop-desc">{property.description}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * Справочник свойств ковки: преимущества и недостатки из `const.ts`.
 * Элементы только для чтения — выбрать свойство вместо чертежа нельзя.
 */
export default function PropertiesView() {
  return (
    <div className="forge-props-view">
      <p className="forge-props-note">
        Свойства выдаются при ковке случайно. Здесь можно только прочитать их
        описание — выбрать свойство нельзя.
      </p>

      <div className="forge-props-columns">
        <PropertyGroup
          title="Преимущества"
          hint="Выпадают предметам хорошего и более высокого качества."
          properties={advantages}
          tone="advantage"
        />
        <PropertyGroup
          title="Недостатки"
          hint="Выпадают предметам низкого и ниже среднего качества."
          properties={disadvantages}
          tone="disadvantage"
        />
      </div>
    </div>
  );
}
