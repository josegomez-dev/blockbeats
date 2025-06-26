'use client';

import React, { useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import GalleryHeader from '@/components/GalleryHeader';
import { NFT } from '@/types/nftTypes';
import NeonSlider from '@/components/NeonSlider';

const CollectionsScreen = () => {
    const [userNFTS, setUserNFTS] = React.useState<NFT[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchNFTs = async () => {
            const querySnapshot = await getDocs(collection(db, "signatures"));
            const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
            // Filter NFTs created by the current user
            setUserNFTS(nfts.filter(item => item.createdBy === user?.uid));
        };
        fetchNFTs();
    }, [user]);

    return (
        <>
        <div className="gallery-screen">
            <GalleryHeader title="My Creations" />

            <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
                <h2>All Creations</h2>                 
                <p>Here you can view all the NFTs you have created.</p>
                <div style={{ marginTop: '-50px', width: '100%' }}>
                    <NeonSlider
                        slides={userNFTS.map(nft => ({
                            id: nft.id,
                            songName: nft.songName || '',
                            colorMap: nft.colorMap || [],
                            notesPlayed: nft.notesPlayed || [],
                            createdBy: nft.createdBy || '',
                            createdAt: new Date().toISOString(), // or use nft.createdAt if available
                            tempo: nft.tempo, // default tempo or use nft.tempo if available
                            color: nft.color || '#000000', // default background color if not present
                        }))}
                    />
                </div>
            </div>

            
            <div className={styles.footer} style={{ textAlign: 'center', padding: '25px' }}>
                <p>Explore the top collections created by our community.</p>
                <p>Start creating your own unique NFTs today!</p>
            </div>

        </div>
        </>
    );
};

export default CollectionsScreen;
