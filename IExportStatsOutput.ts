export interface IExportStatsOutput {
  abilities: ISpecialAbilityItem[];
  abs: IExportArcaneBackground[];
  iconicFramework: string;        // Just the name, if one is selected
  advances: IExportAdvanceItem[];
  advancesCount: number;
  armor: IExportArmor[];
  armorValue: number;
  attributes: IAttributeItem[],
  background: string;
  charisma: number;
  description: string;
  edges: IExportListItem[];
  gear: IExportGear[];
  gender: string;
  professionOrTitle: string;
  savagedUsShareURL: string;
  heavyArmor: boolean;
  hindrances: IExportHindranceItem[];
  image: string;
  age: string;
  imageToken: string;
  load: number;
  loadLimit: number;
  loadLimitBase: number;
  loadLimitModifier: number;
  name: string;
  paceBase: number;
  paceMod: number;
  paceTotal: number;
  parryBase: number;
  parryMod: number;
  parryTotal: number;
  race: string;
  rank: number;
  rankName: string;
  runningDie: string;
  sanity: number;
  size: number;
  skills: IExportSkillItem[];
  swade: boolean;
  toughnessBase: number;
  toughnessMod: number;
  toughnessTotal: number;
  toughnessTotalNoArmor: number;
  useCharisma: boolean;
  usesXP: boolean;
  uuid: string;
  wealth: number;
  weapons: IExportWeapon[];
  wildcard: boolean;
  xp: number;

  cyberware: IExportCyberware[];

  bennies: number;
  benniesMax: number;

  wounds: number;
  woundsMax: number;

  languages: IExportSkillItem[];

  fatigue: number;
  fatigueMax: number;

  journal: IExportJournal[];
}

interface IExportJournal {
  date: Date;
  title: string;
  text: string[];
}
export interface IExportArcaneBackground {
  arcaneSkill: string;
  name: string;
  powerPointsCurrent: number;
  powerPointsMax: number;
  powerPointsName: string;
  powers: IExportPower[];
  powersTotal: number;
}

interface IExportPower {
  damage: string;
  description: string;
  duration: string;
  innate: boolean;
  name: string;
  powerPoints: string;
  range: string;
  summary: string;
}

interface IExportSkillItem {
  attribute: string;
  dieValue: number;
  mod: number;
  name: string;
  value: string;
}

interface IExportListItem {
  description: string;
  name: string;
  note: string;
}

interface IExportAdvanceItem {
  description: string;
  name: string;
  number: number;
}

interface IExportHindranceItem {
  description: string;
  major: boolean;
  name: string;
  note: string;
}

interface ISpecialAbilityItem {
  name: string;
  description: string;
  note: string;
  positive: boolean;
  from: string;
}

interface IAttributeItem {
  dieValue: number;
  mod: number;
  name: string;
  value: string;
}

interface IExportArmor {
  armor: number;
  coversArms: boolean;
  coversFace: boolean;
  coversHead: boolean;
  coversLegs: boolean;
  coversTorso: boolean;
  name: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  cost: number;
  costBuy: number;                // cost of gear as it was purchased
  minStr: string;
}

export interface IExportGear {
  contains: IExportGear[];
  equipped: boolean;
  name: string;
  quantity: number;
  weight: number;
  notes: string;
  cost: number;
  costBuy: number;                // cost of gear as it was purchased
}

interface IExportCyberware {
  name: string;
  quantity: number;
  strain: number;
  ranks: number;
  notes: string;
  cost: number;
  costBuy: number;                // cost of gear as it was purchased
}

interface IExportWeapon {
  ap: number;
  equipped: boolean;
  damage: string;
  name: string;
  notes: string;
  quantity: number;
  range: string;
  rof: number;
  shots: number;
  thrown: boolean;
  weight: number;

  reach: number;
  innate: boolean;

  damageDiceBasePlus: number;     // will be the bonus part of ParseDamageString.ts
  damageDiceBase: string;         // will be the dice part of ParseDamageString.ts

  cost: number;
  costBuy: number;                // cost of gear as it was purchased
  minStr: string;                 // d6, d8 ,etc
}