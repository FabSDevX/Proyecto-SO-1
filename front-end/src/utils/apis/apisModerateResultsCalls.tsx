import { SERVER_IP } from "../globalVariables";

/**
 * Function to moderate text content for sensibility topics
 * @param text string to moderate
 * @returns JSON {category:confidence} --> sensibility category
 */
export async function contentModerationApi(text: string | undefined) {
  try {
    const moderationAlert = await fetch(`${SERVER_IP}:5000/api/moderate`, {
      method: "POST",
      body: JSON.stringify({
        text: text,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (moderationAlert.ok) {
      return await moderationAlert.json();
    }
    return await moderationAlert.json();
  } catch (error) {
    console.error("Process moderation request error:", error);
  }
}
