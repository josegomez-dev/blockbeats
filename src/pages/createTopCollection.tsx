'use client';
import React, { useEffect } from 'react';
import styles from '@/app/assets/styles/MainPage.module.css';
import PixelPreview from '@/components/PixelPreview';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '@/context/AuthContext';
import { FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Footer from '@/components/Footer';

interface NFT {
  colorMap?: any[];
  notesPlayed?: any[];
  songName?: string;
  createdBy?: string;
  id?: string;
}

const CreateTopFanCollectionModal = () => {

  const [collectionName, setCollectionName] = React.useState('');
  const [collectionDescription, setCollectionDescription] = React.useState('');
  const [nfts, setNFTs] = React.useState<NFT[]>([]);
  const [selectedNFTS, setSelectedNFTS] = React.useState<NFT[]>([]);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      // setNFTs(nfts.filter(item => item.createdBy === user.uid));
      setNFTs(nfts);
     
    };
    fetchNFTs();
  }, []);

  const createTopCollection = async () => {
    if (selectedNFTS.length === 0) {
      alert('Please select at least one NFT to create a collection.');
      return;
    }

    if (selectedNFTS.length > 5) {
      alert('You can only select up to 5 NFTs for your collection.');
      return;
    }

    // create item to add to collections collection of firebase using TopCollections type
    const collectionData = {
      createdBy: user?.uid,
      collectionName: collectionName || 'My Top Fan Collection',
      collectionDescription: collectionDescription || 'This is my unique Top Fan Collection.',
      nfts: selectedNFTS.map(nft => nft.id),
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "topCollections"), collectionData);

    // Reset selected NFTs after creation
    setSelectedNFTS([]);
    toast.success('Top Fan Collection created successfully!');
    router.push('/gallery'); 
  };

  const selectNft = (nft: NFT) => {
    if (selectedNFTS.some(item => item.id === nft.id)) {
      setSelectedNFTS(selectedNFTS.filter(item => item.id !== nft.id));
    } else {
      setSelectedNFTS([...selectedNFTS, nft]);
    }

    console.log('Selected NFTs:', selectedNFTS);
  };

  return (
    <>
      <div style={{ padding: '20px', width: '100%', textAlign: 'center' }}>
        <br />
        <button
          className={styles.submitBtn}
          style={{ width: '200px', animation: 'none', marginBottom: '20px' }}
          onClick={() => router.back()}
        >
          Back to Gallery
        </button>
        <br />
        <h2>Create Top Fan Collection</h2>
        <br />
        <p>Here you can create your own unique Top Fan Collection.</p>
        <p>Choose a name for your collection and add a description.</p>
        <br />
        <form style={{ width: '100%', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="Collection Name"
            className={styles.emailInput}
            style={{ width: '100%' }}
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <br />
          <br />
          <textarea
            placeholder="Collection Description"
            className={styles.emailInput}
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
          />
          <br />
        </form>

        <br />
        <p>Choose NFTs you want to add to your collection.</p>
        <div style={{ width: '100%', margin: '0 auto' }} className={styles.nftSelection}>
          {nfts.length > 0 ? (
            nfts.map((nft, index) => (
              <div key={index} className={styles.nftCard}>
                <div
                  style={{
                    padding: '10px',
                    margin: '0 auto'
                  }}
                >
                  <button
                    onClick={() => selectNft(nft)}
                    style={{
                      width: '40px',
                      borderRadius: 4,
                      background: selectedNFTS.some(item => item.id === nft.id)
                        ? 'var(--neon-color)'
                        : 'transparent',
                      color: selectedNFTS.some(item => item.id === nft.id)
                        ? 'var(--secondary-color)'
                        : 'var(--neon-color)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {selectedNFTS.some(item => item.id === nft.id) ? (
                      <FaCheck />
                    ) : (
                      <span style={{ color: 'var(--neon-color)' }}>+</span>
                    )}
                  </button>
                </div>
                <PixelPreview
                  colorMap={nft.colorMap || []}
                  notesCount={nft.notesPlayed ? nft.notesPlayed.length : 0}
                  size={100}
                />
                <h6
                  style={{
                    textAlign: 'center',
                    overflowX: 'auto',
                    width: '80%',
                    margin: '0 auto',
                  }}
                >
                  {nft.songName || 'Untitled'}
                </h6>
              </div>
            ))
          ) : (
            <p>No NFTs available to create a collection.</p>
          )}
        </div>

        <br />
        <button
          className={styles.submitBtn}
          style={{ width: '200px', animation: 'none' }}
          onClick={createTopCollection}
        >
          Create Collection
        </button>
        
        <br />
        <br />
        <p>Once you create a collection, it will be available in the Top Fans section.</p>
        <p>Note: You can only create one Top Fan Collection.</p>
        <br />
        <br />
      </div>
      <Footer />
    </>
  );
};

export default CreateTopFanCollectionModal;
