// src/types/bgg.ts

// Existing interfaces for Collection API
export interface BggCollectionItem {
  objecttype: string;
  objectid: string;
  subtype: string;
  collid: string;
  name: {
    _text: string; // The actual name of the game
    sortindex: string;
  };
  yearpublished: {
    _text: string;
  };
  image: {
    _text: string;
  };
  thumbnail: {
    _text: string;
  };
  numplays: {
    _text: string;
  };
  status: {
    _attributes: {
      own: string;
      prevowned: string;
      fortrade: string;
      want: string;
      wanttoplay: string;
      wanttobuy: string;
      wishlist: string;
      preordered: string;
      lastmodified: string;
    };
  };
  // Add other fields if needed from collection API
}

export interface BggCollectionResponse {
  items: {
    _attributes: {
      totalitems: string;
      termsofuse: string;
    };
    item: BggCollectionItem[];
  };
}

export interface BoardGame {
  id: string;
  name: string;
  yearPublished: string;
  imageUrl: string;
  thumbnailUrl: string;
  numPlays: number;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  // Add other fields if needed from collection API
}

// NEW INTERFACES FOR THING API (Game Details)

// Helper for elements with _text and _attributes (like name, description)
interface BggTextNode {
  _text: string;
}

// Helper for elements that are arrays of objects with id and value (like categories, mechanics)
interface BggLinkNode {
  _attributes: {
    id: string;
    type?: string; // 'boardgamecategory', 'boardgamemechanic', etc.
    value: string;
  };
}

// Interface for the 'item' element in the Thing API response
export interface BggThingItem {
  _attributes: {
    type: string;
    id: string;
  };
  thumbnail: BggTextNode;
  image: BggTextNode;
  name: BggLinkNode | BggLinkNode[]; // Can be single or array, primary name has no type
  description: BggTextNode;
  yearpublished: BggTextNode;
  minplayers: BggTextNode;
  maxplayers: BggTextNode;
  playingtime: BggTextNode;
  minplaytime: BggTextNode;
  maxplaytime: BggTextNode;
  minage: BggTextNode;
  // statistics: { ... } // We'll parse this separately if needed
  link?: BggLinkNode[]; // For categories, mechanics, designers, publishers, etc.
  // Add other fields as needed from the Thing API response
}

// Interface for the overall Thing API response
export interface BggThingResponse {
  items: {
    _attributes: {
      termsofuse: string;
    };
    item: BggThingItem | BggThingItem[]; // Can be single item or array of items
  };
}

// Simplified interface for parsed game details
export interface BoardGameDetails {
  id: string;
  type: string;
  name: string;
  description: string;
  yearPublished: string;
  minPlayers: number;
  maxPlayers: number;
  playingTime: number;
  minPlaytime: number;
  maxPlaytime: number;
  minAge: number;
  imageUrl: string;
  thumbnailUrl: string;
  categories: { id: string; name: string }[];
  mechanics: { id: string; name: string }[];
  designers: { id: string; name: string }[];
  publishers: { id: string; name: string }[];
  rating: number; // Average rating
  recommendedPlayers: string; // e.g., "2-4 players (Best with 3)"
  // Add other parsed details as needed (e.g., weight)
}
