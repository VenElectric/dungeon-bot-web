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
