interface LssStat {
  score?: number;
}

interface LssSave {
  isProf?: boolean | number;
}

interface LssSkill {
  isProf?: boolean | number;
  baseStat?: string;
}

interface LssVitality {
  "hp-current"?: { value?: number };
  "hp-max"?: { value?: number };
  "hp-temp"?: { value?: number };
  "hit-die"?: { value?: string };
  "hp-dice-current"?: { value?: number };
  ac?: { value?: string | number | null };
  speed?: { value?: string | number | null };
  initiative?: { value?: string | number | null };
}

interface LssWeapon {
  name?: { value?: string };
  dmg?: { value?: string };
  ability?: string;
  isProf?: boolean | number;
  dmgType?: { value?: string };
  notes?: { value?: string };
}

interface LssCoins {
  gp?: { value?: number | string };
  sp?: { value?: number | string };
  cp?: { value?: number | string };
  pp?: { value?: number | string };
}

interface LssSpellsInfo {
  base?: { code?: string; value?: string };
}

interface LssData {
  name?: { value?: string };
  info?: {
    charClass?: { value?: string };
    charSubclass?: { value?: string };
    level?: { value?: number | string };
    background?: { value?: string };
    race?: { value?: string };
  };
  stats?: Record<string, LssStat>;
  saves?: Record<string, LssSave>;
  skills?: Record<string, LssSkill>;
  proficiency?: number;
  proficiencyCustom?: number;
  vitality?: LssVitality;
  weaponsList?: LssWeapon[];
  coins?: LssCoins;
  spellsInfo?: LssSpellsInfo;
}

const STAT_MAP = [
  {
    lss: "str",
    label: "Сила",
    save: "Спас. Сила",
    skills: [["athletics", "Атлетика"]],
  },
  {
    lss: "dex",
    label: "Ловкость",
    save: "Спас. Ловкость",
    skills: [
      ["acrobatics", "Акробатика"],
      ["sleight of hand", "Ловкость рук"],
      ["stealth", "Скрытность"],
    ],
  },
  {
    lss: "con",
    label: "Телосложение",
    save: "Спас. Телосложение",
    skills: [],
  },
  {
    lss: "int",
    label: "Интеллект",
    save: "Спас. Интеллект",
    skills: [
      ["arcana", "Магия"],
      ["history", "История"],
      ["investigation", "Анализ"],
      ["nature", "Природа"],
      ["religion", "Религия"],
    ],
  },
  {
    lss: "wis",
    label: "Мудрость",
    save: "Спас. Мудрость",
    skills: [
      ["animal handling", "Уход за животными"],
      ["insight", "Проницательность"],
      ["medicine", "Медицина"],
      ["perception", "Внимательность"],
      ["survival", "Выживание"],
    ],
  },
  {
    lss: "cha",
    label: "Харизма",
    save: "Спас. Харизма",
    skills: [
      ["deception", "Обман"],
      ["intimidation", "Запугивание"],
      ["performance", "Выступление"],
      ["persuasion", "Убеждение"],
    ],
  },
] as const;

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatMod(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function profMultiplier(isProf: boolean | number | undefined): number {
  if (isProf === 2) return 2;
  if (isProf === true || isProf === 1) return 1;
  return 0;
}

function proficiencyBonus(lss: LssData): number {
  const custom = Number(lss.proficiencyCustom);
  if (custom) return custom;
  const base = Number(lss.proficiency);
  return base || 2;
}

function parsePlainNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
  }
  return undefined;
}

function getStatMods(lss: LssData): Record<string, number> {
  const mods: Record<string, number> = {};
  for (const stat of STAT_MAP) {
    const score = Number(lss.stats?.[stat.lss]?.score);
    mods[stat.lss] = Number.isFinite(score) ? abilityMod(score) : 0;
  }
  return mods;
}

const STAT_CODE_TO_LABEL: Record<string, string> = {
  str: "Сила",
  dex: "Ловкость",
  con: "Телосложение",
  int: "Интеллект",
  wis: "Мудрость",
  cha: "Харизма",
};

