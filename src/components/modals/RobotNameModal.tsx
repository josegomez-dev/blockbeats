'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { xpService } from '../../utils/xpService';
import toast from 'react-hot-toast';
import styles from './RobotNameModal.module.css';

interface RobotNameModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentName?: string;
  onNameUpdated?: (newName: string) => void;
}

const RobotNameModal: React.FC<RobotNameModalProps> = ({ 
  isVisible, 
  onClose, 
  currentName = 'BEATO',
  onNameUpdated
}) => {
  const { user, setUser } = useAuth();
  const [robotName, setRobotName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced robot name generators - creative futuristic combinations
  const robotNames = [
    // Tech + Music Fusion
    'CYBERBEAT', 'NEONWAVE', 'QUANTUMSYNTH', 'DIGITALHARMONY', 'PIXELRHYTHM', 'BYTEMELODY',
    'CODESOUND', 'DATATONE', 'SYNTHPULSE', 'WAVEFREQ', 'BEATBYTE', 'RHYTHMCODE',
    'SOUNDPIXEL', 'AUDIOCYBER', 'MUSICQUANTUM', 'MELODYDIGITAL', 'HARMONYSYNTH', 'CHORDWAVE',
    'NOTEBEAT', 'TONERHYTHM', 'BASSWAVE', 'TREBLEPULSE', 'VOLUMEFREQ', 'PITCHSYNTH',
    'TEMPOCYBER', 'GROOVEDIGITAL', 'VIBEQUANTUM', 'FLOWPIXEL', 'PULSEBYTE', 'FREQCODE',
    
    // Robot + Power Fusion
    'BOTMASTER', 'ROBOTLORD', 'AUTOMATONKING', 'ANDROIDQUEEN', 'CYBORGWARRIOR', 'MACHINEGUARDIAN',
    'UNITKNIGHT', 'BOTWIZARD', 'ROBOTMAGE', 'AUTOMATONSAGE', 'ANDROIDORACLE', 'CYBORGGENIUS',
    'MACHINEPRODIGY', 'UNITLEGEND', 'BOTHERO', 'ROBOTCHAMPION', 'AUTOMATONSTAR', 'ANDROIDNOVA',
    'CYBORGPHOENIX', 'MACHINEDRAGON', 'UNITTIGER', 'BOTLION', 'ROBOTEAGLE', 'AUTOMATONFALCON',
    
    // Futuristic + Element Fusion
    'CYBERCRYSTAL', 'NEONPLASMA', 'QUANTUMFIELD', 'DIGITALMATRIX', 'PIXELNEXUS', 'BYTECORE',
    'CODEVECTOR', 'DATANODE', 'SYNTHGRID', 'WAVEMATRIX', 'BEATCORE', 'RHYTHMGRID',
    'SOUNDNEXUS', 'AUDIOFIELD', 'MUSICPLASMA', 'MELODYCRYSTAL', 'HARMONYMATRIX', 'CHORDNODE',
    'NOTEVECTOR', 'TONECORE', 'BASSGRID', 'TREBLENEXUS', 'VOLUMEFIELD', 'PITCHPLASMA',
    
    // Space + Tech Fusion
    'COSMICBYTE', 'GALACTICCODE', 'STELLARDATA', 'LUNARSYNTH', 'SOLARWAVE', 'NEBULABEAT',
    'ORBITRHYTHM', 'VOIDSOUND', 'STARFIELD', 'PLANETPULSE', 'MOONFREQ', 'SUNSYNTH',
    'ASTEROIDWAVE', 'COMETBEAT', 'METEORRHYTHM', 'BLACKHOLESOUND', 'WHITEHOLEPULSE', 'GALAXYFREQ',
    
    // Energy + Music Fusion
    'ELECTRICBEAT', 'MAGNETICWAVE', 'PLASMASYNTH', 'IONICRHYTHM', 'ATOMICSOUND', 'NUCLEARPULSE',
    'RADIANTBEAT', 'LUMINOUSWAVE', 'PHOTONICSYNTH', 'ENERGETICRHYTHM', 'DYNAMICSOUND', 'KINETICPULSE',
    'THERMALBEAT', 'SOLARWAVE', 'WINDENERGY', 'HYDROELECTRIC', 'GEOTHERMAL', 'BIOMASSIC',
    
    // Cool Robot-Specific Names
    'BEATO', 'BEATZ', 'BEATRON', 'BEATRIX', 'BEATOSPHERE', 'BEATOMATRIX', 'BEATOSYNTH',
    'BEATOCORE', 'BEATOGENESIS', 'BEATOPHONIC', 'BEATOVIBE', 'BEATOPULSE', 'BEATOWAVE',
    'BEATOSPHERE', 'BEATOMATRIX', 'BEATOSYNTH', 'BEATOCORE', 'BEATOGENESIS', 'BEATOPHONIC',
    
    // Futuristic Single Words
    'NEXUS', 'VECTOR', 'MATRIX', 'NODE', 'CORE', 'GRID', 'FIELD', 'SPHERE', 'CUBE', 'PYRAMID',
    'HEXAGON', 'OCTAGON', 'TETRAHEDRON', 'DODECAHEDRON', 'ICOSAHEDRON', 'TORUS', 'SPIRAL',
    'HELIX', 'FIBONACCI', 'GOLDENRATIO', 'PHI', 'PI', 'EULER', 'GAUSS', 'NEWTON', 'EINSTEIN',
    
    // Cool Tech Combinations
    'CYBERSPHERE', 'NEONMATRIX', 'QUANTUMNODE', 'DIGITALCORE', 'PIXELGRID', 'BYTEFIELD',
    'CODEVECTOR', 'DATANEXUS', 'SYNTHSPHERE', 'WAVEMATRIX', 'BEATNODE', 'RHYTHMCORE',
    'SOUNDGRID', 'AUDIOFIELD', 'MUSICVECTOR', 'MELODYNEXUS', 'HARMONYSPHERE', 'CHORDMATRIX',
    
    // Power + Tech
    'SUPERCYBER', 'MEGANEON', 'ULTRAQUANTUM', 'HYPERDIGITAL', 'MAXPIXEL', 'TURBOBYTE',
    'POWERCODE', 'FORCEDATA', 'ENERGYSYNTH', 'STRENGTHWAVE', 'MIGHTYBEAT', 'POWERFULRHYTHM',
    'SUPERBSOUND', 'MAGNIFICAUDIO', 'SPECTACULARMUSIC', 'PHENOMENALMELODY', 'INCREDIBLEHARMONY',
    
    // Mystical + Tech
    'MYSTICCYBER', 'MAGICALNEON', 'ENCHANTEDQUANTUM', 'SPELLBOUNDDIGITAL', 'MYSTICALPIXEL',
    'MAGICALBYTE', 'ENCHANTEDCODE', 'SPELLBOUNDDATA', 'MYSTICALSYNTH', 'MAGICALWAVE',
    'ENCHANTEDBEAT', 'SPELLBOUNDRHYTHM', 'MYSTICALSOUND', 'MAGICALAUDIO', 'ENCHANTEDMUSIC'
  ];

  useEffect(() => {
    if (isVisible) {
      setRobotName(currentName);
    }
  }, [isVisible, currentName]);

  const generateRandomName = () => {
    // 70% chance to use predefined names, 30% chance to generate creative combination
    const usePredefined = Math.random() < 0.7;
    
    if (usePredefined) {
      const randomName = robotNames[Math.floor(Math.random() * robotNames.length)];
      setRobotName(randomName);
    } else {
      // Generate creative combination
      const prefixes = [
        'CYBER', 'NEON', 'QUANTUM', 'DIGITAL', 'PIXEL', 'BYTE', 'CODE', 'DATA',
        'SYNTH', 'WAVE', 'BEAT', 'RHYTHM', 'SOUND', 'AUDIO', 'MUSIC', 'MELODY',
        'ELECTRIC', 'MAGNETIC', 'PLASMA', 'IONIC', 'ATOMIC', 'NUCLEAR', 'RADIANT',
        'COSMIC', 'GALACTIC', 'STELLAR', 'LUNAR', 'SOLAR', 'NEBULA', 'ORBIT',
        'SUPER', 'MEGA', 'ULTRA', 'HYPER', 'MAX', 'TURBO', 'POWER', 'FORCE',
        'MYSTIC', 'MAGICAL', 'ENCHANTED', 'SPELLBOUND', 'MYSTICAL', 'MAGICAL'
      ];
      
      const suffixes = [
        'BOT', 'ROBOT', 'AUTOMATON', 'ANDROID', 'CYBORG', 'MACHINE', 'UNIT',
        'MASTER', 'LORD', 'KING', 'QUEEN', 'WARRIOR', 'GUARDIAN', 'KNIGHT',
        'WIZARD', 'MAGE', 'SAGE', 'ORACLE', 'GENIUS', 'PRODIGY', 'LEGEND',
        'HERO', 'CHAMPION', 'STAR', 'NOVA', 'PHOENIX', 'DRAGON', 'TIGER',
        'SPHERE', 'MATRIX', 'NODE', 'CORE', 'GRID', 'FIELD', 'VECTOR',
        'NEXUS', 'CRYSTAL', 'PLASMA', 'FREQUENCY', 'AMPLITUDE', 'WAVELENGTH',
        'BEAT', 'RHYTHM', 'HARMONY', 'MELODY', 'SYNTH', 'WAVE', 'PULSE',
        'BEATRON', 'BEATRIX', 'BEATOSPHERE', 'BEATOMATRIX', 'BEATOSYNTH'
      ];
      
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      
      // Create combination (avoid duplicates)
      let combination = prefix + suffix;
      
      // If combination is too long, try a shorter version
      if (combination.length > 20) {
        const shortPrefixes = ['CYBER', 'NEON', 'QUANTUM', 'DIGITAL', 'PIXEL', 'BYTE', 'SYNTH', 'WAVE', 'BEAT'];
        const shortSuffixes = ['BOT', 'CORE', 'NODE', 'GRID', 'FIELD', 'SPHERE', 'MATRIX', 'VECTOR', 'NEXUS'];
        const shortPrefix = shortPrefixes[Math.floor(Math.random() * shortPrefixes.length)];
        const shortSuffix = shortSuffixes[Math.floor(Math.random() * shortSuffixes.length)];
        combination = shortPrefix + shortSuffix;
      }
      
      setRobotName(combination);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) {
      toast.error('User not authenticated');
      return;
    }

    if (!robotName.trim()) {
      toast.error('DESIGNATION REQUIRED');
      return;
    }

    if (robotName.trim().length > 20) {
      toast.error('DESIGNATION TOO LONG (MAX 20 CHARACTERS)');
      return;
    }

    try {
      setIsLoading(true);
      await xpService.updateRobotName(user.uid, robotName.trim());
      
      // Update the AuthContext user object
      if (user) {
        setUser({
          ...user,
          robotName: robotName.trim()
        });
      }
      
      toast.success(`🤖 ROBOT DESIGNATION ASSIGNED: "${robotName.trim()}"!`);
      onNameUpdated?.(robotName.trim());
      onClose();
    } catch (error) {
      console.error('Error updating robot name:', error);
      toast.error('DESIGNATION UPDATE FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>🤖 ROBOT DESIGNATION</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.inputSection}>
            <label className={styles.inputLabel}>
              ROBOT DESIGNATION
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={robotName}
                onChange={(e) => setRobotName(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className={styles.nameInput}
                placeholder="ENTER ROBOT NAME..."
                maxLength={20}
                disabled={isLoading}
                style={{ 
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                  fontWeight: 'bold'
                }}
              />
              <button
                onClick={generateRandomName}
                className={styles.randomButton}
                disabled={isLoading}
                title="Generate creative robot designation"
              >
                🎲
              </button>
            </div>
            <p className={styles.characterCount}>
              {robotName.length}/20 characters
            </p>
          </div>

        </div>

        <div className={styles.modalFooter}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={isLoading || !robotName.trim()}
          >
            {isLoading ? 'PROCESSING...' : 'ASSIGN DESIGNATION'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RobotNameModal;
