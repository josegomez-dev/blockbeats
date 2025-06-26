'use client';

import React, { use, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import GalleryHeader from '@/components/GalleryHeader';
import { NFT } from '@/types/nftTypes';
import NeonSlider from '@/components/NeonSlider';
import Image from 'next/image';
import NFTSliderPanel from '@/components/NFTSliderPanel';

const CollectionsScreen = () => {
    const [userNFTS, setUserNFTS] = React.useState<NFT[]>([]);
    const [nfts, setNfts] = React.useState<NFT[]>([]);
    const [topCollections, setTopCollections] = React.useState<any[]>([]); //
    const { user } = useAuth();

    useEffect(() => {
        const fetchTopColletions = async () => {
            const querySnapshot = await getDocs(collection(db, "topCollections"));
            const collections = querySnapshot.docs.map((doc) => ({ ...(doc.data() as any), id: doc.id })) as any[];
            setTopCollections(collections.slice(0, 10));
        };
        const fetchNFTs = async () => {
            const querySnapshot = await getDocs(collection(db, "signatures"));
            const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
            // Filter NFTs created by the current user
            setNfts(nfts);
            setUserNFTS(nfts.filter(item => item.createdBy === user?.uid));
        };
        fetchNFTs();
        fetchTopColletions();
    }, [user]);

    return (
        <div className='gallery-screen'>
            <GalleryHeader title="My Gallery" />
            <div className='test-creations-bg'>
                <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
                    <br />
                    <br />
                    <br />
                    <br />
                    <h2><span className='glitch'>My Gallery</span></h2>
                    <p>Here you can view all the NFTs you have created.</p>
                    <br />
                    <br />
                    <a href="/dashboard" className={styles.submitBtn}>Create New NFT</a>
                    <br />
                </div>
            </div>

            <div style={{ width: '100%', marginTop: '-50px' }}>
                {userNFTS.length > 0 ? (
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
                        }))}/> 
                    ) : (
                    <div className={styles.modalContent}>
                        <br />
                        <br />
                        <br />
                        <br />
                        <h2>No NFTs Found</h2>
                        <p>You haven't created any NFTs yet. <br /> Start creating your own unique NFTs today!</p>
                        <br />
                        <br />
                        <a href="/dashboard" className={styles.submitBtn}>Create NFT</a>
                        <br />
                        <br />
                        <br />
                    </div>
                )}
                <hr />

            </div>
        </div>
    );
};

export default CollectionsScreen;
