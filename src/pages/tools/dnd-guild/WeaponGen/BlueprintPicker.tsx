import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useWeaponCatalog } from "./useWeaponCatalog";
import type { CatalogSelection } from "./types";

interface BlueprintPickerProps {
  onSelect: (selection: CatalogSelection) => void;
  onClose: () => void;
}

export default function BlueprintPicker({
  onSelect,
  onClose,
}: BlueprintPickerProps) {
  const { groups, isLoading, error, retry } = useWeaponCatalog();
  const [groupId, setGroupId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  // Добавляем состояние для анимации закрытия
  const [isClosing, setIsClosing] = useState(false);

  const activeGroup = groups.find((group) => group.id === groupId) ?? groups[0];
  const activeCategory =
    activeGroup?.categories.find((category) => category.id === categoryId) ??
    activeGroup?.categories[0];
  const activeGroupName = activeGroup?.name ?? "";
  const activeCategoryName = activeCategory?.name ?? "";

  // Обертка над onClose для отложенного закрытия
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Ждем 300мс (совпадает с длительностью CSS transition/animation)
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleClose]);

  return createPortal(
    <div 
      className={`forge-picker-backdrop ${isClosing ? "closing" : ""}`} 
      onClick={handleClose}
    >
      <div
        className={`forge-picker-panel ${isClosing ? "closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forge-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="forge-picker-header">
          <h2 id="forge-picker-title" className="forge-picker-title">
            Выбор чертежа
          </h2>
          <button
            type="button"
            className="forge-picker-close"
            onClick={handleClose}
            aria-label="Закрыть"
            autoFocus
          >
            ×
          </button>
        </header>

        {isLoading && <p className="forge-picker-state">Загружаем чертежи…</p>}

        {!isLoading && error && (
          <div className="forge-picker-state">
            <p>Не удалось загрузить список чертежей.</p>
            <button
              type="button"
              className="forge-copy-btn"
              onClick={() => void retry()}
            >
              Повторить
            </button>
          </div>
        )}

        {!isLoading && !error && groups.length === 0 && (
          <p className="forge-picker-state">Список чертежей пуст.</p>
        )}

        {!isLoading && !error && activeGroup && (
          <>
            <div
              className="forge-picker-tabs"
              role="tablist"
              aria-label="Тип снаряжения"
            >
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={group.id === activeGroup.id}
                  className={`forge-picker-tab ${
                    group.id === activeGroup.id ? "active" : ""
                  }`}
                  onClick={() => {
                    if (group.id === activeGroup.id) return;
                    setGroupId(group.id);
                    setCategoryId("");
                  }}
                >
                  {group.name}
                </button>
              ))}
            </div>

            <div className="forge-picker-body">
              <nav className="forge-picker-categories" aria-label="Категории">
                {activeGroup.categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`forge-picker-category ${
                      category.id === activeCategory?.id ? "active" : ""
                    }`}
                    onClick={() => setCategoryId(category.id)}
                  >
                    <span>{category.name}</span>
                    <span className="forge-picker-count">
                      {category.items.length}
                    </span>
                  </button>
                ))}
              </nav>

              {/* key сбрасывает прокрутку и триггерит анимацию при смене вкладки */}
              <div className="forge-picker-items fade-in-tab" key={activeCategory?.id}>
                {activeCategory?.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="forge-picker-item"
                    onClick={() =>
                      onSelect({
                        item,
                        groupName: activeGroupName,
                        categoryName: activeCategoryName,
                      })
                    }
                  >
                    <span className="forge-picker-item-head">
                      <span className="forge-picker-item-name">
                        {item.name}
                      </span>
                      <span className="forge-picker-item-stats">
                        {item.damage && (
                          <span className="forge-picker-item-stat">
                            {item.damage}
                          </span>
                        )}
                        {item.ac && (
                          <span className="forge-picker-item-stat">
                            КД {item.ac}
                          </span>
                        )}
                        {item.distance && (
                          <span className="forge-picker-item-stat">
                            Дист. {item.distance}
                          </span>
                        )}
                      </span>
                    </span>

                    {item.properties.length > 0 && (
                      <span className="forge-picker-item-props">
                        {item.properties.map((property, index) => (
                          <span
                            key={`${item.id}-${index}`}
                            className="forge-picker-prop"
                          >
                            {property}
                          </span>
                        ))}
                      </span>
                    )}

                    {item.description && (
                      <span className="forge-picker-item-desc">
                        {item.description}
                      </span>
                    )}
                  </button>
                ))}

                {activeCategory && activeCategory.items.length === 0 && (
                  <p className="forge-picker-state">
                    В этой категории пока нет предметов.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}