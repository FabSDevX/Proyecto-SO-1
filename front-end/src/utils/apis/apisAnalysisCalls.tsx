import { SERVER_IP } from "../globalVariables";


/**
 * Function for analysis text api call
 * @param text string chat text
 * @returns JSON {category: confidence}
 */
export async function textAnalysisApi(text: string | undefined) {
  try {
    if (text == undefined) {
      return " ";
    }
    const response = await fetch(`${SERVER_IP}:5000/api/classify`, {
      method: "POST",
      body: JSON.stringify({
        text: text,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response.ok) {
      return await response.json();
    }
    return await response.json();
  } catch (error) {
    console.error("Process request error:", error);
  }
}

/**
 * Function for analysis audio api call
 * @param formData Formdata list with audios inside of it
 * @returns Complete transcription
 */
export async function audioAnalysisApi(formData: FormData) {
  try {
    const response = await fetch(`${SERVER_IP}:5001/api/transcribe`, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      return await response.json();
    }
    return await response.json();
  } catch (error) {
    console.error("Process request error:", error);
  }
}

/**
 * Function for analysis audio api call
 * @param formData Formdata list with videos inside of it
 * @returns Complete images description
 */
export async function videoAnalysisApi(formData: FormData) {
  try {
    const response = await fetch(
      `${SERVER_IP}:5002/api/upload_and_describe_image`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (response.ok) {
      return await response.json();
    }
    return await response.json();
  } catch (error) {
    console.error("Process request error:", error);
  }
}
