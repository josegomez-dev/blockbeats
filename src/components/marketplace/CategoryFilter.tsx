'use client';

import React from 'react';
import { FaMusic, FaDrum, FaMicrophone, FaSquare, FaBuilding, FaRocket } from 'react-icons/fa';
import styles from './CategoryFilter.module.css';

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode | null;
  description: string;
  color: string;
  specialStyle?: boolean;
}

const categories: Category[] = [
  {
    id: 'all',
    name: 'All NFTs',
    icon: <FaMusic />,
    description: 'All musical creations',
    color: '#00ffc3'
  },
  {
    id: 'drawing',
    name: 'Music Drawing',
    icon: <FaSquare />,
    description: 'Pixel-art melodies',
    color: '#ff6b6b'
  },
  {
    id: 'drums',
    name: 'Drum Patterns',
    icon: <FaDrum />,
    description: 'Custom drum sequences',
    color: '#4ecdc4'
  },
  {
    id: 'voicemusic',
    name: 'Voice Music',
    icon: <FaMicrophone />,
    description: 'AI-generated melodies',
    color: '#45b7d1'
  },
  {
    id: 'collaborative',
    name: 'Collaborative',
    icon: <FaMusic />,
    description: 'Multi-author songs',
    color: '#f9ca24'
  },
  {
    id: 'classic',
    name: 'Classic NFTs',
    icon: null,
    description: 'Original format NFTs',
    color: '#ff9800',
    specialStyle: true
  },
  {
    id: 'modern',
    name: 'Modern NFTs',
    icon: null,
    description: 'New format NFTs',
    color: '#00ff88',
    specialStyle: true
  }
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  nftCounts?: Record<string, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange,
  nftCounts = {}
}) => {
  return (
    <div className={styles.categoryFilter}>
      <h3 className={styles.filterTitle}>Categories</h3>
      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${
              selectedCategory === category.id ? styles.active : ''
            } ${category.specialStyle ? styles.specialStyle : ''}`}
            onClick={() => onCategoryChange(category.id)}
            style={{
              '--category-color': category.color
            } as React.CSSProperties}
            data-category-color={category.color}
          >
            {category.specialStyle ? (
              <>
                <div className={styles.specialIcon}>
                  <div 
                    className={styles.colorCircle}
                    style={{ backgroundColor: category.color }}
                  />
                </div>
                <div className={styles.categoryInfo}>
                  <div className={styles.categoryName}>
                    {category.name}
                  </div>
                  <div className={styles.categoryDescription}>
                    {category.description}
                  </div>
                </div>
                {nftCounts[category.id] !== undefined && (
                  <div 
                    className={styles.specialCount}
                    style={{ backgroundColor: category.color }}
                  >
                    {nftCounts[category.id]}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.categoryIcon}>
                  {category.icon}
                </div>
                <div className={styles.categoryInfo}>
                  <div className={styles.categoryName}>
                    {category.name}
                  </div>
                  <div className={styles.categoryDescription}>
                    {category.description}
                  </div>
                  {nftCounts[category.id] !== undefined && (
                    <div className={styles.categoryCount}>
                      {nftCounts[category.id]} NFTs
                    </div>
                  )}
                </div>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
