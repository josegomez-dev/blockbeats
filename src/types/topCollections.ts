export interface TopCollections {
    id: string;
    collectionName: string;
    collectionDescription: string;
    collectionColor?: string; // Optional, can be used for UI purposes
    createdBy: string; // User ID of the creator
    nfts: string[]; // Array of NFT IDs (changed from nftsList to nfts)
    color: string;
    category: 'gaming' | 'anime' | 'artists' | 'soundfx' | 'premium' | 'ambient' | 'electronic' | 'retro' | 'nature' | 'experimental' | 'all'; // Collection category
    type: string; // Specific type within category (e.g., 'pokemon', 'mario', 'dbz', 'snoop-dogg')
    featured?: boolean; // Whether this collection should be featured
    createdAt: Date;
    updatedAt: Date;
}

export const EMPTY_TOP_COLLECTION: TopCollections = {
    id: '',
    collectionName: 'My Top Fan Collection',
    collectionDescription: 'This is my unique Top Fan Collection.',
    collectionColor: '#000000', // Default color
    createdBy: '',
    nfts: [],
    color: '#000000',
    category: 'all',
    type: 'custom',
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
};