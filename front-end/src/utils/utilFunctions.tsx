import { gunsWeapons, illicitDrugs, legal, sexual } from "./globalVariables";

/**
 * Function for waiting a string promise
 * @param promise Promise<string>
 * @returns string text
 */
export async function obtainPlainTextPromise(promise: Promise<string>) {
  try {
    const result = await promise;
    return result;
  } catch (error) {
    console.error("Critical Error obtaining promise:", error);
  }
}

/**
 * 
 * @param text string to analyze
 * @param category category detected
 * @returns Json with the category and list of word detected
 */
export async function detectCategoryWords(
  text: string | undefined,
  category: string
) {
  if (text === undefined) {
    console.error("Error: El texto es undefined.");
    return [];
  }

  const relevantWords: string[] = [];
  switch (category) {
    case "Illicit Drugs": {
      illicitDrugs.forEach((word) => {
        if (text.toLowerCase().includes(word)) {
          relevantWords.push(word);
        }
      });
      break;
    }
    case "Firearms & Weapons": {
      gunsWeapons.forEach((word) => {
        if (text.toLowerCase().includes(word)) {
          relevantWords.push(word);
        }
      });
      break;
    }
    case "Sexual": {
      sexual.forEach((word) => {
        if (text.toLowerCase().includes(word)) {
          relevantWords.push(word);
        }
      });
      break;
    }
    case "Legal": {
      legal.forEach((word) => {
        if (text.toLowerCase().includes(word)) {
          relevantWords.push(word);
        }
      });
      break;
    }
  }
  if(relevantWords.length == 0){
    relevantWords.push("Palabras no encontrada por nuestro sistema")
  }
  return relevantWords;
}
