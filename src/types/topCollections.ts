export interface TopCollections {
    id: string;
    collectionName: string;
    collectionDescription: string;
    createdBy: string; // User ID of the creator
    nftsList: string[]; // Array of NFT IDs
    color: string;
    createdAt: Date;
    updatedAt: Date;
}

export const EMPTY_TOP_COLLECTION: TopCollections = {
    id: '',
    collectionName: 'My Top Fan Collection',
    collectionDescription: 'This is my unique Top Fan Collection.',
    createdBy: '',
    nftsList: [],
    color: '#000000',
    createdAt: new Date(),
    updatedAt: new Date(),
};