import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaEdit, FaTrash, FaEye, FaMusic, FaDrum } from 'react-icons/fa';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '@/context/AuthContext';
import PixelPreview from '../machines/PixelPreview';
import toast from 'react-hot-toast';

interface SavedSong {
  id: string;
  name: string;
  description?: string;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  createdByEmail?: string;
  tempo: number;
  steps: number;
  volume: number;
  machineType: 'drawing' | 'drums';
  drawingMachine?: any;
  drumMachine?: any;
  pixelData?: any[];
  isPublic: boolean;
  tags?: string[];
  likes: number;
  plays: number;
}

interface MyLibraryProps {
  onEditSong?: (song: SavedSong) => void;
  onPlaySong?: (song: SavedSong) => void;
}

const MyLibrary: React.FC<MyLibraryProps> = ({ onEditSong, onPlaySong }) => {
  const { user } = useAuth();
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingSong, setPlayingSong] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'drawing' | 'drums'>('all');

  // Safe JSON parsing function
  const safeJsonParse = (jsonString: any) => {
    try {
      // If it's already an object, return it
      if (typeof jsonString === 'object' && jsonString !== null) {
        return jsonString;
      }
      // If it's a string, try to parse it
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      }
      // If it's anything else, return null
      return null;
    } catch (error) {
      console.warn('Failed to parse JSON:', jsonString, error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserSongs();
    }
  }, [user]);

  const fetchUserSongs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching user songs for user:', user.uid);
      
      const q = query(
        collection(db, 'signatures'),
        where('createdBy', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Found song documents:', querySnapshot.docs.length);
      
      const songs = querySnapshot.docs.map((doc, index) => {
        try {
          const data = doc.data();
          console.log(`Processing song document ${index}:`, doc.id, data);
          
          return {
            id: doc.id,
            ...data,
            // Safely parse JSON strings back to objects
            drawingMachine: data.drawingMachine ? safeJsonParse(data.drawingMachine) : null,
            drumMachine: data.drumMachine ? safeJsonParse(data.drumMachine) : null,
            pixelData: data.pixelData ? safeJsonParse(data.pixelData) : []
          };
        } catch (docError) {
          console.error(`Error processing song document ${doc.id}:`, docError);
          // Return a basic version if parsing fails
          return {
            id: doc.id,
            name: doc.data().name || 'Unknown Song',
            machineType: doc.data().machineType || 'unknown',
            createdAt: doc.data().createdAt,
            updatedAt: doc.data().updatedAt,
            drawingMachine: null,
            drumMachine: null,
            pixelData: []
          };
        }
      }) as SavedSong[];

      console.log('Processed songs:', songs);
      setSavedSongs(songs);
    } catch (error) {
      console.error('Error fetching user songs:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast.error('Failed to load your songs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSong = async (songId: string, songName: string) => {
    if (!confirm(`Are you sure you want to delete "${songName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'signatures', songId));
      setSavedSongs(prev => prev.filter(song => song.id !== songId));
      toast.success('Song deleted successfully');
    } catch (error) {
      console.error('Error deleting song:', error);
      toast.error('Failed to delete song');
    }
  };

  const handlePlayPause = (song: SavedSong) => {
    if (playingSong === song.id) {
      setPlayingSong(null);
    } else {
      setPlayingSong(song.id);
      if (onPlaySong) {
        onPlaySong(song);
      }
    }
  };

  const filteredSongs = savedSongs.filter(song => {
    if (filterType === 'all') return true;
    return song.machineType === filterType;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getMachineIcon = (machineType: string) => {
    switch (machineType) {
      case 'drawing':
        return <FaMusic className="machine-icon drawing" />;
      case 'drums':
        return <FaDrum className="machine-icon drums" />;
      default:
        return <FaMusic className="machine-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="my-library-loading">
        <div className="loading-spinner" />
        <p>Loading your musical creations...</p>
      </div>
    );
  }

  return (
    <div className="my-library">
      <div className="library-header">
        <div className="library-title">
          <h2>🎵 My Musical Library</h2>
          <p>Your saved musical NFTs and creations</p>
        </div>
        
        <div className="library-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          
          <div className="filter-controls">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Machines</option>
              <option value="drawing">Music Drawing</option>
              <option value="drums">Drum Designer</option>
            </select>
          </div>
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="empty-library">
          <div className="empty-icon">🎼</div>
          <h3>No songs found</h3>
          <p>
            {filterType === 'all' 
              ? "You haven't saved any songs yet. Create some music in the studio and save them!"
              : `No ${filterType === 'drawing' ? 'Music Drawing' : 'Drum Designer'} songs found.`
            }
          </p>
        </div>
      ) : (
        <div className={`songs-container ${viewMode}`}>
          {filteredSongs.map((song) => (
            <div key={song.id} className="song-card">
              <div className="song-preview">
                {song.machineType === 'drawing' && song.pixelData && song.pixelData.length > 0 ? (
                  <PixelPreview
                    colorMap={song.pixelData}
                    size={120}
                    backgroundColor="#000"
                  />
                ) : (
                  <div className="drum-pattern-preview">
                    {song.drumMachine?.grid?.slice(0, 4).map((row: boolean[], rowIndex: number) => (
                      <div key={rowIndex} className="drum-preview-row">
                        {row.slice(0, 8).map((beat: boolean, beatIndex: number) => (
                          <div
                            key={beatIndex}
                            className={`drum-preview-beat ${beat ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="song-overlay">
                  <button
                    className="play-button"
                    onClick={() => handlePlayPause(song)}
                    title={playingSong === song.id ? 'Pause' : 'Play'}
                  >
                    {playingSong === song.id ? <FaPause /> : <FaPlay />}
                  </button>
                </div>
              </div>

              <div className="song-info">
                <div className="song-header">
                  <h3 className="song-name">{song.name}</h3>
                  <div className="machine-type">
                    {getMachineIcon(song.machineType)}
                    <span>{song.machineType === 'drawing' ? 'Music Drawing' : 'Drum Designer'}</span>
                  </div>
                </div>

                {song.description && (
                  <p className="song-description">{song.description}</p>
                )}

                <div className="song-meta">
                  <div className="meta-item">
                    <span className="meta-label">Tempo:</span>
                    <span className="meta-value">{song.tempo} BPM</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Steps:</span>
                    <span className="meta-value">{song.steps}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Created:</span>
                    <span className="meta-value">{formatDate(song.createdAt)}</span>
                  </div>
                </div>

                <div className="song-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => onEditSong?.(song)}
                    title="Edit Song"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    className="action-btn view-btn"
                    title="View Details"
                  >
                    <FaEye />
                    View
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteSong(song.id, song.name)}
                    title="Delete Song"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .my-library {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .my-library-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: var(--clr-2);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--clr-2);
          border-top: 3px solid var(--clr-3);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .library-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .library-title h2 {
          color: var(--clr-1);
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 0 10px var(--clr-3);
        }

        .library-title p {
          color: var(--clr-2);
          margin: 0;
          font-size: 1.1rem;
        }

        .library-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .view-toggle {
          display: flex;
          background: var(--clr-2);
          border-radius: 8px;
          padding: 0.25rem;
        }

        .toggle-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          color: var(--clr-2);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .toggle-btn.active {
          background: var(--clr-3);
          color: var(--clr-1);
        }

        .filter-select {
          padding: 0.5rem 1rem;
          background: var(--clr-2);
          border: 1px solid var(--clr-3);
          border-radius: 6px;
          color: var(--clr-1);
          font-size: 0.9rem;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--clr-3);
          box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
        }

        .empty-library {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--clr-2);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-library h3 {
          color: var(--clr-1);
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .songs-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .songs-container.list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .song-card {
          background: linear-gradient(145deg, rgba(26, 26, 46, 0.8), rgba(0, 0, 0, 0.8));
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .song-card:hover {
          transform: translateY(-5px);
          border-color: var(--clr-3);
          box-shadow: 0 10px 25px rgba(0, 255, 255, 0.2);
        }

        .song-preview {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1rem;
          height: 120px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          border: 1px solid rgba(0, 255, 255, 0.1);
        }

        .drum-pattern-preview {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .drum-preview-row {
          display: flex;
          gap: 2px;
        }

        .drum-preview-beat {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .drum-preview-beat.active {
          background: var(--clr-3);
        }

        .song-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 10px;
        }

        .song-card:hover .song-overlay {
          opacity: 1;
        }

        .play-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--clr-3);
          border: none;
          color: var(--clr-1);
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .play-button:hover {
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }

        .song-info {
          color: var(--clr-1);
        }

        .song-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .song-name {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 0;
          color: var(--clr-1);
        }

        .machine-type {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: var(--clr-3);
          background: rgba(0, 255, 255, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          border: 1px solid rgba(0, 255, 255, 0.3);
        }

        .machine-icon {
          font-size: 0.7rem;
        }

        .machine-icon.drawing {
          color: #00ff88;
        }

        .machine-icon.drums {
          color: #ff6b6b;
        }

        .song-description {
          color: var(--clr-2);
          font-size: 0.9rem;
          margin: 0.5rem 0;
          line-height: 1.4;
        }

        .song-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin: 1rem 0;
          font-size: 0.8rem;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .meta-label {
          color: var(--clr-3);
          font-weight: 500;
        }

        .meta-value {
          color: var(--clr-1);
        }

        .song-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .edit-btn {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .edit-btn:hover {
          background: rgba(0, 255, 136, 0.3);
          transform: translateY(-1px);
        }

        .view-btn {
          background: rgba(0, 255, 255, 0.2);
          color: var(--clr-3);
          border: 1px solid rgba(0, 255, 255, 0.3);
        }

        .view-btn:hover {
          background: rgba(0, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .delete-btn {
          background: rgba(255, 107, 107, 0.2);
          color: #ff6b6b;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .delete-btn:hover {
          background: rgba(255, 107, 107, 0.3);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .my-library {
            padding: 1rem;
          }

          .library-header {
            flex-direction: column;
            gap: 1rem;
          }

          .library-controls {
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
          }

          .view-toggle,
          .filter-select {
            width: 100%;
          }

          .songs-container.grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .song-meta {
            gap: 0.5rem;
          }

          .song-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default MyLibrary;