function formatHitDice(vitality: LssVitality | undefined): string {
  const hitDie = vitality?.["hit-die"]?.value?.trim();
  const current = parsePlainNumber(vitality?.["hp-dice-current"]?.value);
  if (!hitDie) return "";
  const size = hitDie.replace(/^[dкdDК]/, "");
  if (current !== undefined && size) {
    return `${current} к${size}`;
  }
  return hitDie;
}

function substituteDamageFormula(
  dmg: string,
  mods: Record<string, number>,
): string {
  const replaced = dmg.replace(
    /\[(STR|DEX|CON|INT|WIS|CHA)\]/gi,
    (_, stat: string) => {
      const mod = mods[stat.toLowerCase()] ?? 0;
      return formatMod(mod);
    },
  );
  return replaced.replace(/\+\+/g, "+").replace(/\+-/g, "-");
}

function parseLssData(input: unknown): LssData {
  if (!input || typeof input !== "object") {
    throw new Error("Некорректный формат LSS");
  }
  const obj = input as Record<string, unknown>;
  if (typeof obj.data === "string") {
    return JSON.parse(obj.data) as LssData;
  }
  return obj as LssData;
}

export function isLssCharacter(input: unknown): boolean {
  if (!input || typeof input !== "object") return false;
  const obj = input as Record<string, unknown>;
  if (obj.jsonType === "character" && typeof obj.data === "string") return true;
  if (obj.info && obj.stats && typeof obj.stats === "object") return true;
  return false;
}

