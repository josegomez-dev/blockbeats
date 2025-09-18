import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

const LEVEL_XP_THRESHOLD = 100;

class XPService {
  private static instance: XPService;
  private xpCallbacks: ((xp: number, level: number) => void)[] = [];

  static getInstance(): XPService {
    if (!XPService.instance) {
      XPService.instance = new XPService();
    }
    return XPService.instance;
  }

  // Subscribe to XP updates
  subscribeToXPUpdates(callback: (xp: number, level: number) => void) {
    this.xpCallbacks.push(callback);
    return () => {
      this.xpCallbacks = this.xpCallbacks.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers of XP changes
  private notifyXPUpdate(totalXP: number) {
    const level = Math.floor(totalXP / LEVEL_XP_THRESHOLD) + 1;
    const currentXP = totalXP % LEVEL_XP_THRESHOLD;
    this.xpCallbacks.forEach(callback => callback(currentXP, level));
  }

  // Award XP for music machine usage
  async awardMusicMachineXP(userId: string, xpAmount: number = 5): Promise<void> {
    try {
      const userRef = doc(db, 'userProgress', userId);
      const userSnap = await getDoc(userRef);
      
      let newTotalXP: number;
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        newTotalXP = (currentData.totalXP || 0) + xpAmount;
        
        await updateDoc(userRef, {
          totalXP: newTotalXP,
          lastUpdated: new Date().toISOString(),
          musicMachineUsage: (currentData.musicMachineUsage || 0) + 1
        });
      } else {
        newTotalXP = xpAmount;
        await setDoc(userRef, {
          totalXP: newTotalXP,
          level: 1,
          phase: 1,
          lastUpdated: new Date().toISOString(),
          musicMachineUsage: 1
        });
      }
      
      this.notifyXPUpdate(newTotalXP);
      toast.success(`🎵 +${xpAmount} XP for using music machine!`);
    } catch (error) {
      console.error('Error awarding music machine XP:', error);
    }
  }

  // Award XP for time spent
  async awardTimeXP(userId: string, minutes: number): Promise<void> {
    try {
      const xpAmount = minutes * 1; // 1 XP per minute
      const userRef = doc(db, 'userProgress', userId);
      const userSnap = await getDoc(userRef);
      
      let newTotalXP: number;
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        newTotalXP = (currentData.totalXP || 0) + xpAmount;
        
        await updateDoc(userRef, {
          totalXP: newTotalXP,
          lastUpdated: new Date().toISOString()
        });
      } else {
        newTotalXP = xpAmount;
        await setDoc(userRef, {
          totalXP: newTotalXP,
          level: 1,
          phase: 1,
          lastUpdated: new Date().toISOString(),
          musicMachineUsage: 0
        });
      }
      
      this.notifyXPUpdate(newTotalXP);
    } catch (error) {
      console.error('Error awarding time XP:', error);
    }
  }

  // Award custom XP with reason
  async awardCustomXP(userId: string, xpAmount: number, reason: string): Promise<void> {
    try {
      const userRef = doc(db, 'userProgress', userId);
      const userSnap = await getDoc(userRef);
      
      let newTotalXP: number;
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        newTotalXP = (currentData.totalXP || 0) + xpAmount;
        
        await updateDoc(userRef, {
          totalXP: newTotalXP,
          lastUpdated: new Date().toISOString()
        });
      } else {
        newTotalXP = xpAmount;
        await setDoc(userRef, {
          totalXP: newTotalXP,
          level: 1,
          phase: 1,
          lastUpdated: new Date().toISOString(),
          musicMachineUsage: 0
        });
      }
      
      this.notifyXPUpdate(newTotalXP);
      toast.success(`🎉 +${xpAmount} XP for ${reason}!`);
    } catch (error) {
      console.error('Error awarding custom XP:', error);
    }
  }

  // Load user's XP data
  async loadUserXPData(userId: string): Promise<{ xp: number; level: number; phase: number }> {
    try {
      const userRef = doc(db, 'userProgress', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        const totalXP = data.totalXP || 0;
        const level = Math.floor(totalXP / LEVEL_XP_THRESHOLD) + 1;
        const phase = Math.min(level, 6); // MAX_PHASE = 6
        const currentXP = totalXP % LEVEL_XP_THRESHOLD;
        
        return { xp: currentXP, level, phase };
      }
      
      return { xp: 0, level: 1, phase: 1 };
    } catch (error) {
      console.error('Error loading user XP data:', error);
      return { xp: 0, level: 1, phase: 1 };
    }
  }
}

export const xpService = XPService.getInstance();
