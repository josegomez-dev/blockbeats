'use client';

import React from 'react';
import styles from '@/app/assets/styles/components/DrumDesigner.module.css';
import { DRUM_SOUNDS } from '../../../utils/constants/drumMachine';

interface DrumGridProps {
  grid: boolean[][];
  selectedSounds: string[];
  currentStep: number;
  steps: number;
  selectedRowForSound: number | null;
  expandedDropdown: number | null;
  timeSignature: { beats: number; noteValue: number };
  onToggleCell: (row: number, step: number) => void;
  onSelectRowForSound: (rowIndex: number) => void;
  onExpandDropdown: (rowIndex: number | null) => void;
  onSelectSound: (rowIndex: number, soundName: string) => void;
  onAddRow: () => void;
}

const DrumGrid: React.FC<DrumGridProps> = ({
  grid,
  selectedSounds,
  currentStep,
  steps,
  selectedRowForSound,
  expandedDropdown,
  timeSignature,
  onToggleCell,
  onSelectRowForSound,
  onExpandDropdown,
  onSelectSound,
  onAddRow
}) => {
  return (
    <div className={styles.grid}>
      {/* Measure markers row */}
      <div className={styles.measureRow}>
        <div className={styles.measureLabel}>&nbsp;</div>
        {Array(steps).fill(null).map((_, stepIndex) => {
          // Calculate how many steps make up one measure
          const stepsPerMeasure = timeSignature.beats;
          const isMeasureStart = stepIndex % stepsPerMeasure === 0;
          const measureNumber = Math.floor(stepIndex / stepsPerMeasure) + 1;
          
          return (
            <div
              key={stepIndex}
              className={`${styles.measureMarker} ${isMeasureStart ? styles.measureStart : ''}`}
            >
              {isMeasureStart ? measureNumber : ''}
            </div>
          );
        })}
      </div>
      
      {grid.map((row, rowIndex) => {
        const currentSound = DRUM_SOUNDS.find((s) => s.name === selectedSounds[rowIndex]);

        return (
          <div key={rowIndex} className={styles.row}>
            <div
              className={`${styles.instrumentDropdown} ${selectedRowForSound === rowIndex ? styles.selectedForSound : ''}`}
              onClick={() => onSelectRowForSound(rowIndex)}
              title={selectedRowForSound === rowIndex ? "Click to cancel sound selection" : "Click to select sound from sidebar"}
            >
              <span className={styles.iconOnly}>
                {currentSound?.icon}
              </span>
              {selectedRowForSound === rowIndex && (
                <div className={styles.selectionIndicator}>
                  <span>Select from sidebar →</span>
                </div>
              )}
              {expandedDropdown === rowIndex && (
                <div className={styles.dropdownMenu}>
                  {DRUM_SOUNDS.map((sound) => (
                    <div
                      key={sound.name}
                      className={styles.dropdownItem}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSound(rowIndex, sound.name);
                      }}
                    >
                      <span>{sound.icon}</span> <span>{sound.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {row.map((cell, stepIndex) => (
              <div
                key={stepIndex}
                className={`${styles.cell} ${cell ? styles.active : ''} ${
                  stepIndex === currentStep ? styles.playing : ''
                }`}
                onClick={(e) => {
                  console.log('🔥 DRUM CELL CLICKED!', { rowIndex, stepIndex, cell });
                  console.log('Event target:', e.target);
                  console.log('Event currentTarget:', e.currentTarget);
                  onToggleCell(rowIndex, stepIndex);
                }}
              />
            ))}
          </div>
        );
      })}

      {/* PREMIUM ROW SLOT */}
      {grid.length < 7 && (
        <div className={`${styles.row} ${styles.lockedRow}`}>
          <div className={styles.lockedSelector}>
            🔓 <span>Extra Slot</span>
          </div>
          {Array(steps)
            .fill(null)
            .map((_, i) => (
              <div key={i} className={styles.cellDisabled} />
            ))}
          <button className={styles.unlockButton} onClick={onAddRow}>
            ➕ Unlock Row
          </button>
        </div>
      )}

      {grid.length >= 7 && (
        <div className={`${styles.row} ${styles.lockedRow}`}>
          <div className={styles.lockedSelector}>
            🔒 <span>Premium Only</span>
          </div>
          {Array(steps)
            .fill(null)
            .map((_, i) => (
              <div key={i} className={styles.cellDisabled} />
            ))}
          <button
            className={styles.unlockButton}
            onClick={() =>
              alert('🚀 Premium required! Unlock advanced features and unlimited instruments.')
            }
          >
            🪙 Go Premium
          </button>
        </div>
      )}
    </div>
  );
};

export default DrumGrid;
