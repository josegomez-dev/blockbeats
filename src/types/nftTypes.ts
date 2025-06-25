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