// Script to update Firebase collections with category and type properties
// Run this script to add the new properties to existing collections

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

// Function to determine category and type based on collection name/description
function categorizeCollection(collection) {
  const name = collection.collectionName.toLowerCase();
  const description = collection.collectionDescription.toLowerCase();
  const text = `${name} ${description}`;

  // Specific type mappings
  if (text.includes('pokemon')) {
    return { category: 'gaming', type: 'pokemon' };
  }
  if (text.includes('mario')) {
    return { category: 'gaming', type: 'mario' };
  }
  if (text.includes('dbz') || text.includes('dragon ball')) {
    return { category: 'anime', type: 'dbz' };
  }
  if (text.includes('snoop') || text.includes('dogg')) {
    return { category: 'artists', type: 'snoop-dogg' };
  }

  // General category mappings
  if (text.includes('game') || text.includes('gaming') || text.includes('soundtrack') || text.includes('level')) {
    return { category: 'gaming', type: 'general' };
  }
  if (text.includes('anime') || text.includes('manga') || text.includes('japanese')) {
    return { category: 'anime', type: 'general' };
  }
  if (text.includes('artist') || text.includes('band') || text.includes('musician') || text.includes('singer')) {
    return { category: 'artists', type: 'general' };
  }
  if (text.includes('sound') || text.includes('effect') || text.includes('sfx') || text.includes('audio')) {
    return { category: 'soundfx', type: 'general' };
  }
  if (text.includes('premium') || text.includes('exclusive') || text.includes('vip') || text.includes('pro')) {
    return { category: 'premium', type: 'general' };
  }
  if (text.includes('ambient') || text.includes('chill') || text.includes('relax') || text.includes('meditation')) {
    return { category: 'ambient', type: 'general' };
  }
  if (text.includes('electronic') || text.includes('synth') || text.includes('techno') || text.includes('edm')) {
    return { category: 'electronic', type: 'general' };
  }
  if (text.includes('retro') || text.includes('vintage') || text.includes('classic') || text.includes('nostalgic')) {
    return { category: 'retro', type: 'general' };
  }
  if (text.includes('nature') || text.includes('forest') || text.includes('ocean') || text.includes('rain')) {
    return { category: 'nature', type: 'general' };
  }
  if (text.includes('experimental') || text.includes('avant') || text.includes('abstract') || text.includes('weird')) {
    return { category: 'experimental', type: 'general' };
  }
  
  return { category: 'all', type: 'custom' };
}

async function updateCollections() {
  try {
    console.log('Starting collection updates...');
    
    // Get all collections
    const collectionsRef = collection(db, 'topCollections');
    const snapshot = await getDocs(collectionsRef);
    
    console.log(`Found ${snapshot.size} collections to update`);
    
    const updatePromises = [];
    
    snapshot.forEach((docSnapshot) => {
      const collectionData = docSnapshot.data();
      const { category, type } = categorizeCollection(collectionData);
      
      // Only update if category or type is missing
      if (!collectionData.category || !collectionData.type) {
        const updateData = {
          category,
          type,
          featured: collectionData.featured || false,
          updatedAt: new Date()
        };
        
        console.log(`Updating collection "${collectionData.collectionName}" with category: ${category}, type: ${type}`);
        
        updatePromises.push(
          updateDoc(doc(db, 'topCollections', docSnapshot.id), updateData)
        );
      } else {
        console.log(`Collection "${collectionData.collectionName}" already has category and type`);
      }
    });
    
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Successfully updated ${updatePromises.length} collections`);
    } else {
      console.log('No collections needed updating');
    }
    
    console.log('Collection updates completed!');
    
  } catch (error) {
    console.error('Error updating collections:', error);
  }
}

// Run the update
updateCollections();
