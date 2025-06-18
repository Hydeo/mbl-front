// src/utils/xmlParser.ts
import type { BggCollectionItem, BggThingItem, BoardGameDetails } from '~/types/bgg';

/**
 * Parses a BGG XML string into a JavaScript object.
 * This is a generic XML parser.
 * @param xmlString The XML string to parse.
 * @returns The parsed JavaScript object.
 */
export function parseBggXml(xmlString: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const result: any = {};

  function parseElement(element: Element): any {
    const obj: any = {};

    // Parse attributes
    if (element.hasAttributes()) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        obj[attr.name] = attr.value;
      }
    }

    // Parse child elements
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      const tagName = child.tagName;

      if (child.children.length > 0 || child.hasAttributes()) {
        // If child has its own children or attributes, parse it as an object
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
      } else {
        // If child has only text content, store its text
        if (obj[tagName]) {
          // If tag already exists, convert to array
          if (!Array.isArray(obj[tagName])) {
            obj[tagName] = [obj[tagName]];
          }
          obj[tagName].push({ _text: child.textContent || '' });
        } else {
          obj[tagName] = { _text: child.textContent || '' };
        }
      }
    }

    // If element has only text content and no children/attributes (e.g., <name>Some Name</name>)
    if (element.children.length === 0 && !element.hasAttributes()) {
      return element.textContent || '';
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

  // Helper to handle single or array of links
  const processLinks = (links: any | any[], typeFilter: string, targetArray: { id: string; name: string }[]) => {
    const linkArray = Array.isArray(links) ? links : [links];
    linkArray.forEach((link: any) => {
      if (link._attributes && link._attributes.type === typeFilter) {
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
    const primary = item.name.find(n => !n._attributes.type); // Find the name without a 'type' attribute
    primaryName = primary ? primary._attributes.value : item.name[0]?._attributes.value || 'Unknown Game';
  } else if (item.name && item.name._attributes) {
    primaryName = item.name._attributes.value;
  }


  return {
    id: item._attributes.id,
    type: item._attributes.type,
    name: primaryName,
    description: item.description ? item.description._text : 'No description available.',
    yearPublished: item.yearpublished ? item.yearpublished._text : 'N/A',
    minPlayers: item.minplayers ? parseInt(item.minplayers._text, 10) : 0,
    maxPlayers: item.maxplayers ? parseInt(item.maxplayers._text, 10) : 0,
    playingTime: item.playingtime ? parseInt(item.playingtime._text, 10) : 0,
    minPlaytime: item.minplaytime ? parseInt(item.minplaytime._text, 10) : 0,
    maxPlaytime: item.maxplaytime ? parseInt(item.maxplaytime._text, 10) : 0,
    minAge: item.minage ? parseInt(item.minage._text, 10) : 0,
    imageUrl: item.image ? item.image._text : '',
    thumbnailUrl: item.thumbnail ? item.thumbnail._text : '',
    categories,
    mechanics,
    designers,
    publishers,
  };
}
