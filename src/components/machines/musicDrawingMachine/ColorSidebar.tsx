'use client';

import React from 'react';
import styles from '@/app/assets/styles/pages/MusicStudio.module.css';

interface ColorSidebarProps {
  isOpen: boolean;
  selectedColor: string;
  onClose: () => void;
  onColorSelect: (color: string) => void;
}

const ColorSidebar: React.FC<ColorSidebarProps> = ({
  isOpen,
  selectedColor,
  onClose,
  onColorSelect
}) => {
  if (!isOpen) return null;

  // Predefined color palette
  const colorPalette = [
    { name: 'White', value: '#ffffff', icon: '⚪' },
    { name: 'Black', value: '#000000', icon: '⚫' },
    { name: 'Red', value: '#ff0000', icon: '🔴' },
    { name: 'Green', value: '#00ff00', icon: '🟢' },
    { name: 'Blue', value: '#0000ff', icon: '🔵' },
    { name: 'Yellow', value: '#ffff00', icon: '🟡' },
    { name: 'Orange', value: '#ff8000', icon: '🟠' },
    { name: 'Purple', value: '#8000ff', icon: '🟣' },
    { name: 'Pink', value: '#ff0080', icon: '🩷' },
    { name: 'Cyan', value: '#00ffff', icon: '🔷' },
    { name: 'Lime', value: '#80ff00', icon: '🟢' },
    { name: 'Magenta', value: '#ff00ff', icon: '🟣' },
  ];

  return (
    <>
      {/* Backdrop Overlay */}
      <div className={styles.sidebarBackdrop} onClick={onClose} />

      {/* Collapsible Color Sidebar */}
      <div className={`${styles.colorSidebar} ${styles.sidebarOpen}`}>
        <div className={styles.sidebarHeader}>
          <h3>🎨 Color Palette</h3>
          <button className={styles.closeSidebar} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.sidebarContent}>
          <div className={styles.currentColorSection}>
            <h4>Current Color</h4>
            <div 
              className={styles.currentColorDisplay}
              style={{ backgroundColor: selectedColor }}
            >
              <span className={styles.colorHex}>{selectedColor}</span>
            </div>
          </div>

          <div className={styles.colorPaletteSection}>
            <h4>Quick Colors</h4>
            <div className={styles.colorGrid}>
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  className={`${styles.colorButton} ${selectedColor === color.value ? styles.selectedColor : ''}`}
                  onClick={() => onColorSelect(color.value)}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  <span className={styles.colorIcon}>{color.icon}</span>
                  <span className={styles.colorName}>{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.customColorSection}>
            <h4>Custom Color</h4>
            <div className={styles.customColorPicker}>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onColorSelect(e.target.value)}
                className={styles.colorInput}
              />
              <span className={styles.customColorLabel}>Pick any color</span>
            </div>
          </div>

          <div className={styles.colorInstructions}>
            <h4>Instructions</h4>
            <ul>
              <li>Click any color to select it</li>
              <li>Use the color picker for custom colors</li>
              <li>Draw on the canvas to create musical art</li>
              <li>Each pixel represents a musical note</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ColorSidebar;
