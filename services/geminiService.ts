
import { GroundingSource } from "../types";

// Note: All direct @google/genai imports and logic have been moved to server.js.
// The client-side service now communicates with our own backend proxy.

/**
 * Sends a message to the backend server, which then proxies the request to the Gemini API.
 * @param message The text message from the user.
 * @returns A promise that resolves to the bot's response text and any grounding sources.
 */
export const sendMessageToBot = async (message: string): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text || '',
      sources: data.sources || [],
    };
  } catch (error) {
    console.error("Error sending message to backend:", error);
    // Re-throw the error to be handled by the calling function in App.tsx
    throw error;
  }
};

// initializeChat is no longer needed on the client, so it has been removed.
