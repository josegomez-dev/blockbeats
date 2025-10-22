// Script to add sample collections with proper categories
// Run this script to add example collections for each category

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample collections data
const sampleCollections = [
  {
    collectionName: "Pokemon Collection",
    collectionDescription: "Iconic Pokemon game soundtracks and battle themes",
    collectionColor: "#FF6B6B",
    color: "#FF6B6B",
    category: "gaming",
    type: "pokemon",
    featured: true,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    collectionName: "Mario Bros Collection",
    collectionDescription: "Classic Super Mario Bros music and sound effects",
    collectionColor: "#4ECDC4",
    color: "#4ECDC4",
    category: "gaming",
    type: "mario",
    featured: true,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    collectionName: "DBZ Collection",
    collectionDescription: "Dragon Ball Z OST Soundtracks Collection",
    collectionColor: "#45B7D1",
    color: "#45B7D1",
    category: "anime",
    type: "dbz",
    featured: true,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    collectionName: "Snoop Dogg Collection",
    collectionDescription: "Classic Snoop Dogg beats and hip-hop tracks",
    collectionColor: "#96CEB4",
    color: "#96CEB4",
    category: "artists",
    type: "snoop-dogg",
    featured: true,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    collectionName: "Retro Gaming Sounds",
    collectionDescription: "Nostalgic 8-bit and 16-bit game sound effects",
    collectionColor: "#FFEAA7",
    color: "#FFEAA7",
    category: "gaming",
    type: "retro",
    featured: false,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    collectionName: "Anime Opening Themes",
    collectionDescription: "Epic anime opening and ending themes",
    collectionColor: "#DDA0DD",
    color: "#DDA0DD",
    category: "anime",
    type: "openings",
    featured: false,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    collectionName: "Hip-Hop Legends",
    collectionDescription: "Classic hip-hop tracks from legendary artists",
    collectionColor: "#98D8C8",
    color: "#98D8C8",
    category: "artists",
    type: "hip-hop",
    featured: false,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    collectionName: "Cinematic Sound Effects",
    collectionDescription: "Professional sound effects for film and media",
    collectionColor: "#F7DC6F",
    color: "#F7DC6F",
    category: "soundfx",
    type: "cinematic",
    featured: false,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    collectionName: "Premium Beats",
    collectionDescription: "High-quality exclusive beats and instrumentals",
    collectionColor: "#BB8FCE",
    color: "#BB8FCE",
    category: "premium",
    type: "beats",
    featured: true,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    collectionName: "Ambient Soundscapes",
    collectionDescription: "Relaxing ambient music and nature sounds",
    collectionColor: "#85C1E9",
    color: "#85C1E9",
    category: "ambient",
    type: "nature",
    featured: false,
    nfts: [],
    createdBy: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function addSampleCollections() {
  try {
    console.log('Adding sample collections...');
    
    const collectionsRef = collection(db, 'topCollections');
    
    for (const collectionData of sampleCollections) {
      try {
        const docRef = await addDoc(collectionsRef, collectionData);
        console.log(`Added collection "${collectionData.collectionName}" with ID: ${docRef.id}`);
      } catch (error) {
        console.error(`Error adding collection "${collectionData.collectionName}":`, error);
      }
    }
    
    console.log('Sample collections added successfully!');
    
  } catch (error) {
    console.error('Error adding sample collections:', error);
  }
}

// Run the script
addSampleCollections();