export function convertLssToCharacter(
  input: unknown,
  schemaId: string,
  ownerId: string,
) {
  const lss = parseLssData(input);
  const prof = proficiencyBonus(lss);

  const name = lss.name?.value?.trim() || "Без имени";
  const className = lss.info?.charClass?.value || "";
  const subclass = lss.info?.charSubclass?.value || "";
  const classValue = subclass ? `${className} (${subclass})` : className;
  const race = lss.info?.race?.value || "";
  const background = lss.info?.background?.value || "";
  const level = lss.info?.level?.value;
  const levelValue = level === undefined || level === null ? "" : String(level);

  // data_fields хранится плоско: ключи вида "Секция.Поле", как их задаёт antd Form
  const dataFields: Record<string, unknown> = {
    "Главное.Имя": name,
    "Главное.Класс": classValue,
    "Главное.Раса": race,
    "Главное.Предыстория": background,
    "Главное.Уровень": levelValue,
    "Главное.Бонус мастерства": formatMod(prof),
  };

  const section = "Характеристики и навыки";
  for (const stat of STAT_MAP) {
    const score = Number(lss.stats?.[stat.lss]?.score);
    const hasScore = Number.isFinite(score);
    const mod = hasScore ? abilityMod(score) : 0;

    const statKey = `${section}.${stat.label} (Знач/мод)`;
    dataFields[`${statKey}.min`] = hasScore ? String(score) : "";
    dataFields[`${statKey}.max`] = hasScore ? formatMod(mod) : "";

    const saveProf = profMultiplier(lss.saves?.[stat.lss]?.isProf);
    dataFields[`${section}.${stat.save}`] = hasScore
      ? formatMod(mod + prof * saveProf)
      : "";

    for (const [lssSkill, label] of stat.skills) {
      const skillProf = profMultiplier(lss.skills?.[lssSkill]?.isProf);
      dataFields[`${section}.${label}`] = hasScore
        ? formatMod(mod + prof * skillProf)
        : "";
    }
  }

  const mods = getStatMods(lss);
  const vitality = lss.vitality;

  // Боевые параметры
  const hpCurrent = parsePlainNumber(vitality?.["hp-current"]?.value);
  const hpMax = parsePlainNumber(vitality?.["hp-max"]?.value);
  if (hpCurrent !== undefined) {
    dataFields["Боевые параметры.Хиты.min"] = String(hpCurrent);
  }
  if (hpMax !== undefined) {
    dataFields["Боевые параметры.Хиты.max"] = String(hpMax);
  }

  const hpTemp = parsePlainNumber(vitality?.["hp-temp"]?.value);
  if (hpTemp !== undefined) {
    dataFields["Боевые параметры.Временные ХП"] = String(hpTemp);
  }

  const hitDice = formatHitDice(vitality);
  if (hitDice) {
    dataFields["Боевые параметры.Кости хитов"] = hitDice;
  }

  const speed = parsePlainNumber(vitality?.speed?.value);
  if (speed !== undefined) {
    dataFields["Боевые параметры.Скорость, фт"] = String(speed);
  }

  const initiativeRaw = vitality?.initiative?.value;
  const initiativeNum = parsePlainNumber(initiativeRaw);
  if (initiativeNum !== undefined) {
    dataFields["Боевые параметры.Инициатива"] = formatMod(initiativeNum);
  } else if (initiativeRaw === null || initiativeRaw === undefined || initiativeRaw === "") {
    dataFields["Боевые параметры.Инициатива"] = formatMod(mods.dex ?? 0);
  }

  const ac = parsePlainNumber(vitality?.ac?.value);
  if (ac !== undefined) {
    dataFields["Боевые параметры.Класс защиты"] = String(ac);
  }

  // Монеты
  const coins = lss.coins;
  const cp = parsePlainNumber(coins?.cp?.value);
  const sp = parsePlainNumber(coins?.sp?.value);
  const gp = parsePlainNumber(coins?.gp?.value);
  const pp = parsePlainNumber(coins?.pp?.value);
  if (cp !== undefined) dataFields["Монеты.Медные монеты"] = String(cp);
  if (sp !== undefined) dataFields["Монеты.Серебрянные монеты"] = String(sp);
  if (gp !== undefined) dataFields["Монеты.Золотые монеты"] = String(gp);
  if (pp !== undefined) dataFields["Монеты.Платиновые монеты"] = String(pp);

  // Атаки и оружие
  const weapons = Array.isArray(lss.weaponsList) ? lss.weaponsList : [];
  if (weapons.length > 0) {
    const weaponPrefix = "Атаки и оружие.Атаки и оружиеАтаки и оружие";
    dataFields[weaponPrefix] = weapons.map((weapon) => {
      const ability = (weapon.ability || "str").toLowerCase();
      const mod = mods[ability] ?? 0;
      const weaponProf = profMultiplier(weapon.isProf);
      const bonus = mod + prof * weaponProf;
      const dmg = weapon.dmg?.value?.trim() || "";
      const dmgType = weapon.dmgType?.value?.trim() || "";
      const dmgValue = substituteDamageFormula(dmg, mods);
      const damageText = [dmgValue, dmgType].filter(Boolean).join(" ");
      const note = weapon.notes?.value?.trim() || "";

      return {
        [`${weaponPrefix}-Название`]: weapon.name?.value?.trim() || "",
        [`${weaponPrefix}-Бонус`]: formatMod(bonus),
        [`${weaponPrefix}-Урон/вид`]: damageText,
        [`${weaponPrefix}-Примечание`]: note,
      };
    });
  }

  // Заклинания
  const spellCode = lss.spellsInfo?.base?.code?.toLowerCase();
  const spellAbility = spellCode ? STAT_CODE_TO_LABEL[spellCode] : undefined;
  if (spellAbility) {
    dataFields["Заклинания.Характеристика"] =
      `Заклинания.Характеристика-${spellAbility}`;
    const spellMod = mods[spellCode as string] ?? 0;
    dataFields["Заклинания.Модификатор"] = formatMod(spellMod);
    dataFields["Заклинания.Атака"] = formatMod(spellMod + prof);
    dataFields["Заклинания.Спасбросок"] = String(8 + spellMod + prof);
  }

  return {
    name,
    owner: ownerId,
    list_schema: schemaId,
    data_fields: dataFields,
  };
}

export function isDndSchemaName(name: string): boolean {
  const normalized = name.toLowerCase();
  return normalized.includes("dnd") || normalized.includes("d&d");
}
