'use client';
import React, { useEffect, useState } from 'react';
import styles from '@/app/assets/styles/layouts/MainPage.module.css';
import createStyles from './createCollections.module.css';
import PixelPreview from '../../components/machines/PixelPreview';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import { FaCheck, FaPlus, FaPalette, FaMusic, FaTag, FaEye, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Footer from '../../components/layout/Footer';
import GalleryHeader from '../../components/layout/GalleryHeader';
import { NFT } from '@/types/nftTypes';
import { TopCollections } from '@/types/topCollections';

const CreateTopFanCollectionModal = () => {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#00ffc3');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [selectedNFTs, setSelectedNFTs] = useState<NFT[]>([]);

  const { user } = useAuth();
  const router = useRouter();

  // Collection categories
  const categories = [
    { id: 'gaming', name: 'Gaming', icon: '🎮', types: ['pokemon', 'mario', 'retro', 'general'] },
    { id: 'anime', name: 'Anime', icon: '🎌', types: ['dbz', 'openings', 'general'] },
    { id: 'artists', name: 'Artists', icon: '🎤', types: ['snoop-dogg', 'hip-hop', 'general'] },
    { id: 'soundfx', name: 'Sound Effects', icon: '🔊', types: ['cinematic', 'general'] },
    { id: 'premium', name: 'Premium', icon: '💎', types: ['beats', 'exclusive'] },
    { id: 'ambient', name: 'Ambient', icon: '🌊', types: ['nature', 'chill'] },
    { id: 'electronic', name: 'Electronic', icon: '⚡', types: ['techno', 'edm'] },
    { id: 'retro', name: 'Retro', icon: '🕹️', types: ['vintage', 'classic'] },
    { id: 'nature', name: 'Nature', icon: '🌿', types: ['forest', 'ocean'] },
    { id: 'experimental', name: 'Experimental', icon: '🧪', types: ['avant-garde', 'abstract'] }
  ];

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'pokemon': 'Pokemon',
      'mario': 'Mario Bros',
      'dbz': 'Dragon Ball Z',
      'snoop-dogg': 'Snoop Dogg',
      'hip-hop': 'Hip-Hop',
      'cinematic': 'Cinematic',
      'beats': 'Beats',
      'nature': 'Nature',
      'techno': 'Techno',
      'edm': 'EDM',
      'vintage': 'Vintage',
      'classic': 'Classic',
      'forest': 'Forest',
      'ocean': 'Ocean',
      'avant-garde': 'Avant-Garde',
      'abstract': 'Abstract',
      'general': 'General',
      'exclusive': 'Exclusive',
      'chill': 'Chill',
      'openings': 'Openings'
    };
    return typeLabels[type] || type;
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      // setNFTs(nfts.filter(item => item.createdBy === user.uid));
      setNFTs(nfts);
     
    };
    fetchNFTs();
  }, []);

  const createTopCollection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!collectionName.trim()) {
      toast.error('Please enter a collection name.');
      return;
    }
    
    if (!selectedCategory) {
      toast.error('Please select a category for your collection.');
      return;
    }
    
    if (selectedNFTs.length === 0) {
      toast.error('Please select at least one NFT to create a collection.');
      return;
    }

    try {
      const collectionData: Partial<TopCollections> = {
        createdBy: user?.uid || '',
        collectionName: collectionName.trim(),
        collectionDescription: collectionDescription.trim() || 'A unique collection created by the community.',
        collectionColor: selectedColor,
        color: selectedColor,
        category: selectedCategory as any,
        type: selectedType || 'custom',
        featured: false,
        nfts: selectedNFTs.map(nft => nft.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, "topCollections"), collectionData);

      // Reset form after creation
      setCollectionName('');
      setCollectionDescription('');
      setSelectedColor('#00ffc3');
      setSelectedCategory('');
      setSelectedType('');
      setSelectedNFTs([]);
      
      toast.success('🎉 Collection created successfully!');
      router.push('/collections'); 
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection. Please try again.');
    }
  };

  const selectNft = (nft: NFT) => {
    if (selectedNFTs.some(item => item.id === nft.id)) {
      setSelectedNFTs(selectedNFTs.filter(item => item.id !== nft.id));
    } else {
      setSelectedNFTs([...selectedNFTs, nft]);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedType(''); // Reset type when category changes
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className={createStyles.createContainer}>
      <div className={createStyles.contentWrapper}>
        {/* Header Section */}
        <div className={createStyles.headerSection}>
          <button 
            className={createStyles.backButton}
            onClick={() => router.push('/collections/')}
          >
            <FaArrowLeft />
            Back to Collections
          </button>
          
          <h1 className={createStyles.mainTitle}>Create Collection</h1>
          <p className={createStyles.subtitle}>
            Design your unique music collection with custom categories, colors, and NFT selections. 
            Share your musical taste with the community!
          </p>
        </div>

        <form onSubmit={createTopCollection}>
          {/* Two Column Layout */}
          <div className={createStyles.twoColumnLayout}>
            {/* Form Section */}
            <div className={createStyles.formSection}>
              <h2 className={createStyles.sectionTitle}>
                <FaMusic className={createStyles.sectionIcon} />
                Collection Details
              </h2>

              {/* Collection Name */}
              <div className={createStyles.formGroup}>
                <label className={createStyles.formLabel}>Collection Name *</label>
                <input
                  type="text"
                  placeholder="Enter a creative name for your collection"
                  className={createStyles.formInput}
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  required
                />
              </div>

              {/* Collection Description */}
              <div className={createStyles.formGroup}>
                <label className={createStyles.formLabel}>Description</label>
                <textarea
                  placeholder="Describe your collection and what makes it special..."
                  className={`${createStyles.formInput} ${createStyles.formTextarea}`}
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                />
              </div>

              {/* Color Selection */}
              <div className={createStyles.formGroup}>
                <label className={createStyles.formLabel}>
                  <FaPalette className={createStyles.sectionIcon} />
                  Collection Color
                </label>
                <div className={createStyles.colorPickerContainer}>
                  <input
                    type="color"
                    className={createStyles.colorPicker}
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  />
                  <div 
                    className={createStyles.colorPreview}
                    style={{ backgroundColor: selectedColor }}
                  >
                    {collectionName || 'Preview'}
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div className={createStyles.formGroup}>
                <label className={createStyles.formLabel}>
                  <FaTag className={createStyles.sectionIcon} />
                  Category *
                </label>
                <div className={createStyles.categoryGrid}>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`${createStyles.categoryOption} ${selectedCategory === category.id ? createStyles.selected : ''}`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <span className={createStyles.categoryIcon}>{category.icon}</span>
                      <span className={createStyles.categoryName}>{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type Selection */}
              {selectedCategoryData && (
                <div className={createStyles.formGroup}>
                  <label className={createStyles.formLabel}>Type</label>
                  <div className={createStyles.categoryGrid}>
                    {selectedCategoryData.types.map((type) => (
                      <div
                        key={type}
                        className={`${createStyles.categoryOption} ${selectedType === type ? createStyles.selected : ''}`}
                        onClick={() => setSelectedType(type)}
                      >
                        <span className={createStyles.categoryName}>{getTypeLabel(type)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className={createStyles.previewSection}>
              <h2 className={createStyles.sectionTitle}>
                <FaEye className={createStyles.sectionIcon} />
                Live Preview
              </h2>

              <div 
                className={createStyles.previewCard}
                style={{ '--selected-color': selectedColor } as React.CSSProperties}
              >
                <h3 className={createStyles.previewTitle}>
                  {collectionName || 'Your Collection Name'}
                </h3>
                <p className={createStyles.previewDescription}>
                  {collectionDescription || 'Add a description to see it here...'}
                </p>
                
                <div className={createStyles.previewStats}>
                  <div className={createStyles.statItem}>
                    <span className={createStyles.statValue}>{selectedNFTs.length}</span>
                    <span className={createStyles.statLabel}>NFTs</span>
                  </div>
                  <div className={createStyles.statItem}>
                    <span className={createStyles.statValue}>
                      {selectedCategoryData?.name || 'Category'}
                    </span>
                    <span className={createStyles.statLabel}>Type</span>
                  </div>
                </div>
              </div>

              <div className={createStyles.actionButtons}>
                <button
                  type="button"
                  className={createStyles.previewButton}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <FaEye />
                  {showPreview ? 'Hide' : 'Show'} NFT Selection
                </button>
              </div>
            </div>
          </div>

          {/* NFT Selection Section */}
          {showPreview && (
            <div className={createStyles.nftSelectionSection}>
              <h2 className={createStyles.sectionTitle}>
                <FaMusic className={createStyles.sectionIcon} />
                Select NFTs ({selectedNFTs.length} selected)
              </h2>
              <p style={{ color: '#cccccc', marginBottom: '2rem' }}>
                Choose the NFTs you want to include in your collection. You can select multiple items.
              </p>

              <div className={createStyles.nftGrid}>
                {nfts.length > 0 ? (
                  nfts.map((nft, index) => (
                    <div 
                      key={nft.id || index} 
                      className={`${createStyles.nftCard} ${selectedNFTs.some(item => item.id === nft.id) ? createStyles.selected : ''}`}
                      onClick={() => selectNft(nft)}
                    >
                      <button
                        className={`${createStyles.selectButton} ${selectedNFTs.some(item => item.id === nft.id) ? createStyles.selected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectNft(nft);
                        }}
                      >
                        {selectedNFTs.some(item => item.id === nft.id) ? (
                          <FaCheck />
                        ) : (
                          <FaPlus />
                        )}
                      </button>
                      
                      <div className={createStyles.nftPreview}>
                        <PixelPreview
                          colorMap={nft.colorMap || []}
                          size={80}
                          backgroundColor={nft.color || '#000000'}
                        />
                      </div>
                      
                      <h4 className={createStyles.nftTitle}>
                        {nft.songName || 'Untitled'}
                      </h4>
                      
                      {nft.machineType && (
                        <div className={createStyles.nftType}>
                          {nft.machineType}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#888888' }}>
                    <FaMusic style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No NFTs Available</h3>
                    <p>Create some NFTs first to add them to your collection.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={createStyles.actionButtons}>
            <button
              type="submit"
              className={createStyles.createButton}
              disabled={!collectionName.trim() || !selectedCategory || selectedNFTs.length === 0}
            >
              <FaPlus />
              Create Collection
            </button>
          </div>
          <br />
          <br />
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateTopFanCollectionModal;