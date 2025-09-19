'use client';

import React, { useState, useRef } from 'react';
import { FaTimes, FaUpload, FaPlay, FaPause, FaTrash, FaVolumeUp } from 'react-icons/fa';
import styles from '@/app/assets/styles/components/DrumDesigner.module.css';

interface CustomSound {
  id: string;
  name: string;
  file: File;
  url: string;
  duration?: number;
}

interface CustomSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  customSounds: CustomSound[];
  onAddSound: (sound: CustomSound) => void;
  onRemoveSound: (id: string) => void;
  onSelectSound: (sound: CustomSound) => void;
}

const CustomSoundModal: React.FC<CustomSoundModalProps> = ({
  isOpen,
  onClose,
  customSounds,
  onAddSound,
  onRemoveSound,
  onSelectSound,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('audio/')) {
          alert(`File ${file.name} is not an audio file. Please select audio files only.`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        const url = URL.createObjectURL(file);
        const sound: CustomSound = {
          id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          file,
          url,
        };

        // Get duration
        try {
          const audio = new Audio(url);
          await new Promise((resolve, reject) => {
            audio.addEventListener('loadedmetadata', () => {
              sound.duration = audio.duration;
              resolve(sound);
            });
            audio.addEventListener('error', reject);
          });
        } catch (error) {
          console.warn('Could not get duration for', file.name);
        }

        onAddSound(sound);
      }
    } catch (error) {
      console.error('Error uploading sounds:', error);
      alert('Error uploading sounds. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePlaySound = (sound: CustomSound) => {
    // Stop any currently playing sound
    if (playingSound && audioRefs.current[playingSound]) {
      audioRefs.current[playingSound].pause();
      audioRefs.current[playingSound].currentTime = 0;
    }

    if (playingSound === sound.id) {
      setPlayingSound(null);
      return;
    }

    // Create audio element if it doesn't exist
    if (!audioRefs.current[sound.id]) {
      audioRefs.current[sound.id] = new Audio(sound.url);
      audioRefs.current[sound.id].addEventListener('ended', () => {
        setPlayingSound(null);
      });
    }

    audioRefs.current[sound.id].play();
    setPlayingSound(sound.id);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.customSoundModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FaUpload className={styles.titleIcon} />
            Custom Sound Library
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Upload Section */}
          <div className={styles.uploadSection}>
            <div className={styles.uploadArea}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*"
                onChange={handleFileUpload}
                className={styles.fileInput}
                id="sound-upload"
              />
              <label htmlFor="sound-upload" className={styles.uploadLabel}>
                <FaUpload className={styles.uploadIcon} />
                <span className={styles.uploadText}>
                  {isUploading ? 'Uploading...' : 'Upload Audio Files'}
                </span>
                <span className={styles.uploadSubtext}>
                  Drag & drop or click to select (Max 10MB each)
                </span>
              </label>
            </div>
          </div>

          {/* Custom Sounds List */}
          <div className={styles.soundsSection}>
            <h3 className={styles.sectionTitle}>Your Custom Sounds ({customSounds.length})</h3>
            
            {customSounds.length === 0 ? (
              <div className={styles.emptyState}>
                <FaVolumeUp className={styles.emptyIcon} />
                <p>No custom sounds uploaded yet.</p>
                <p>Upload some audio files to get started!</p>
              </div>
            ) : (
              <div className={styles.soundsList}>
                {customSounds.map((sound) => (
                  <div key={sound.id} className={styles.soundItem}>
                    <div className={styles.soundInfo}>
                      <div className={styles.soundName}>{sound.name}</div>
                      <div className={styles.soundDetails}>
                        <span>{formatDuration(sound.duration)}</span>
                        <span>•</span>
                        <span>{formatFileSize(sound.file.size)}</span>
                      </div>
                    </div>
                    
                    <div className={styles.soundActions}>
                      <button
                        className={styles.playButton}
                        onClick={() => handlePlaySound(sound)}
                        title={playingSound === sound.id ? 'Pause' : 'Play'}
                      >
                        {playingSound === sound.id ? <FaPause /> : <FaPlay />}
                      </button>
                      
                      <button
                        className={styles.selectButton}
                        onClick={() => onSelectSound(sound)}
                        title="Use this sound"
                      >
                        Use
                      </button>
                      
                      <button
                        className={styles.deleteButton}
                        onClick={() => onRemoveSound(sound.id)}
                        title="Delete sound"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className={styles.instructionsSection}>
            <h4>Instructions:</h4>
            <ul>
              <li>Upload audio files in common formats (MP3, WAV, OGG, etc.)</li>
              <li>Maximum file size: 10MB per file</li>
              <li>Click "Use" to assign a sound to a drum row</li>
              <li>Custom sounds are stored locally in your browser</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSoundModal;
