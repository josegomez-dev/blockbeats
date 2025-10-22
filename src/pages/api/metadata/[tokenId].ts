import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tokenId } = req.query;

  if (!tokenId) {
    return res.status(400).json({ error: 'Token ID is required' });
  }

  try {
    // Query the signatures collection to find the NFT by tokenId
    const signaturesRef = collection(db, 'signatures');
    const q = query(signaturesRef, where('tokenId', '==', tokenId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    const nftDoc = querySnapshot.docs[0];
    const nftData = nftDoc.data();

    // Return the NFT data as JSON
    res.status(200).json({
      id: nftDoc.id,
      ...nftData,
      // Add any additional metadata you want to expose
      animation_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blockbeats-tau.vercel.app'}/api/nft/${nftDoc.id}`,
      external_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blockbeats-tau.vercel.app'}/marketplace`
    });

  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
