import { SpellObject } from "./Spells";

export interface StatusEffect {
  spellName: string;
  id: string;
  effectDescription: string;
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

export interface SessionData {
  onDeck: number;
  isSorted: boolean;
  initiativeList: InitiativeObject[];
  SpellObject: SpellObject[];
  sessionId: string;
}
