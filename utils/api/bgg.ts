// utils/api/bgg.ts
import axios from 'axios';
import { parseBggXml } from '~/utils/xmlParser'; // Updated import path
import type { BggCollectionResponse, BoardGame } from '~/types/bgg'; // Updated import path

const BGG_API_BASE_URL = 'https://boardgamegeek.com/xmlapi2/';
const RETRY_DELAY_MS = 2000; // 2 seconds delay between retries
const MAX_RETRIES = 5;

export async function fetchUserCollection(
  username: string,
  retries = 0
): Promise<BoardGame[]> {
  const url = `${BGG_API_BASE_URL}collection?username=${username}&subtype=boardgame&stats=1`;
  // `stats=1` is important to get image URLs and other details.

  try {
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/xml', // Request XML explicitly
      },
    });

    if (response.status === 202) {
      // Request is queued, retry after a delay
      if (retries < MAX_RETRIES) {
        console.warn(`BGG API returned 202 for ${username}. Retrying in ${RETRY_DELAY_MS / 1000} seconds... (Attempt ${retries + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return fetchUserCollection(username, retries + 1); // Recursive retry
      } else {
        throw new Error('BGG API timed out after multiple retries (status 202).');
      }
    } else if (response.status === 200) {
      const parsedXml = parseBggXml(response.data) as BggCollectionResponse;

      if (!parsedXml.items || !parsedXml.items.item) {
        return []; // No items found or malformed response
      }

      // Ensure item is always an array, even if only one item is returned
      const itemsArray = Array.isArray(parsedXml.items.item) ? parsedXml.items.item : [parsedXml.items.item];

      // Map the raw XML data to our simplified BoardGame interface
      const boardGames: BoardGame[] = itemsArray.map((item) => ({
        id: item.objectid,
        name: item.name._text,
        yearPublished: item.yearpublished?._text || 'N/A',
        imageUrl: item.image?._text || '',
        thumbnailUrl: item.thumbnail?._text || '',
        numPlays: parseInt(item.numplays?._text || '0', 10),
      }));

      return boardGames;
    } else {
      throw new Error(`BGG API returned unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching BGG collection:', error);
    throw error;
  }
}
