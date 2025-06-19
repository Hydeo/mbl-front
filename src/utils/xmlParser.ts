// src/utils/xmlParser.ts
import type { BggCollectionItem, BggThingItem, BoardGameDetails } from '~/types/bgg';

/**
 * Parses a BGG XML string into a JavaScript object.
 * This is a generic XML parser.
 * @param xmlString The XML string to parse.
 * @returns The parsed JavaScript object.
 */
/**
 * Parses a BGG XML string into a JavaScript object.
 * This parser relies on browser-specific DOMParser.
 * @param xmlString The XML string to parse.
 * @returns The parsed JavaScript object.
 * @throws Error if called outside of a browser environment.
 */
export function parseBggXml(xmlString: string): any {
  // Ensure this function only runs on the client side
  if (process.server) {
    // On the server, we cannot use DOMParser.
    // Throw an error to indicate that this function is client-only.
    console.error('parseBggXml called on server, but DOMParser is not available.');
    throw new Error('DOMParser is not available on the server. XML parsing must happen on the client.');
  }

  // This code only runs on the client
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const result: any = {};

  function parseElement(element: Element): any {
    const obj: any = {};

    // Parse attributes
    if (element.hasAttributes()) {
      obj._attributes = {}; // Store attributes under _attributes key
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        obj._attributes[attr.name] = attr.value;
      }
    }

    // Collect text content from direct text nodes
    let textContent = '';
    for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
            textContent += node.textContent?.trim() || '';
        }
    }
    if (textContent) {
        obj._text = textContent; // Store text content under _text key
    }

    // Parse child elements
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      const tagName = child.tagName;
      const parsedChild = parseElement(child);

      if (obj[tagName]) {
        // If tag already exists, convert to array
        if (!Array.isArray(obj[tagName])) {
          obj[tagName] = [obj[tagName]];
        }
        obj[tagName].push(parsedChild);
      } else {
        obj[tagName] = parsedChild;
      }
    }

    // Special case: if the element has no attributes and no child elements,
    // its value is just its text content (if any).
    if (!element.hasAttributes() && element.children.length === 0) {
        return textContent || null; // Return text or null if empty
    }

    // If the object is empty but there was text content, return the text content
    // This handles cases like <description>Some text</description> where textContent was captured
    // but no attributes or children were present to add to obj.
     if (Object.keys(obj).length === 0 && textContent) {
         return textContent;
     }


    return obj;
  }

  // Start parsing from the root element
  if (xmlDoc.documentElement) {
    return parseElement(xmlDoc.documentElement);
  }

  return result;
}

/**
 * Parses a BggThingItem (raw XML parsed object) into a simplified BoardGameDetails object.
 * @param item The raw BggThingItem object.
 * @returns A simplified BoardGameDetails object.
 */
export function parseBggThingXml(item: BggThingItem): BoardGameDetails {
  const categories: { id: string; name: string }[] = [];
  const mechanics: { id: string; name: string }[] = [];
  const designers: { id: string; name: string }[] = [];
  const publishers: { id: string; name: string }[] = [];
  let rating = 0;
  let recommendedPlayers = 'N/A';

  // Helper to handle single or array of links
  const processLinks = (links: any | any[], typeFilter: string, targetArray: { id: string; name: string }[]) => {
    const linkArray = Array.isArray(links) ? links : [links];
    linkArray.forEach((link: any) => {
      if (link?._attributes?.type === typeFilter) {
        targetArray.push({
          id: link._attributes.id,
          name: link._attributes.value,
        });
      }
    });
  };

  if (item.link) {
    processLinks(item.link, 'boardgamecategory', categories);
    processLinks(item.link, 'boardgamemechanic', mechanics);
    processLinks(item.link, 'boardgamedesigner', designers);
    processLinks(item.link, 'boardgamepublisher', publishers);
  }

  // Handle name: it can be a single object or an array. The primary name has no 'type' attribute.
  let primaryName = '';
  if (Array.isArray(item.name)) {
    const primary = item.name.find(n => !n._attributes?.type); // Find the name without a 'type' attribute
    primaryName = primary ? primary._attributes.value : item.name[0]?._attributes?.value || 'Unknown Game';
  } else if (item.name?._attributes) {
    primaryName = item.name._attributes.value;
  }

  // Parse statistics if available
  if (item.statistics?.ratings) {
    rating = parseFloat(item.statistics.ratings.average?._attributes?.value || '0');

    // Parse suggested_numplayers poll
    const playerPoll = Array.isArray(item.poll)
      ? item.poll.find(p => p._attributes?.name === 'suggested_numplayers')
      : item.poll?._attributes?.name === 'suggested_numplayers' ? item.poll : null;

    if (playerPoll?.results) {
      const resultsArray = Array.isArray(playerPoll.results) ? playerPoll.results : [playerPoll.results];
      let bestResult = null;
      let maxVotes = 0;

      resultsArray.forEach((resultGroup: any) => {
        // Each 'results' group contains multiple 'result' items for different player counts
        const resultItems = Array.isArray(resultGroup.result) ? resultGroup.result : [resultGroup.result];
        resultItems.forEach((result: any) => {
          if (result?._attributes?.value === 'Best' && result?._attributes?.numvotes) {
            const numVotes = parseInt(result._attributes.numvotes, 10);
            if (numVotes > maxVotes) {
              maxVotes = numVotes;
              // Find the corresponding numplayers from the parent 'results' group
              bestResult = resultGroup._attributes?.numplayers;
            }
          }
        });
      });

      if (bestResult) {
        recommendedPlayers = `${item.minplayers?._attributes?.value || '?'}-${item.maxplayers?._attributes?.value || '?'} players (Best with ${bestResult})`;
      } else {
         recommendedPlayers = `${item.minplayers?._attributes?.value || '?'}-${item.maxplayers?._attributes?.value || '?'} players`;
      }
    } else {
       recommendedPlayers = `${item.minplayers?._attributes?.value || '?'}-${item.maxplayers?._attributes?.value || '?'} players`;
    }
  }


  return {
    id: item._attributes.id,
    type: item._attributes.type,
    name: primaryName,
    // Description is parsed directly as text content
    description: item.description || 'No description available.',
    // Access yearPublished value from attributes
    yearPublished: item.yearpublished?._attributes?.value || 'N/A',
    // Access player counts and times from attributes
    minPlayers: item.minplayers?._attributes?.value ? parseInt(item.minplayers._attributes.value, 10) : 0,
    maxPlayers: item.maxplayers?._attributes?.value ? parseInt(item.maxplayers._attributes.value, 10) : 0,
    playingTime: item.playingtime?._attributes?.value ? parseInt(item.playingtime._attributes.value, 10) : 0,
    minPlaytime: item.minplaytime?._attributes?.value ? parseInt(item.minplaytime._attributes.value, 10) : 0,
    maxPlaytime: item.maxplaytime?._attributes?.value ? parseInt(item.maxplaytime._attributes.value, 10) : 0,
    minAge: item.minage?._attributes?.value ? parseInt(item.minage._attributes.value, 10) : 0,
    // Image and thumbnail URLs are parsed directly as text content
    imageUrl: item.image || '',
    thumbnailUrl: item.thumbnail || '',
    categories,
    mechanics,
    designers, // Keep designers/publishers in the parsed object for now, just remove from display
    publishers,
    rating,
    recommendedPlayers,
  };
}
