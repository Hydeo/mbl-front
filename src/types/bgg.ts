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
    _text: string; // Year published
  };
  image: {
    _text: string; // URL to the main image
  };
  thumbnail: {
    _text: string; // URL to the thumbnail image
  };
  status: {
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
  numplays: {
    _text: string;
  };
  // Add other fields if needed, e.g., stats, comments, etc.
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

// Simplified interface for our app's usage
export interface BoardGame {
  id: string;
  name: string;
  yearPublished: string;
  imageUrl: string;
  thumbnailUrl: string;
  numPlays: number;
}
