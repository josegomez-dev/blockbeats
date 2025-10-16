import React, { useState, useEffect, useRef } from 'react';
import { FaSave, FaTimes, FaMusic, FaEye, FaEdit } from 'react-icons/fa';
import PixelPreview from '../machines/PixelPreview';
import { SongData } from '@/utils/helpers/songStorage';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface SaveSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  songData: SongData | null;
  onSaveSuccess?: () => void;
}

const SaveSongModal: React.FC<SaveSongModalProps> = ({
  isOpen,
  onClose,
  songData,
  onSaveSuccess
}) => {
  const { user } = useAuth();
  const [songName, setSongName] = useState('');
  const [songDescription, setSongDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'visual' | 'info'>('visual');
  const songNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSongName('Untitled Song');
      setSongDescription('');
      setPreviewMode('visual');
      
      // Prevent keyboard events from reaching the machine
      const handleKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation();
      };
      
      const handleKeyUp = (e: KeyboardEvent) => {
        e.stopPropagation();
      };
      
      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('keyup', handleKeyUp, true);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('keyup', handleKeyUp, true);
      };
    }
  }, [isOpen]);

  // Auto-focus the song name input when modal opens
  useEffect(() => {
    if (isOpen && songNameInputRef.current) {
      setTimeout(() => {
        songNameInputRef.current?.focus();
        songNameInputRef.current?.select(); // Select all text for easy replacement
      }, 100);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save songs');
      return;
    }

    if (!songName.trim()) {
      toast.error('Please enter a song name');
      return;
    }

    // Validate song data
    if (!songData) {
      toast.error('No song data available to save');
      return;
    }

    if (!user?.uid) {
      toast.error('User authentication required');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Starting save process...');
      console.log('User:', user);
      console.log('Song data:', songData);

      // Prepare the song data for Firebase - simplified to avoid complex object issues
      const songToSave = {
        name: songName.trim(),
        description: songDescription.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        createdByEmail: user.email || '',
        tempo: songData?.tempo || 120,
        steps: songData?.steps || 32,
        volume: songData?.volume || 80,
        machineType: songData?.drawingMachine ? 'drawing' : 'drums',
        // Store machine data as JSON strings to avoid Firebase serialization issues
        drawingMachine: songData?.drawingMachine ? JSON.stringify(songData.drawingMachine) : null,
        drumMachine: songData?.drumMachine ? JSON.stringify(songData.drumMachine) : null,
        // Store pixel data as JSON string
        pixelData: songData?.drawingMachine?.colorMap ? JSON.stringify(songData.drawingMachine.colorMap) : '[]',
        isPublic: false,
        tags: [],
        likes: 0,
        plays: 0
      };

      console.log('Song to save:', songToSave);
      console.log('Firebase db:', db);

      // Save to Firebase signatures collection
      console.log('Attempting to save to Firebase...');
      let docRef;
      
      try {
        docRef = await addDoc(collection(db, 'signatures'), songToSave);
      } catch (firebaseError) {
        console.log('Complex save failed, trying simplified save...', firebaseError);
        
        // Fallback: try with minimal data
        const simplifiedData = {
          name: songName.trim(),
          description: songDescription.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user.uid,
          createdByEmail: user.email || '',
          machineType: songData?.drawingMachine ? 'drawing' : 'drums',
          tempo: songData?.tempo || 120,
          steps: songData?.steps || 32,
          volume: songData?.volume || 80,
          isPublic: false,
          likes: 0,
          plays: 0
        };
        
        docRef = await addDoc(collection(db, 'signatures'), simplifiedData);
      }
      
      console.log('Save successful! Document ID:', docRef.id);
      toast.success(
        <div>
          <div>🎵 Song "{songName}" saved successfully!</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
            Check it out in the <a href="/marketplace" style={{ color: '#00ff88', textDecoration: 'underline' }}>Marketplace</a>!
          </div>
        </div>
      );
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving song:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'unknown',
        stack: error?.stack || 'No stack trace'
      });
      
      // More specific error messages
      let errorMessage = 'Failed to save song. Please try again.';
      if (error?.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication.';
      } else if (error?.code === 'unavailable') {
        errorMessage = 'Firebase is currently unavailable. Please try again later.';
      } else if (error?.code === 'invalid-argument') {
        errorMessage = 'Invalid data provided. Please check your song data.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getPixelPreviewData = () => {
    if (songData?.drawingMachine?.colorMap) {
      return songData.drawingMachine.colorMap;
    }
    return [];
  };

  const hasPixelData = getPixelPreviewData().length > 0;

  if (!isOpen || !songData) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // Prevent closing when clicking outside
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        // Prevent keyboard events from propagating
        e.stopPropagation();
      }}
    >
      <div 
        className="modal-content save-song-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            <FaSave className="modal-icon" />
            Save Your Musical NFT
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Preview Toggle */}
          <div className="preview-toggle">
            <button
              className={`toggle-btn ${previewMode === 'visual' ? 'active' : ''}`}
              onClick={() => setPreviewMode('visual')}
            >
              <FaEye />
              Visual Preview
            </button>
            <button
              className={`toggle-btn ${previewMode === 'info' ? 'active' : ''}`}
              onClick={() => setPreviewMode('info')}
            >
              <FaMusic />
              Song Info
            </button>
          </div>

          {/* Preview Content */}
          <div className="preview-content">
            {previewMode === 'visual' && hasPixelData && (
              <div className="visual-preview">
                <h3>Your Musical NFT Preview</h3>
                <div className="pixel-preview-container">
                  <PixelPreview
                    colorMap={getPixelPreviewData()}
                    size={200}
                    backgroundColor="#000"
                  />
                  <div className="preview-info">
                    <p>This is how your musical NFT will look as pixel art!</p>
                    <p>Each colored pixel represents a musical note in your composition.</p>
                  </div>
                </div>
              </div>
            )}

            {previewMode === 'visual' && !hasPixelData && (
              <div className="visual-preview">
                <h3>Drum Pattern Preview</h3>
                <div className="drum-preview-container">
                  <div className="drum-pattern-visual">
                    {songData?.drumMachine?.grid?.map((row, rowIndex) => (
                      <div key={rowIndex} className="drum-row">
                        {row.map((beat, beatIndex) => (
                          <div
                            key={beatIndex}
                            className={`drum-beat ${beat ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="preview-info">
                    <p>Your drum pattern visualization</p>
                    <p>Active beats are highlighted in the grid.</p>
                  </div>
                </div>
              </div>
            )}

            {previewMode === 'info' && (
              <div className="song-info-preview">
                <h3>Song Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Machine Type:</label>
                    <span>{songData?.drawingMachine ? 'Music Drawing Machine' : 'Drum Designer'}</span>
                  </div>
                  <div className="info-item">
                    <label>Tempo:</label>
                    <span>{songData?.tempo || 120} BPM</span>
                  </div>
                  <div className="info-item">
                    <label>Steps:</label>
                    <span>{songData?.steps || 32}</span>
                  </div>
                  <div className="info-item">
                    <label>Volume:</label>
                    <span>{songData?.volume || 80}%</span>
                  </div>
                  {songData?.drawingMachine && (
                    <div className="info-item">
                      <label>Notes:</label>
                      <span>{songData.drawingMachine.notesPlayed?.length || 0} notes</span>
                    </div>
                  )}
                  {songData?.drumMachine && (
                    <div className="info-item">
                      <label>Instruments:</label>
                      <span>{songData.drumMachine.selectedSounds?.length || 0} tracks</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Song Details Form */}
          <div className="song-form">
            <div className="form-group">
              <label htmlFor="songName">Song Name *</label>
              <input
                ref={songNameInputRef}
                id="songName"
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Enter a name for your song"
                maxLength={50}
                autoComplete="off"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="songDescription">Description</label>
              <textarea
                id="songDescription"
                value={songDescription}
                onChange={(e) => setSongDescription(e.target.value)}
                placeholder="Describe your musical creation..."
                rows={3}
                maxLength={200}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving || !songName.trim()}
          >
            {isSaving ? (
              <>
                <div className="spinner" />
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save as NFT
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .save-song-modal {
          max-width: 600px;
          width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--clr-2);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--clr-1);
          font-size: 1.5rem;
          margin: 0;
        }

        .modal-icon {
          color: var(--clr-3);
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--clr-2);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: var(--clr-2);
          color: var(--clr-1);
        }

        .preview-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          background: var(--clr-2);
          border-radius: 8px;
          padding: 0.25rem;
        }

        .toggle-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
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

        .preview-content {
          margin-bottom: 1.5rem;
        }

        .visual-preview h3,
        .song-info-preview h3 {
          color: var(--clr-1);
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .pixel-preview-container,
        .drum-preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--clr-2);
          border-radius: 12px;
          border: 1px solid var(--clr-3);
        }

        .drum-pattern-visual {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .drum-row {
          display: flex;
          gap: 0.25rem;
        }

        .drum-beat {
          width: 20px;
          height: 20px;
          background: var(--clr-2);
          border: 1px solid var(--clr-3);
          border-radius: 3px;
        }

        .drum-beat.active {
          background: var(--clr-3);
        }

        .preview-info {
          text-align: center;
          color: var(--clr-2);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .song-form {
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--clr-1);
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: var(--clr-2);
          border: 1px solid var(--clr-3);
          border-radius: 6px;
          color: var(--clr-1);
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--clr-3);
          box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item label {
          font-weight: 600;
          color: var(--clr-3);
          font-size: 0.9rem;
        }

        .info-item span {
          color: var(--clr-1);
          font-size: 1rem;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid var(--clr-2);
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--clr-2);
          color: var(--clr-1);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--clr-2);
          opacity: 0.8;
        }

        .btn-primary {
          background: var(--clr-3);
          color: var(--clr-1);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--clr-3);
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .save-song-modal {
            width: 95vw;
            max-height: 95vh;
          }

          .modal-title {
            font-size: 1.2rem;
          }

          .preview-toggle {
            flex-direction: column;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default SaveSongModal;
