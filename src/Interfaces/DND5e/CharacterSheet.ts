export interface CharacterSheetObj {
  MainStats: MainStats;
}

export enum Languages {
  common = "common",
  // todo
}

export interface MainStats {
  name: string;
  profBonus: number;
  initiative: number;
  languages: Languages[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  conditions: string[];
  spellAttack: number;
  spellSaveDC: number;
  isInspired: boolean;
}

export interface AbilityScoreObj {
  value: number;
  bonus: number;
  misc: number;
  // calculate total bonus from other areas such as feats
}

export const AbilityScores: { [scoreAbbr: string]: string } = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

export interface AbilityScoresObj {
  str: AbilityScoreObj;
  dex: AbilityScoreObj;
  con: AbilityScoreObj;
  int: AbilityScoreObj;
  wis: AbilityScoreObj;
  cha: AbilityScoreObj;
}

export interface TempHPSource {
  name: string;
  current: number;
  max: number;
}

export interface HealthObj {
  current: number;
  max: number;
  temp: number;
  tempsources: TempHPSource[];
}

export interface SavingThrowObj {
  name: string;
  isProficient: boolean;
  // saving throws are calcuated based on their corresponding ability score.
  // Add proficiency bonus if they are proficient in that saving throw
}

export interface MovementObj {
  land: number;
  fly: number;
  swim: number;
}

export enum Currency {
  gp = "gp",
  sp = "sp",
  pp = "pp",
  cp = "cp",
  ep = "ep",
}

export enum RarityTypes {
  common = "Common",
  // todo
}

export interface ItemObj {
  id: string;
  name: string;
  type: string;
  weight: number; // lb added in ui
  costValue: number;
  costCurrency: Currency;
  quantity: number;
  rarity: string;
  description: string;
}

export enum WeaponTypes {
  melee = "Melee",
  ranged = "Ranged",
}

export enum DamageTypes {
  piercing = "Piercing",
  // todo
}

export interface Weapon extends ItemObj {
  isProficient: boolean;
  type: WeaponTypes;
  reach: string;
  damage: string;
  damageType: DamageTypes;
  properties: string[];
}

export enum ArmorTypes {
  light = "Light",
  medium = "Medium",
  heavy = "Heavy",
}

export interface Armor extends ItemObj {
  armorClass: number;
  armorType: ArmorTypes;
}
