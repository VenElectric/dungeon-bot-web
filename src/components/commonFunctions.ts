import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export function rollDice(rollString: string): DiceRoll {
  return new DiceRoll(rollString);
}
