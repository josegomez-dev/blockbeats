'use client';

import React, { useState, useEffect } from 'react';
import { FaSave, FaDownload, FaUpload, FaTrash, FaPlay, FaStop, FaTimes } from 'react-icons/fa';
import { 
  saveSong, 
  loadSong, 
  getSavedSongs, 
  deleteSong, 
  exportSong, 
  importSong,
  SongData 
} from '@/utils/helpers/songStorage';
import styles from '@/app/assets/styles/components/SongManagerModal.module.css';

interface SongManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSong: (songData: SongData) => void;
  currentSongData?: SongData;
}

const SongManagerModal: React.FC<SongManagerModalProps> = ({
  isOpen,
  onClose,
  onLoadSong,
  currentSongData
}) => {
  const [savedSongs, setSavedSongs] = useState(getSavedSongs());
  const [songName, setSongName] = useState('');
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSavedSongs(getSavedSongs());
    }
  }, [isOpen]);

  const handleSaveSong = () => {
    if (!songName.trim() || !currentSongData) {
      alert('Please enter a song name and make sure you have data to save');
      return;
    }

    const songData: SongData = {
      ...currentSongData,
      id: currentSongData.id || `song_${Date.now()}`,
      name: songName.trim(),
      updatedAt: new Date()
    };

    saveSong(songData);
    setSavedSongs(getSavedSongs());
    setSongName('');
    alert('Song saved successfully!');
  };

  const handleLoadSong = (songId: string) => {
    const songData = loadSong(songId);
    if (songData) {
      onLoadSong(songData);
      setSelectedSong(songId);
    }
  };

  const handleDeleteSong = (songId: string, songName: string) => {
    if (confirm(`Are you sure you want to delete "${songName}"?`)) {
      deleteSong(songId);
      setSavedSongs(getSavedSongs());
      if (selectedSong === songId) {
        setSelectedSong(null);
      }
    }
  };

  const handleExportSong = (songId: string) => {
    const songData = loadSong(songId);
    if (songData) {
      const exportData = exportSong(songData);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${songData.name}.blockbeats.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportSong = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const songData = importSong(jsonString);
        
        if (songData) {
          saveSong(songData);
          setSavedSongs(getSavedSongs());
          alert('Song imported successfully!');
        } else {
          alert('Failed to import song. Invalid format.');
        }
      } catch (error) {
        alert('Failed to import song. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handlePlaySong = (songId: string) => {
    setIsPlaying(true);
    setPlayingSongId(songId);
    
    // Simulate playing (you can integrate with actual playback here)
    setTimeout(() => {
      setIsPlaying(false);
      setPlayingSongId(null);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>🎵 Song Manager</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Save Current Song */}
          <div className={styles.saveSection}>
            <h3 className={styles.sectionTitle}>Save Current Song</h3>
            <div className={styles.saveForm}>
              <input
                type="text"
                placeholder="Enter song name..."
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                className={styles.songNameInput}
              />
              <button 
                onClick={handleSaveSong}
                className={styles.saveButton}
                disabled={!songName.trim() || !currentSongData}
              >
                <FaSave /> Save Song
              </button>
            </div>
          </div>

          {/* Import/Export */}
          <div className={styles.importExportSection}>
            <h3 className={styles.sectionTitle}>Import/Export</h3>
            <div className={styles.importExportButtons}>
              <label className={styles.importButton}>
                <FaUpload /> Import Song
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSong}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Saved Songs */}
          <div className={styles.savedSongsSection}>
            <h3 className={styles.sectionTitle}>Saved Songs ({savedSongs.length})</h3>
            <div className={styles.songsList}>
              {savedSongs.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No saved songs yet. Create your first masterpiece!</p>
                </div>
              ) : (
                savedSongs.map((song) => (
                  <div 
                    key={song.id} 
                    className={`${styles.songItem} ${selectedSong === song.id ? styles.selected : ''}`}
                  >
                    <div className={styles.songInfo}>
                      <h4 className={styles.songName}>{song.name}</h4>
                      <p className={styles.songMeta}>
                        Created: {new Date(song.createdAt).toLocaleDateString()}
                        {song.data.drawingMachine?.notesPlayed.length ? 
                          ` • ${song.data.drawingMachine.notesPlayed.length} melody notes` : 
                          ''
                        }
                        {song.data.drumMachine?.grid.length ? 
                          ` • ${song.data.drumMachine.grid.length} drum tracks` : 
                          ''
                        }
                        • {song.data.tempo} BPM • {song.data.steps} steps
                      </p>
                    </div>
                    
                    <div className={styles.songActions}>
                      <button
                        onClick={() => handlePlaySong(song.id)}
                        className={styles.playButton}
                        disabled={isPlaying}
                      >
                        {playingSongId === song.id ? <FaStop /> : <FaPlay />}
                      </button>
                      
                      <button
                        onClick={() => handleLoadSong(song.id)}
                        className={styles.loadButton}
                      >
                        Load
                      </button>
                      
                      <button
                        onClick={() => handleExportSong(song.id)}
                        className={styles.exportButton}
                      >
                        <FaDownload />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSong(song.id, song.name)}
                        className={styles.deleteButton}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongManagerModal;

