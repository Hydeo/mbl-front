// src/api/bgg.ts
import axios from 'axios';
import { parseBggXml, parseBggThingXml } from '~/utils/xmlParser'; // Corrected import path
import type { BggCollectionResponse, BoardGame, BggThingResponse, BoardGameDetails } from '~/types/bgg';

const BGG_API_BASE_URL = 'https://boardgamegeek.com/xmlapi2';

/**
 * Fetches a user's board game collection from BoardGameGeek.
 * Implements a retry mechanism for 202 status codes (queued requests).
 * @param username The BGG username.
 * @param retries The current retry count (internal).
 * @returns A promise that resolves to an array of BoardGame objects.
 * @throws Error if the API call fails or returns an error.
 */
export async function fetchUserCollection(
  username: string,
  retries = 0
): Promise<BoardGame[]> {
  const maxRetries = 5;
  const retryDelayMs = 2000; // 2 seconds

  try {
    const response = await axios.get<string>(
      `${BGG_API_BASE_URL}/collection?username=${username}&subtype=boardgame&stats=1`
    );

    if (response.status === 202) {
      if (retries < maxRetries) {
        console.warn(`BGG API returned 202 for collection. Retrying in ${retryDelayMs / 1000}s... (Attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        return fetchUserCollection(username, retries + 1); // Recursive retry
      } else {
        throw new Error('BGG API timed out or is busy. Please try again later.');
      }
    }

    const parsedData: any = parseBggXml(response.data); // Use 'any' temporarily to check for 'errors'

    // Check for API errors returned in the XML (e.g., invalid username)
    if (parsedData.errors && parsedData.errors.error) {
        const errorMessage = Array.isArray(parsedData.errors.error)
            ? parsedData.errors.error.map((e: any) => e._text).join(', ')
            : parsedData.errors.error._text;
        throw new Error(`BGG API Error: ${errorMessage}`);
    }

    // Check if the parsed data has the expected root structure (<items> element with attributes)
    // The parseBggXml function returns the parsed root element directly.
    if (!parsedData || !parsedData._attributes || typeof parsedData._attributes.totalitems === 'undefined') {
       throw new Error('Invalid collection data structure: Expected root <items> element with totalitems attribute.');
    }

    // Now we are confident parsedData is the <items> element with attributes
    const collectionData: BggCollectionResponse = parsedData; // Cast is now safer

    const totalItems = parseInt(collectionData._attributes.totalitems, 10);

    // Handle cases where the user has no collection (totalitems is 0)
    if (totalItems === 0) {
      return []; // No items in collection
    }

    // If totalitems > 0, we expect 'item' to be present.
    // Ensure item is always treated as an array, even if the API returned a single item object
    const itemsArray = Array.isArray(collectionData.item) ? collectionData.item : [collectionData.item];

    // If totalItems > 0 && itemsArray is empty, it means the 'item' property was missing when totalItems > 0
    if (totalItems > 0 && (!itemsArray || itemsArray.length === 0)) {
         throw new Error('Invalid collection data structure: Expected items but none found when totalitems > 0.');
    }

    // Now map over the itemsArray
    return itemsArray.map(item => ({
      id: item.objectid,
      name: item.name._text,
      yearPublished: item.yearpublished ? item.yearpublished._text : 'N/A',
      // Access image and thumbnail URLs directly as they are parsed as strings
      imageUrl: item.image || '',
      thumbnailUrl: item.thumbnail || '',
      numPlays: item.numplays ? parseInt(item.numplays._text, 10) : 0,
    }));
  } catch (error: any) {
    console.error('Error fetching BGG collection:', error);
    throw new Error(`Failed to fetch collection: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Fetches detailed information for a specific board game from BoardGameGeek.
 * @param gameId The ID of the board game.
 * @param retries The current retry count (internal).
 * @returns A promise that resolves to a BoardGameDetails object.
 * @throws Error if the API call fails or returns an error.
 */
export async function fetchGameDetails(
  gameId: string,
  retries = 0
): Promise<BoardGameDetails> {
  const maxRetries = 5;
  const retryDelayMs = 2000; // 2 seconds

  try {
    const response = await axios.get<string>(
      `${BGG_API_BASE_URL}/thing?id=${gameId}&stats=1&videos=1&type=boardgame`
    );

    if (response.status === 202) {
      if (retries < maxRetries) {
        console.warn(`BGG API returned 202 for game details. Retrying in ${retryDelayMs / 1000}s... (Attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        return fetchGameDetails(gameId, retries + 1); // Recursive retry
      } else {
        throw new Error('BGG API timed out or is busy. Please try again later.');
      }
    }

    const parsedData: BggThingResponse = parseBggXml(response.data);

    if (!parsedData.items || !parsedData.items.item) {
      throw new Error('Invalid game details data received from BGG API.');
    }

    // The 'item' can be a single object or an array if multiple IDs were requested.
    // We expect a single item for a single ID request.
    const item = Array.isArray(parsedData.items.item) ? parsedData.items.item[0] : parsedData.items.item;

    if (!item) {
      throw new Error(`Game with ID ${gameId} not found.`);
    }

    return parseBggThingXml(item); // Use the new parsing function
  } catch (error: any) {
    console.error(`Error fetching BGG game details for ID ${gameId}:`, error);
    throw new Error(`Failed to fetch game details: ${error.message || 'Unknown error'}`);
  }
}
