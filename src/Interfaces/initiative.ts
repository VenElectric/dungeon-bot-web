export interface StatusEffect {
  spellName: string;
  id: string;
  effectDescription: string;
}

export interface CharacterStatusFirestore {
  target: CharacterStatus[];
  source: CharacterStatus[];
}

export interface CharacterStatus {
  characterId: string;
  characterName: string;
}

export interface CharacterStatusDouble {
  length: 2;
  0: CharacterStatus[];
  1: CharacterStatus[];
}
export interface InitiativeObject {
  id: string;
  characterName: string;
  initiative: number;
  initiativeModifier: number;
  roundOrder: number;
  isCurrent: boolean;
  statusEffects: StatusEffect[];
  isNpc: boolean;
}

export type InitiativeKeys = keyof InitiativeObject;

export interface SpellObject {
  durationTime: number;
  durationType: string;
  effectName: string;
  effectDescription: string;
  id: string;
  characterIds: CharacterStatusFirestore;
}

export interface ServerSpellObject {
  durationTime: number;
  durationType: string;
  effectName: string;
  effectDescription: string;
  id: string;
  characterIds: CharacterStatusFirestore;
}

export interface SessionData {
  onDeck: number;
  isSorted: boolean;
  initiativeList: InitiativeObject[];
  SpellObject: SpellObject[];
  sessionId: string;
}

export interface TargetData {
  id: string;
  name: string;
  status_effects: StatusEffect[] | [];
}

export type SetInitiativeType = (initiativeList: InitiativeObject[]) => void;
export type SetSpellType = (spells: SpellObject[]) => void;
export type SetSortType = (isSorted: boolean) => void;
export type SetRecordType = (record: InitiativeObject | SpellObject) => void;
