import { useEffect, useRef, useState } from "react";
import type { WeaponResult } from "./types";
import { Typography } from "antd";

interface WeaponResultCardProps {
  weapon: WeaponResult;
  index: number;
  onCopy: (weapon: WeaponResult, index: number) => Promise<boolean>;
}

/** Карточка одного выкованного предмета с копированием статов. */
export default function WeaponResultCard({
  weapon,
  index,
  onCopy,
}: WeaponResultCardProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blueprint = weapon.blueprint;

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleCopy = async () => {
    if (!(await onCopy(weapon, index))) return;

    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="forge-result-card">
      <div className="forge-result-line" />

      <div className="flex justify-between items-start gap-4">
        <div>
          <Typography.Title level={3} className="drop-item delay-1">
            {weapon.name || `Нечто #${index + 1}`}
          </Typography.Title>

          <div className="flex gap-4 items-center drop-item delay-1">
            <span className="forge-tag">{weapon.quality}</span>

            {!blueprint && (
              <div className="forge-blueprint-props">
                <span className="forge-prop-tag">
                  Прочность: {weapon.durability}
                </span>
              </div>
            )}

            {blueprint && (
              <section
                className="drop-item delay-2"
                aria-label="Сведения об основе"
              >
                <div className="forge-blueprint-props">
                  <span className="forge-prop-tag">
                    Прочность: {weapon.durability}
                  </span>
                  {blueprint.item.damage && (
                    <span className="forge-prop-tag">
                      Урон: {blueprint.item.damage}
                    </span>
                  )}
                  {blueprint.item.ac && (
                    <span className="forge-prop-tag">
                      КД: {blueprint.item.ac}
                    </span>
                  )}
                  {blueprint.item.distance && (
                    <span className="forge-prop-tag">
                      Дистанция: {blueprint.item.distance}
                    </span>
                  )}
                  {blueprint.item.properties.map((property, propertyIndex) => (
                    <span
                      key={`${blueprint.item.id}-${propertyIndex}`}
                      className="forge-prop-tag"
                    >
                      {property}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="forge-copy-btn drop-item delay-2"
          aria-live="polite"
        >
          {copied ? "Скопировано ✓" : "Скопировать"}
        </button>
      </div>

      {blueprint && (
        <section
          className="mt-8 drop-item delay-3"
          aria-label="Сведения об основе"
        >
          {blueprint.item.description && (
            <p className="forge-blueprint-desc">{blueprint.item.description}</p>
          )}
        </section>
      )}

      <div className="mt-6">
        {weapon.properties.length === 0 ? (
          <p className="forge-desc italic">
            Обычный предмет. Нет преимуществ, но и недостатков тоже нет.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <Typography.Title level={4} className="drop-item delay-3">
              Свойства ковки
            </Typography.Title>
            {weapon.properties.map((property) => (
              <div key={property.title}>
                <Typography.Title level={5} className="drop-item delay-3">
                  {property.title}
                </Typography.Title>
                <Typography.Paragraph className="drop-item delay-3">
                  {property.description}
                </Typography.Paragraph>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
