import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nftId } = req.query;

  if (!nftId) {
    return res.status(400).json({ error: 'NFT ID is required' });
  }

  try {
    // Get the NFT document from Firestore
    const nftRef = doc(db, 'signatures', nftId as string);
    const nftSnap = await getDoc(nftRef);

    if (!nftSnap.exists()) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    const nftData = nftSnap.data();

    // Return the NFT data
    res.status(200).json({
      id: nftSnap.id,
      ...nftData
    });

  } catch (error) {
    console.error('Error fetching NFT:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
