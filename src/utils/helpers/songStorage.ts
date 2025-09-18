// Song storage utilities for localStorage
export interface SongData {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  tempo: number;
  steps: number;
  volume: number;
  
  // Music Drawing Machine data
  drawingMachine?: {
    notesPlayed: { noteIndex: number; time: number }[];
    colorMap: { noteIndex: number; time: number; color: string }[];
    selectedRange: string;
    isDrumEnabled: boolean;
  };
  
  // Drum Designer data
  drumMachine?: {
    grid: boolean[][];
    selectedSounds: string[];
    currentStep: number;
  };
}

export interface MachineData {
  id: string;
  name: string;
  machineType: 'drawing' | 'drums';
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedSong {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: Omit<SongData, 'id' | 'createdAt' | 'updatedAt'>;
}

const STORAGE_KEY = 'blockbeats_songs';
const MACHINE_STORAGE_KEY = 'blockbeats_machines';

export const saveSong = (songData: SongData): void => {
  try {
    if (typeof window === 'undefined') return;
    const savedSongs = getSavedSongs();
    
    const songToSave: SavedSong = {
      id: songData.id,
      name: songData.name,
      createdAt: songData.createdAt.toISOString(),
      updatedAt: songData.updatedAt.toISOString(),
      data: {
        name: songData.name,
        tempo: songData.tempo,
        steps: songData.steps,
        volume: songData.volume,
        drawingMachine: songData.drawingMachine,
        drumMachine: songData.drumMachine,
      }
    };

    const existingIndex = savedSongs.findIndex(song => song.id === songData.id);
    
    if (existingIndex >= 0) {
      savedSongs[existingIndex] = songToSave;
    } else {
      savedSongs.push(songToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSongs));
    console.log('🎵 Song saved:', songData.name);
  } catch (error) {
    console.error('Failed to save song:', error);
  }
};

export const loadSong = (songId: string): SongData | null => {
  try {
    const savedSongs = getSavedSongs();
    const savedSong = savedSongs.find(song => song.id === songId);
    
    if (!savedSong) {
      console.warn('Song not found:', songId);
      return null;
    }

    return {
      id: savedSong.id,
      createdAt: new Date(savedSong.createdAt),
      updatedAt: new Date(savedSong.updatedAt),
      ...savedSong.data
    };
  } catch (error) {
    console.error('Failed to load song:', error);
    return null;
  }
};

export const getSavedSongs = (): SavedSong[] => {
  try {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get saved songs:', error);
    return [];
  }
};

export const deleteSong = (songId: string): void => {
  try {
    if (typeof window === 'undefined') return;
    const savedSongs = getSavedSongs();
    const filteredSongs = savedSongs.filter(song => song.id !== songId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSongs));
    console.log('🎵 Song deleted:', songId);
  } catch (error) {
    console.error('Failed to delete song:', error);
  }
};

export const exportSong = (songData: SongData): string => {
  const exportData = {
    name: songData.name,
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: songData
  };
  
  return JSON.stringify(exportData, null, 2);
};

export const importSong = (jsonString: string): SongData | null => {
  try {
    const importData = JSON.parse(jsonString);
    
    if (!importData.data || !importData.name) {
      throw new Error('Invalid song format');
    }
    
    return {
      ...importData.data,
      id: `imported_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Failed to import song:', error);
    return null;
  }
};

// Machine-specific storage functions
export const saveMachineData = (machineData: MachineData): void => {
  try {
    const savedMachines = getSavedMachines();
    
    const machineToSave = {
      ...machineData,
      createdAt: machineData.createdAt.toISOString(),
      updatedAt: machineData.updatedAt.toISOString(),
    };

    const existingIndex = savedMachines.findIndex(machine => machine.id === machineData.id);
    
    if (existingIndex >= 0) {
      savedMachines[existingIndex] = machineToSave;
    } else {
      savedMachines.push(machineToSave);
    }

    localStorage.setItem(MACHINE_STORAGE_KEY, JSON.stringify(savedMachines));
    console.log('🎵 Machine data saved:', machineData.name);
  } catch (error) {
    console.error('Failed to save machine data:', error);
  }
};

export const loadMachineData = (machineId: string): MachineData | null => {
  try {
    const savedMachines = getSavedMachines();
    const savedMachine = savedMachines.find(machine => machine.id === machineId);
    
    if (!savedMachine) {
      console.warn('Machine data not found:', machineId);
      return null;
    }

    return {
      ...savedMachine,
      createdAt: new Date(savedMachine.createdAt),
      updatedAt: new Date(savedMachine.updatedAt)
    };
  } catch (error) {
    console.error('Failed to load machine data:', error);
    return null;
  }
};

export const getSavedMachines = (): any[] => {
  try {
    const stored = localStorage.getItem(MACHINE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get saved machines:', error);
    return [];
  }
};

export const deleteMachineData = (machineId: string): void => {
  try {
    const savedMachines = getSavedMachines();
    const filteredMachines = savedMachines.filter(machine => machine.id !== machineId);
    localStorage.setItem(MACHINE_STORAGE_KEY, JSON.stringify(filteredMachines));
    console.log('🎵 Machine data deleted:', machineId);
  } catch (error) {
    console.error('Failed to delete machine data:', error);
  }
};

export const getMachinesByType = (machineType: 'drawing' | 'drums'): any[] => {
  try {
    const savedMachines = getSavedMachines();
    return savedMachines.filter(machine => machine.machineType === machineType);
  } catch (error) {
    console.error('Failed to get machines by type:', error);
    return [];
  }
};
