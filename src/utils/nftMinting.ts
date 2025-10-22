import html2canvas from 'html2canvas';
import { NFT } from '@/types/nftTypes';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Pinata configuration - using API keys instead of JWT
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || '';
const PINATA_GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/';

// Debug logging
if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  console.warn('⚠️ Pinata API keys not found in environment variables');
  console.log('Required: NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY');
} else {
  console.log('✅ Pinata API keys found');
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface MintingResult {
  success: boolean;
  tokenId?: string;
  contractAddress?: string;
  imageUrl?: string;
  metadataUrl?: string;
  error?: string;
}

/**
 * Generate an image from PixelPreview component data
 */
export const generateImageFromPixelData = async (
  colorMap: any[],
  backgroundColor: string = '#000',
  size: number = 512
): Promise<string> => {
  console.log('🔄 Generating image from pixel data...');
  console.log('ColorMap length:', colorMap?.length || 0);
  console.log('ColorMap sample:', colorMap?.slice(0, 5));
  console.log('Background color:', backgroundColor);
  
  // Create a temporary canvas element
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);

  if (!colorMap || colorMap.length === 0) {
    console.log('⚠️ No colorMap data, returning background only');
    return canvas.toDataURL('image/png');
  }

  // Debug: Log the structure of the first few items
  console.log('🔍 Analyzing colorMap structure...');
  colorMap.slice(0, 3).forEach((item, index) => {
    console.log(`Item ${index}:`, {
      keys: Object.keys(item),
      noteIndex: item.noteIndex,
      time: item.time,
      color: item.color,
      type: typeof item
    });
  });

  // Try different data structure interpretations
  let validPixels: any[] = [];
  
  // Method 1: Direct pixel objects
  validPixels = colorMap.filter(pixel => 
    pixel && 
    typeof pixel.noteIndex === 'number' && 
    typeof pixel.time === 'number' && 
    typeof pixel.color === 'string' &&
    pixel.color.length > 0
  );

  console.log('✅ Method 1 (direct pixels):', validPixels.length);

  // Method 2: If no valid pixels, try to convert from other formats
  if (validPixels.length === 0) {
    console.log('🔄 Trying alternative data structure...');
    
    // Check if it's an array of arrays
    if (Array.isArray(colorMap[0])) {
      console.log('📊 Detected array format, converting...');
      validPixels = colorMap.map((item, index) => {
        if (Array.isArray(item) && item.length >= 3) {
          return {
            noteIndex: item[0],
            time: item[1], 
            color: item[2]
          };
        }
        return null;
      }).filter(Boolean);
    }
    
    // Check if it's an object with different key names
    else if (typeof colorMap[0] === 'object') {
      console.log('📊 Detected object format, checking keys...');
      const firstItem = colorMap[0];
      const keys = Object.keys(firstItem);
      console.log('Available keys:', keys);
      
      // Try common variations
      validPixels = colorMap.map(item => {
        const noteKey = keys.find(k => k.toLowerCase().includes('note') || k.toLowerCase().includes('pitch'));
        const timeKey = keys.find(k => k.toLowerCase().includes('time') || k.toLowerCase().includes('step'));
        const colorKey = keys.find(k => k.toLowerCase().includes('color') || k.toLowerCase().includes('rgb'));
        
        if (noteKey && timeKey && colorKey) {
          return {
            noteIndex: item[noteKey],
            time: item[timeKey],
            color: item[colorKey]
          };
        }
        return null;
      }).filter(Boolean);
    }
  }

  console.log('✅ Final valid pixels:', validPixels.length);

  if (validPixels.length === 0) {
    console.log('⚠️ No valid pixels found in any format');
    // Create a test pattern to verify canvas is working
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(50, 50, 100, 100);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(200, 50, 100, 100);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(50, 200, 100, 100);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(200, 200, 100, 100);
    console.log('🎨 Created test pattern instead');
    return canvas.toDataURL('image/png');
  }

  // Calculate dimensions
  const maxTime = Math.max(...validPixels.map(p => p.time));
  const minNote = Math.min(...validPixels.map(p => p.noteIndex));
  const maxNote = Math.max(...validPixels.map(p => p.noteIndex));
  const noteRange = maxNote - minNote + 1;

  const rows = noteRange <= 12 ? 12 : 24;
  const cols = maxTime + 1;
  const scaleX = cols > rows ? rows / cols : 1;

  console.log('📐 Dimensions:', { 
    rows, 
    cols, 
    noteRange, 
    scaleX, 
    maxTime, 
    minNote, 
    maxNote 
  });

  // Calculate pixel size
  const pixelWidth = size / cols;
  const pixelHeight = size / rows;

  console.log('📏 Pixel size:', { pixelWidth, pixelHeight });

  // Draw pixels
  let pixelsDrawn = 0;
  validPixels.forEach(({ noteIndex, time, color }) => {
    const x = time * pixelWidth;
    const y = (noteIndex - minNote) * pixelHeight;
    
    // Ensure color is valid
    if (color && color.length > 0) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, pixelWidth * scaleX, pixelHeight);
      pixelsDrawn++;
    }
  });

  console.log('✅ Pixels drawn:', pixelsDrawn);
  console.log('🎨 Image generated successfully');

  return canvas.toDataURL('image/png');
};

