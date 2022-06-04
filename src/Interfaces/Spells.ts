export interface CharacterStatus {
  id: string;
  characterName: string;
}

export interface CharacterStatusFirestore {
  target: CharacterStatus[];
  source: CharacterStatus[];
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
