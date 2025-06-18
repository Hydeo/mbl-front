/**
 * Parses an XML string into a JavaScript object.
 * This is a simplified parser for the specific BGG XML structure.
 * For more complex XML, a dedicated library like 'fast-xml-parser' might be better.
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
    const children = Array.from(element.children);
    if (children.length > 0) {
      children.forEach((child) => {
        const childName = child.tagName;
        const parsedChild = parseElement(child);

        if (obj[childName]) {
          // If element already exists, convert to array
          if (!Array.isArray(obj[childName])) {
            obj[childName] = [obj[childName]];
          }
          obj[childName].push(parsedChild);
        } else {
          obj[childName] = parsedChild;
        }
      });
    } else {
      // If no children, get text content
      if (element.textContent) {
        obj._text = element.textContent.trim();
      }
    }

    return obj;
  }

  // Start parsing from the root element
  if (xmlDoc.documentElement) {
    result[xmlDoc.documentElement.tagName] = parseElement(xmlDoc.documentElement);
  }

  return result;
}
