import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

const LEVEL_XP_THRESHOLD = 1000; // 1k XP per level
const MAX_LEVEL = 6;
const MAX_TOTAL_XP = 6000; // 6k total XP

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
    const level = Math.min(Math.floor(totalXP / LEVEL_XP_THRESHOLD) + 1, MAX_LEVEL);
    const currentXP = totalXP % LEVEL_XP_THRESHOLD;
    this.xpCallbacks.forEach(callback => callback(currentXP, level));
  }

  // Award XP for music machine usage
  async awardMusicMachineXP(userId: string, xpAmount: number = 10): Promise<void> {
    try {
      const userRef = doc(db, 'userProgress', userId);
      const userSnap = await getDoc(userRef);
      
      let newTotalXP: number;
      let oldLevel: number;
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        oldLevel = Math.min(Math.floor((currentData.totalXP || 0) / LEVEL_XP_THRESHOLD) + 1, MAX_LEVEL);
        newTotalXP = Math.min((currentData.totalXP || 0) + xpAmount, MAX_TOTAL_XP);
        
        await updateDoc(userRef, {
          totalXP: newTotalXP,
          lastUpdated: new Date().toISOString(),
          musicMachineUsage: (currentData.musicMachineUsage || 0) + 1
        });
      } else {
        oldLevel = 1;
        newTotalXP = Math.min(xpAmount, MAX_TOTAL_XP);
        await setDoc(userRef, {
          totalXP: newTotalXP,
          level: 1,
          phase: 1,
          lastUpdated: new Date().toISOString(),
          musicMachineUsage: 1
        });
      }
      
      const newLevel = Math.min(Math.floor(newTotalXP / LEVEL_XP_THRESHOLD) + 1, MAX_LEVEL);
      
      // Check for level up and unlock new phase
      if (newLevel > oldLevel) {
        await this.unlockNewPhase(userId, newLevel);
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
      const xpAmount = minutes * 2; // 2 XP per minute (increased for new system)
      const userRef = doc(db, 'userProgress', userId);
      const userSnap = await getDoc(userRef);
      
      let newTotalXP: number;
      let oldLevel: number;
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        oldLevel = Math.min(Math.floor((currentData.totalXP || 0) / LEVEL_XP_THRESHOLD) + 1, MAX_LEVEL);
        newTotalXP = Math.min((currentData.totalXP || 0) + xpAmount, MAX_TOTAL_XP);
        
        await updateDoc(userRef, {
          totalXP: newTotalXP,
          lastUpdated: new Date().toISOString()
        });
      } else {
        oldLevel = 1;
        newTotalXP = Math.min(xpAmount, MAX_TOTAL_XP);
        await setDoc(userRef, {
          totalXP: newTotalXP,
          level: 1,
          phase: 1,
          lastUpdated: new Date().toISOString(),
          musicMachineUsage: 0
        });
      }
      
      const newLevel = Math.min(Math.floor(newTotalXP / LEVEL_XP_THRESHOLD) + 1, MAX_LEVEL);
      
      // Check for level up and unlock new phase
      if (newLevel > oldLevel) {
        await this.unlockNewPhase(userId, newLevel);
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
      let oldLevel: number;
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        oldLevel = Math.min(Math.floor((currentData.totalXP || 0) / LEVEL_XP_THRESHOLD) + 1, MAX_LEVEL);
        newTotalXP = Math.min((currentData.totalXP || 0) + xpAmount, MAX_TOTAL_XP);
        
        await updateDoc(userRef, {
          totalXP: newTotalXP,
          lastUpdated: new Date().toISOString()
        });
      } else {
        oldLevel = 1;
        newTotalXP = Math.min(xpAmount, MAX_TOTAL_XP);
        await setDoc(userRef, {
          totalXP: newTotalXP,
          level: 1,
          phase: 1,
          lastUpdated: new Date().toISOString(),
          musicMachineUsage: 0
        });
      }
      
      const newLevel = Math.min(Math.floor(newTotalXP / LEVEL_XP_THRESHOLD) + 1, MAX_LEVEL);
      
      // Check for level up and unlock new phase
      if (newLevel > oldLevel) {
        await this.unlockNewPhase(userId, newLevel);
      }
      
      this.notifyXPUpdate(newTotalXP);
      toast.success(`🎉 +${xpAmount} XP for ${reason}!`);
    } catch (error) {
      console.error('Error awarding custom XP:', error);
    }
  }

  // Load user's XP data
  async loadUserXPData(userId: string): Promise<{ xp: number; level: number; phase: number; totalXP: number }> {
    try {
      const userRef = doc(db, 'userProgress', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        const totalXP = Math.min(data.totalXP || 0, MAX_TOTAL_XP);
        const level = Math.min(Math.floor(totalXP / LEVEL_XP_THRESHOLD) + 1, MAX_LEVEL);
        const phase = level; // Phase = Level in new system
        const currentXP = totalXP % LEVEL_XP_THRESHOLD;
        
        return { xp: currentXP, level, phase, totalXP };
      }
      
      return { xp: 0, level: 1, phase: 1, totalXP: 0 };
    } catch (error) {
      console.error('Error loading user XP data:', error);
      return { xp: 0, level: 1, phase: 1, totalXP: 0 };
    }
  }

  // Update user's avatar phase in accounts collection
  async updateUserAvatarPhase(userId: string, newPhase: number): Promise<void> {
    try {
      const userRef = doc(db, 'accounts', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const maxUnlockedPhase = userData.maxUnlockedPhase || 1;
        const availablePhases = userData.availablePhases || [1];
        
        // Only allow setting phase if it's unlocked
        if (newPhase <= maxUnlockedPhase && availablePhases.includes(newPhase)) {
          await updateDoc(userRef, {
            currentAvatarPhase: newPhase,
            updatedAt: new Date()
          });
          toast.success(`🎭 Avatar changed to phase ${newPhase}!`);
        } else {
          toast.error(`Phase ${newPhase} is not unlocked yet!`);
        }
      }
    } catch (error) {
      console.error('Error updating avatar phase:', error);
      toast.error('Failed to update avatar phase');
    }
  }

  // Unlock new phase when user levels up (level-based progression: 1k XP per level)
  async unlockNewPhase(userId: string, newLevel: number): Promise<void> {
    try {
      const userRef = doc(db, 'accounts', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const maxUnlockedPhase = userData.maxUnlockedPhase || 1;
        const availablePhases = userData.availablePhases || [1];
        
        // Level-based phase unlocking (Phase = Level, max 6 phases)
        if (newLevel > maxUnlockedPhase && newLevel <= MAX_LEVEL) {
          const newPhase = Math.min(newLevel, MAX_LEVEL);
          const newAvailablePhases = [];
          for (let i = 1; i <= newPhase; i++) {
            newAvailablePhases.push(i);
          }
          
          await updateDoc(userRef, {
            maxUnlockedPhase: newPhase,
            availablePhases: newAvailablePhases,
            currentAvatarPhase: newPhase, // Auto-set to new phase
            updatedAt: new Date()
          });
          
          toast.success(`🎉 Level ${newLevel} reached! Phase ${newPhase} unlocked!`);
        }
      }
    } catch (error) {
      console.error('Error unlocking new phase:', error);
    }
  }

  // Get user's avatar phase data
  async getUserAvatarData(userId: string): Promise<{
    currentPhase: number;
    maxUnlockedPhase: number;
    availablePhases: number[];
  }> {
    try {
      const userRef = doc(db, 'accounts', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          currentPhase: userData.currentAvatarPhase || 1,
          maxUnlockedPhase: userData.maxUnlockedPhase || 1,
          availablePhases: userData.availablePhases || [1]
        };
      }
      
      return {
        currentPhase: 1,
        maxUnlockedPhase: 1,
        availablePhases: [1]
      };
    } catch (error) {
      console.error('Error getting user avatar data:', error);
      return {
        currentPhase: 1,
        maxUnlockedPhase: 1,
        availablePhases: [1]
      };
    }
  }

  // Track user creation
  async trackUserCreation(userId: string, creationType: 'drawing' | 'drums'): Promise<void> {
    try {
      const userRef = doc(db, 'accounts', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentTotal = userData.totalCreations || 0;
        const currentDrawing = userData.drawingMachineCreations || 0;
        const currentDrums = userData.drumMachineCreations || 0;
        
        const updates: any = {
          totalCreations: currentTotal + 1,
          updatedAt: new Date()
        };
        
        if (creationType === 'drawing') {
          updates.drawingMachineCreations = currentDrawing + 1;
        } else {
          updates.drumMachineCreations = currentDrums + 1;
        }
        
        await updateDoc(userRef, updates);
        console.log(`🎵 Tracked ${creationType} creation for user ${userId}`);
      }
    } catch (error) {
      console.error('Error tracking user creation:', error);
    }
  }

  // Get user creation stats
  async getUserCreationStats(userId: string): Promise<{
    totalCreations: number;
    drawingMachineCreations: number;
    drumMachineCreations: number;
  }> {
    try {
      const userRef = doc(db, 'accounts', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          totalCreations: userData.totalCreations || 0,
          drawingMachineCreations: userData.drawingMachineCreations || 0,
          drumMachineCreations: userData.drumMachineCreations || 0
        };
      }
      
      return {
        totalCreations: 0,
        drawingMachineCreations: 0,
        drumMachineCreations: 0
      };
    } catch (error) {
      console.error('Error getting user creation stats:', error);
      return {
        totalCreations: 0,
        drawingMachineCreations: 0,
        drumMachineCreations: 0
      };
    }
  }

  // Update robot name
  async updateRobotName(userId: string, robotName: string): Promise<void> {
    try {
      const userRef = doc(db, 'accounts', userId);
      await updateDoc(userRef, {
        robotName: robotName,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating robot name:', error);
      throw error;
    }
  }

  // Get robot name
  async getRobotName(userId: string): Promise<string> {
    try {
      const userRef = doc(db, 'accounts', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.robotName || 'BEATO';
      }
      return 'BEATO';
    } catch (error) {
      console.error('Error getting robot name:', error);
      return 'BEATO';
    }
  }

  // Get XP progress information for UI display
  async getXPProgress(userId: string): Promise<{
    currentXP: number;
    level: number;
    totalXP: number;
    xpToNextLevel: number;
    xpProgressPercent: number;
    maxLevel: boolean;
  }> {
    try {
      const xpData = await this.loadUserXPData(userId);
      const currentXP = xpData.xp;
      const level = xpData.level;
      const totalXP = xpData.totalXP;
      const xpToNextLevel = level >= MAX_LEVEL ? 0 : LEVEL_XP_THRESHOLD - currentXP;
      const xpProgressPercent = level >= MAX_LEVEL ? 100 : (currentXP / LEVEL_XP_THRESHOLD) * 100;
      const maxLevel = level >= MAX_LEVEL;

      return {
        currentXP,
        level,
        totalXP,
        xpToNextLevel,
        xpProgressPercent,
        maxLevel
      };
    } catch (error) {
      console.error('Error getting XP progress:', error);
      return {
        currentXP: 0,
        level: 1,
        totalXP: 0,
        xpToNextLevel: 1000,
        xpProgressPercent: 0,
        maxLevel: false
      };
    }
  }

  // Test method to award large amounts of XP for testing
  async awardTestXP(userId: string, xpAmount: number): Promise<void> {
    try {
      await this.awardCustomXP(userId, xpAmount, 'Testing XP System');
      console.log(`🎯 Test XP awarded: ${xpAmount} XP to user ${userId}`);
    } catch (error) {
      console.error('Error awarding test XP:', error);
    }
  }

  // Migrate existing users to have createdAt field
  async migrateUserCreatedAt(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'accounts', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Only update if createdAt is missing or invalid
        if (!userData.createdAt || isNaN(new Date(userData.createdAt).getTime())) {
          await updateDoc(userRef, {
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`📅 Migrated createdAt for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error migrating user createdAt:', error);
    }
  }
}

export const xpService = XPService.getInstance();
