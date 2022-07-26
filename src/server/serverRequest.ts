import axios from "axios";
import { endpoints } from "./static";

async function getCharacter(id: string, userId: string) {
  try {
    const response = await axios.get(
      `${endpoints.default}${endpoints.characterGET}`,
      {
        data: { id: id, userId: userId },
      }
    );

    const characterData = await JSON.parse(response.data);

    return characterData;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }
}

async function updateCharacter(characterData: any, userId: string) {
  try {
    const response = await axios.post(
      `${endpoints.default}${endpoints.characterPOST}`,
      {
        data: { characterData: characterData, userId: userId },
      }
    );

    return response.status;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }
}

async function getCharacterList(userId: string) {
  try {
    const response = await axios.post(
      `${endpoints.default}${endpoints.characterPOST}`,
      {
        data: { userId: userId },
      }
    );

    return response.status;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }
}
