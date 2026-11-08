import { useMemo } from "react";
import useSWR from "swr";
import { COLLECTIONS } from "../../../../API/collections";
import GetPbConst from "../../../../API/GetPbConst";
import { parseWeaponCatalog, WEAPON_ITEMS_CONST } from "./catalog";

/**
 * Справочник предметов для «Чертежа». Запрос уходит только при монтировании
 * пикера (он рендерится по клику), поэтому 90 КБ JSON не грузятся со страницей.
 */
export function useWeaponCatalog() {
  const { data, error, isLoading, mutate } = useSWR(
    [COLLECTIONS.toolsConst, WEAPON_ITEMS_CONST],
    GetPbConst,
  );

  const groups = useMemo(
    () => parseWeaponCatalog(data?.json_value),
    [data],
  );

  return { groups, error, isLoading, retry: mutate };
}