/**
 * Alternative image generation method using html2canvas
 * This method captures the actual PixelPreview component
 */
export const generateImageFromComponent = async (
  elementId: string,
  backgroundColor: string = '#000',
  size: number = 512
): Promise<string> => {
  try {
    console.log('🔄 Generating image from component...');
    console.log('Looking for element:', elementId);
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.log('❌ Element not found, searching for alternatives...');
      
      // Try to find any pixel preview element
      const pixelPreviews = document.querySelectorAll('[id*="pixel-preview"]');
      console.log('Found pixel preview elements:', pixelPreviews.length);
      
      if (pixelPreviews.length > 0) {
        const firstPreview = pixelPreviews[0] as HTMLElement;
        console.log('Using first available preview:', firstPreview.id);
        return await captureElement(firstPreview, backgroundColor, size);
      }
      
      throw new Error(`Element with id "${elementId}" not found`);
    }

    return await captureElement(element, backgroundColor, size);
  } catch (error) {
    console.error('Error generating image from component:', error);
    throw new Error(`Failed to generate image from component: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

async function captureElement(element: HTMLElement, backgroundColor: string, size: number): Promise<string> {
  console.log('📸 Capturing element:', element);
  
  // Use html2canvas to capture the component
  const canvas = await html2canvas(element, {
    backgroundColor: backgroundColor,
    width: size,
    height: size,
    scale: 2, // Higher scale for better quality
    useCORS: true,
    allowTaint: true,
    logging: true, // Enable logging to see what's happening
    onclone: (clonedDoc) => {
      console.log('📋 Cloned document, checking for pixel elements...');
      const pixelElements = clonedDoc.querySelectorAll('.pixel-note');
      console.log('Found pixel elements in clone:', pixelElements.length);
    }
  });

  console.log('✅ Image generated from component');
  return canvas.toDataURL('image/png');
}

/**
 * Upload image to IPFS via Pinata API
 */
export const uploadImageToIPFS = async (imageDataUrl: string, filename: string): Promise<string> => {
  try {
    // Check if Pinata API keys are configured
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API keys not configured. Please add NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY to your environment variables.');
    }

    console.log('🔄 Uploading image to IPFS via Pinata...');
    
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    // Create FormData for Pinata API
    const formData = new FormData();
    formData.append('file', blob, filename);
    
    // Upload to Pinata using their API with API key authentication
    const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Pinata API Error:', uploadResponse.status, errorText);
      throw new Error(`Pinata upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const result = await uploadResponse.json();
    console.log('✅ Image uploaded to IPFS:', result.IpfsHash);
    return `${PINATA_GATEWAY_URL}${result.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw new Error(`Failed to upload image to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload metadata to IPFS via Pinata API
 */
export const uploadMetadataToIPFS = async (metadata: NFTMetadata): Promise<string> => {
  try {
    // Check if Pinata API keys are configured
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API keys not configured. Please add NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY to your environment variables.');
    }

    console.log('🔄 Uploading metadata to IPFS via Pinata...');
    
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    
    const formData = new FormData();
    formData.append('file', metadataBlob, 'metadata.json');
    
    const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Pinata API Error:', uploadResponse.status, errorText);
      throw new Error(`Pinata upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const result = await uploadResponse.json();
    console.log('✅ Metadata uploaded to IPFS:', result.IpfsHash);
    return `${PINATA_GATEWAY_URL}${result.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Create NFT metadata from NFT data
 */
export const createNFTMetadata = (
  nft: NFT,
  imageUrl: string,
  baseUrl: string = 'https://blockbeats-tau.vercel.app'
): NFTMetadata => {
  const attributes = [
    {
      trait_type: 'Machine Type',
      value: nft.machineType || 'drawing'
    },
    {
      trait_type: 'Tempo',
      value: nft.tempo || 300
    },
    {
      trait_type: 'Format',
      value: nft.isOldFormat ? 'Classic' : 'Modern'
    }
  ];

  if (nft.isCollaborative) {
    attributes.push({
      trait_type: 'Collaborative',
      value: 'Yes'
    });
    attributes.push({
      trait_type: 'Authors',
      value: nft.authors?.length || 0
    });
  }

  if (nft.tags && nft.tags.length > 0) {
    attributes.push({
      trait_type: 'Tags',
      value: nft.tags.join(', ')
    });
  }

  return {
    name: nft.songName || 'Untitled Musical NFT',
    description: nft.description || `A unique musical creation made with BlockBeats ${nft.machineType || 'drawing'} machine.`,
    image: imageUrl,
    attributes,
    external_url: `${baseUrl}/marketplace`,
    animation_url: `${baseUrl}/api/nft/${nft.id}` // Optional: for interactive NFT
  };
};

/**
 * Check if user can mint this NFT (only creator can mint)
 */
export const canUserMintNFT = (nft: NFT, userAddress: string): boolean => {
  if (!userAddress) return false;
  
  // Check if user is the creator
  if (nft.createdBy === userAddress) return true;
  
  // Check if user is one of the collaborative authors
  if (nft.isCollaborative && nft.authors) {
    return nft.authors.some(author => author.uid === userAddress);
  }
  
  return false;
};

/**
 * Get OpenSea URL for minted NFT
 */
export const getOpenSeaUrl = (contractAddress: string, tokenId: string, network: string = 'starknet'): string => {
  // For Starknet, we'll use the Starknet mainnet OpenSea
  const baseUrl = 'https://opensea.io/assets/starknet';
  return `${baseUrl}/${contractAddress}/${tokenId}`;
};

/**
 * Complete NFT minting process
 */
export const mintNFT = async (
  nft: NFT,
  userAddress: string,
  contractAddress: string
): Promise<MintingResult> => {
  try {
    // Check if user can mint
    if (!canUserMintNFT(nft, userAddress)) {
      return {
        success: false,
        error: 'You can only mint NFTs that you created'
      };
    }

    // Generate image from pixel data
    console.log('🔄 Starting image generation...');
    console.log('NFT data:', {
      id: nft.id,
      colorMapLength: nft.colorMap?.length || 0,
      colorMapSample: nft.colorMap?.slice(0, 2),
      backgroundColor: nft.color || '#000'
    });

    let imageDataUrl: string;
    
    try {
      // Try the pixel data method first
      imageDataUrl = await generateImageFromPixelData(
        nft.colorMap || [],
        nft.color || '#000',
        512
      );
      console.log('✅ Image generated from pixel data');
    } catch (error) {
      console.warn('⚠️ Pixel data method failed, trying component method:', error);
      
      // Fallback: try to capture the actual PixelPreview component
      try {
        // Look for a PixelPreview component with this NFT's data
        const pixelPreviewId = `pixel-preview-${nft.id}`;
        imageDataUrl = await generateImageFromComponent(
          pixelPreviewId,
          nft.color || '#000',
          512
        );
        console.log('✅ Image generated from component');
      } catch (componentError) {
        console.error('❌ Both image generation methods failed:', componentError);
        
        // Last resort: create a simple colored square
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = nft.color || '#000';
          ctx.fillRect(0, 0, 512, 512);
          
          // Add some text
          ctx.fillStyle = '#ffffff';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(nft.songName || 'Musical NFT', 256, 256);
        }
        
        imageDataUrl = canvas.toDataURL('image/png');
        console.log('✅ Fallback image created');
      }
    }

    // Upload image to IPFS
    const imageUrl = await uploadImageToIPFS(
      imageDataUrl,
      `nft-${nft.id}-image.png`
    );

    // Create metadata
    const metadata = createNFTMetadata(nft, imageUrl);

    // Upload metadata to IPFS
    const metadataUrl = await uploadMetadataToIPFS(metadata);

    // TODO: Implement actual Starknet contract interaction
    // This would involve calling the mint function on your deployed contract
    // For now, we'll simulate the minting process
    
    console.log('NFT Minting Process:', {
      nftId: nft.id,
      imageUrl,
      metadataUrl,
      contractAddress,
      userAddress
    });

    // Simulate token ID generation
    const tokenId = Math.floor(Math.random() * 1000000).toString();

    // Update the NFT in Firestore with minting information
    try {
      const nftRef = doc(db, 'signatures', nft.id);
      await updateDoc(nftRef, {
        tokenId,
        contractAddress,
        isMinted: true,
        mintedAt: new Date().toISOString(),
        mintedBy: userAddress,
        ipfsImageUrl: imageUrl,
        ipfsMetadataUrl: metadataUrl
      });
    } catch (error) {
      console.error('Error updating NFT in database:', error);
      // Continue with the minting process even if database update fails
    }

    return {
      success: true,
      tokenId,
      contractAddress,
      imageUrl,
      metadataUrl
    };

  } catch (error) {
    console.error('Error minting NFT:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};