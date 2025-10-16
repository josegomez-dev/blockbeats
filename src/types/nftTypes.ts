export interface NFTData {
    songName: string;
    notesPlayed: string[]; // or a more specific type if available
    colorMap: Record<string, string>; // or a more specific type if available
    frequencyRange: [number, number]; // or a more specific type if available
    color: string; // Save the color based on frequency
    tempo: number; // Save the current tempo
    createdAt: Date;
    createdBy: string;
    id: string; // Unique identifier for the NFT
    metadata?: Record<string, any>; // Optional metadata for the NFT
}

export const EMPTY_NFT: NFTData = {
    songName: '',
    notesPlayed: [],
    colorMap: {},
    frequencyRange: [0, 0],
    color: '',
    tempo: 0,
    createdAt: new Date(),
    createdBy: '',
    id: '',
    metadata: {},
};

export interface Author {
    uid: string;
    displayName: string;
    robotName: string;
    robotPhase: number;
    avatar?: string;
}

export type NFT = {
    id: string;
    createdBy?: string;
    songName?: string;
    colorMap?: any[];
    notesPlayed?: any[];
    createdAt?: string; // or Date, depending on your data structure
    tempo?: number; // default tempo or use nft.tempo if available
    color?: string; // background or frequency color
    machineType?: 'drawing' | 'drums' | 'voicemusic' | 'launchpad'; // Machine type
    authors?: Author[]; // For collaborative songs
    isCollaborative?: boolean; // Whether this is a multi-author song
    description?: string; // Optional description
    tags?: string[]; // Optional tags for categorization
    isOldFormat?: boolean; // Whether this is an old format NFT
    drawingMachine?: any; // New format drawing machine data
    drumMachine?: any; // New format drum machine data
};