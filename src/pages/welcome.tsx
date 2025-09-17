import { useEffect, useState } from "react";
import styles from "@/app/assets/styles/MainPage.module.css";
import Image from "next/image";
import { toast } from 'react-hot-toast';
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { User } from "@/types/userTypes";
import Avatar from "react-avatar";
import Preloader from "@/components/Preloader";
import Link from "next/link";
import { useRouter } from 'next/router';

import { IWalletConnection } from "@/types/walletTypes";
import { connect, disconnect } from "starknetkit";
import { useBlockBeatsAnalytics } from '@/utils/analytics/blockbeatsEvents';
import Head from 'next/head';
import WalletAddressModal from '@/components/WalletAddressModal';

const WelcomeScreen = () => {
  const router = useRouter();
  const { user, signUpWithWallet, signUp, signIn, authenticated, verifyEmail, sendWelcomeEmail, walletConnectionAuth, setWalletConnectionAuth } = useAuth();
  const { trackWalletConnection } = useBlockBeatsAnalytics();
  const [walletConnection, setWalletConnection] = useState<IWalletConnection | null>(null);
  const [email, setEmail] = useState("");
  const [createAccountEmail, setCreateAccountEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    if (user && authenticated) {
      router.push('/dashboard');
    }
  }, [user, authenticated, router]);

  useEffect(() => {
    // Only run on client side and ensure DOM is ready
    if (typeof window === 'undefined') return;
    
    let handleMouseMove: ((e: MouseEvent) => void) | null = null;
    
    // Add a small delay to ensure DOM is fully loaded
    const timer = setTimeout(() => {
      handleMouseMove = (e: MouseEvent) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;

        const layers = document.getElementById("parallax-layers");
        if (layers) {
          layers.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
        }

        const canvas = document.getElementById("neon-canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];

        for (let i = 0; i < 60; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
          });
        }

        function drawPlasma() {
          if (!canvas || !ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "rgba(23, 236, 236, 0.6)";
          for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          }
          requestAnimationFrame(drawPlasma);
        }

        drawPlasma();
      };

      if (handleMouseMove) {
        document.addEventListener("mousemove", handleMouseMove);
      }
    }, 100); // Small delay to ensure DOM is ready

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (handleMouseMove) {
        document.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  
  const readWalletAddress = () => {
    setIsWalletModalOpen(true);
  }

  const handleWalletAddressSubmit = async (address: string) => {
    setIsWalletModalOpen(false);
    
    setWalletConnection({
      // wallet: null,
      address: address,
    });

    // fetch all accounts from firebase to check if the account.walletStored is already registered
    const accounts = await getAllAccounts();
    const existingAccount = accounts.find((account) => account.walletStored === address);
    if (existingAccount) {
      await signIn(existingAccount.email, "abc123");
      toast.success("You're already in.");
      return;
    }

    handleConnect(address);
  }

  const handleConnect = async (_address: string) => {
    try {
      const result = await connect({ dappName: "BlockBeats" });
      if (result.wallet) {
        setWalletConnection({
          wallet: result.wallet,
          address: _address,
        });
        setWalletConnectionAuth(
          {
            wallet: result.wallet,
            address: _address,
          }
        );
        
        // Track wallet connection
        const walletType = result.wallet?.id?.includes('argent') ? 'argent' : 'braavos';
        trackWalletConnection(walletType, _address);
        
        toast.success(`Wallet ${_address} connected successfully!`);
        setIsModalOpen(true);
      } else {
        toast.error("No wallet found in connection result.");
        setWalletConnection(null);
      }
    } catch (error) {
      toast.error("Failed to connect wallet.");
      setWalletConnection(null);
    }
  };

  const handleDisconnect = async () => {
    if (!walletConnection) {
      toast.error("No wallet connected.");
      return;
    }
    try {
      await disconnect();
      setWalletConnection(null);
      toast.success("Wallet disconnected successfully!");
      console.log("Wallet disconnected");
    } catch (error) {
      toast.error("Failed to disconnect wallet.");
      console.error("Failed to disconnect wallet:", error);
    }
  };
  
  const getAllAccounts = async () => {
        try {
      const querySnapshot = await getDocs(collection(db, 'accounts'))
      const accounts = querySnapshot.docs
        .map(doc => ({
          ...(doc.data() as User)
        }))
      return accounts
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      console.log('Login attempt started for email:', email);
      
      // check if email is already in accounts collection in firebase
      const accounts = await getAllAccounts();
      const existingAccount = accounts.find((account) => account.email === email);
      
      if (existingAccount) {
        console.log('Existing account found, signing in...');
        toast.success("You're already in.");
        await signIn(existingAccount.email, "abc123");
        return;
      } else {
        console.log('New account, signing up...');
        // await sendWelcomeEmail(email, "abc123");
        await signUp(email, "abc123");
        setLoading(false);
        setIsModalOpen(true);
        setEmail("");
        return;
      }
      
    } catch (error) {
      console.error("Error in login process:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setLoading(false);
      return;
    }
  };

  const getWallet = () => {
    if (user?.walletStored) {
      return user.walletStored ? `${user.walletStored.slice(0, 6)}...${user.walletStored.slice(-4)}` : 'Not connected';
    }
    if (walletConnection?.address) {
      return walletConnectionAuth?.address ? `${walletConnectionAuth.address.slice(0, 6)}...${walletConnectionAuth.address.slice(-4)}` : 'Not connected';
    }
  };

  // Removed problematic loading state that was causing infinite loading

  return (
    <>
      <Head>
        <title>Welcome to BlockBeats - Test Page with Plasma Effects</title>
        <meta name="description" content="Testing plasma effects and animations on a separate welcome page to isolate production issues." />
      </Head>
      <main className={styles.main}>
      
      <div className={`${styles.bannerContainer} ${styles.bannerContainerCustom}`} style={{ marginBottom: '-80px' }}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <p>
          Welcome to <span data-text="BlockBeats" className="glitch">BlockBeats</span> Test Page! <br /> 
          This page uses the <b>original plasma effects</b> to test production compatibility... <br /><br />
        </p>
        <p>
          <span className={styles.typewriterLoop}>✨ Testing animations and interactions.</span> <br /><br />
        </p>
      </div>

      <br />
      <br />
      <br />
      <br />

      {authenticated ? (
        <Preloader />
      ) : (
      <div className={styles.bannerContainer}>
        {/* 🚀 Test Banner with Plasma Effects */}
     
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>🎧 Welcome to <span data-text="BLOCKBEATS" className="glitch">BLOCKBEATS</span></h2>
          
          {!loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', float: 'right', marginTop: '-90px' }}>
              <Link href={'https://braavos.app/'} target={'_blank'}>
                <Image
                  src="/braavos.jpeg"
                  alt="braavos-logo"
                  width={35}
                  height={35}
                  style={{ filter: 'invert(1) drop-shadow(0 0 0.3rem #ffffff70)', cursor: 'pointer' }}
                />
              </Link>  
              &nbsp;
              &nbsp;
              <Link href={'https://argent.xyz/'} target={'_blank'}>
                <Image
                  src="/argentx.png"
                  alt="argentx-logo"
                  width={35}
                  height={35}
                  style={{ cursor: 'pointer' }}
                />
              </Link>  
            </div>
          )}

          <>
            {walletConnection?.address ? (
              <Preloader />
            ) : (
              <button
                className={styles.submitBtnLarge}
                onClick={readWalletAddress}
              >
                <span style={{ position: 'relative', marginTop: '-20px' }}>Test Connect Wallet</span>
                <img src="/starknet-logo.svg" style={{ position: 'absolute', top: 30, margin: '0 auto', left: 10 }} alt="blockbeats-logo" width={60} />
              </button>
            )}
          </>

          <br />
          <br />
          <hr />
          <br />

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={styles.emailInput}
              disabled={loading}
            />
            {!loading ? (
              <button type="submit" className={styles.submitBtn} style={{ animation: 'none'}}>Test Join Now 🚀</button>
            ) : (
              <Preloader />
            )}
          </form>

          <p>
            This is a <b>test page</b> to check if plasma effects work in production. <br /> 
            🔐 <span data-text="Testing" className="glitch">Testing</span> animations and interactions.
          </p>
          <br />
          
          {/* Navigation Links */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/login" style={{ color: '#00FFFF', textDecoration: 'none', padding: '10px 20px', border: '1px solid #00FFFF', borderRadius: '5px' }}>
              Go to Simplified Login
            </Link>
            <Link href="/" style={{ color: '#00FFFF', textDecoration: 'none', padding: '10px 20px', border: '1px solid #00FFFF', borderRadius: '5px' }}>
              Go to Home
            </Link>
          </div>
        </div>
      </div>
      )}
      


      <br />
      <br />
      <br />

      <Modal classNames={{ root: styles.modal }} open={isModalOpen} onClose={() => setIsModalOpen(false)} styles={{ modal: {  backdropFilter: 'blur(100px)', backgroundColor: 'rgba(20, 50, 100, 0.6)', width: '90%' } }} center>
        <div className="modal-content">
          <br />
          <h2 className={styles.modalTitle}>Welcome to BlockBeats Test!</h2>
          <br />
          {walletConnectionAuth?.wallet.icon ? (<img src={walletConnectionAuth?.wallet.icon} alt="Wallet Icon" />) : (<Avatar 
            size="50" 
            textSizeRatio={1.75} 
            name={user?.email || ''} 
            alt={'user-profile-picture'}
            round={true}
            color='var(--secondary-color)'
          />)}
          
          <br />
          <br />
          {user?.walletStored ? (
            <p style={{ fontSize: '12px' }}>
              Your Wallet Address:&nbsp;
              <b style={{ color: 'gold' }}>
                {getWallet()}
              </b>
              &nbsp;
            </p>
            ) : (
            <p style={{ fontSize: '12px' }}>
              Your Wallet Address:&nbsp;
              <b style={{ color: 'red' }}>Not connected</b>
            </p>
            )}
          <br />
          <p style={{ fontSize: '12px' }}>
            Your email is: <b>{user?.email}</b> 
          </p>

          <br />
          <button className={styles.submitBtn} onClick={() => {
            if (user) {
              setIsModalOpen(false);
              router.push('/dashboard');
            }
          }}>
            Let's go! 🎶
          </button>

          {!user && (
            <div>
              <br />
              <div style={{ display: "flex", justifyContent: "space-between", gap: "25px" }}>
                <input className={styles.emailInput} style={{ height: '50px', marginTop: '15px' }} onChange={(e) => setCreateAccountEmail(e.target.value)} type="text" />
                <button className={styles.submitBtn} style={{ width: '100px', padding: '0 20px' }} onClick={() => {
                  signUpWithWallet(createAccountEmail, "abc123", walletConnectionAuth || null);
                }}>
                  Create <br/> Account
                </button>
              </div>
            </div>
          )}
            
          <br />
          <b>Note:</b> This is a test page to check plasma effects in production.
          <br />
          <p className={`glitch ${styles.modalText}`} style={{ fontSize: '12px' }}>
            <b>Testing animations and interactions!</b>
          </p>
        </div>
      </Modal>

      <div id="parallax-layers">
        <canvas id="neon-canvas"></canvas>
        <div className="neon-glow"></div>
      </div>

      {/* Wallet Address Input Modal */}
      <WalletAddressModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSubmit={handleWalletAddressSubmit}
        loading={loading}
      />

    </main>
    </>
  );
};

export default WelcomeScreen;
