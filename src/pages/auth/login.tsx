import { useState, useEffect } from "react";
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { User } from "@/types/userTypes";
import styles from "@/app/assets/styles/layouts/MainPage.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/router';
import { useAccount } from '@starknet-react/core';
import StarknetConnectButton from '../../components/wallet/StarknetConnectButton';
import WalletConnectionModal from '../../components/modals/WalletConnectionModal';

const LoginFresh = () => {
  const { signUp, signIn, signInWithWallet, signUpWithWalletOnly, updateWalletAccount, authenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState("");
  const [connectedProfile, setConnectedProfile] = useState(null);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (mounted && authenticated) {
      console.log('User already authenticated, redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [mounted, authenticated, router]);

  // Plasma effects and parallax
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
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

    document.addEventListener("mousemove", handleMouseMove);

    // Cleanup function
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const getAllAccounts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'accounts'))
      const accounts = querySnapshot.docs
        .map(doc => ({
          ...(doc.data() as User)
        }))
      return accounts
    } catch (error) {
      console.error('Error fetching accounts:', error)
      return []
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📧 Fresh Login: Email form submitted');
    
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
        await signUp(email, "abc123");
        setLoading(false);
        toast.success("Account created successfully!");
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

  const handleWalletConnect = async (address: string, profile?: any) => {
    console.log('🔗 Wallet connected:', address);
    console.log('👤 Profile:', profile);
    
    try {
      setLoading(true);
      
      // First, try to sign in with the wallet address
      try {
        console.log('🔄 Attempting to sign in with wallet...');
        await signInWithWallet(address);
        toast.success(`Welcome back! Signed in with wallet: ${profile?.name || address.slice(0, 6)}...${address.slice(-4)}`);
        console.log('✅ Existing wallet user signed in successfully');
        
        // Redirect to dashboard after successful sign in
        if (typeof window !== 'undefined') {
          router.push('/dashboard');
        }
      } catch (signInError) {
        console.log('ℹ️ No existing account found, showing modal for new user...');
        console.log('Sign in error:', signInError);
        
        // If sign in fails, show modal for new user to enter email and name
        setConnectedWalletAddress(address);
        setConnectedProfile(profile);
        setShowWalletModal(true);
        console.log('🎯 Modal should now be visible:', true);
      }
    } catch (error) {
      console.error('❌ Error in wallet authentication:', error);
      toast.error('Failed to authenticate with wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletDisconnect = () => {
    console.log('🔌 Wallet disconnected');
    toast.success('Wallet disconnected');
  };

  const handleModalContinue = async (email: string, displayName: string) => {
    try {
      await updateWalletAccount(connectedWalletAddress, email, displayName, connectedProfile);
      setShowWalletModal(false);
      toast.success('Account created successfully! Welcome to BlockBeats!');
      
      // Redirect to dashboard
      if (typeof window !== 'undefined') {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('❌ Error creating wallet account:', error);
      toast.error('Failed to create account. Please try again.');
    }
  };

  const handleModalClose = () => {
    console.log('🚪 Closing wallet modal');
    setShowWalletModal(false);
    setConnectedWalletAddress("");
    setConnectedProfile(null);
  };

  // Debug modal state
  useEffect(() => {
    console.log('🔍 Modal state changed:', { showWalletModal, connectedWalletAddress });
  }, [showWalletModal, connectedWalletAddress]);

  // Show loading state until mounted on client or if redirecting
  if (!mounted || authenticated) {
    return (
      <>
        <Head>
          <title>Join BlockBeats - Connect Wallet & Start Creating Music NFTs</title>
          <meta name="description" content="Join BlockBeats 3.0 and start creating musical NFTs. Connect your Argent X or Braavos wallet to access the Web3 music creation platform." />
          <meta name="keywords" content="BlockBeats login, connect wallet, Argent X, Braavos, Starknet wallet, Web3 music, NFT creation, music platform" />
          <meta property="og:title" content="Join BlockBeats - Connect Wallet & Start Creating Music NFTs" />
          <meta property="og:description" content="Join BlockBeats 3.0 and start creating musical NFTs. Connect your Argent X or Braavos wallet to access the Web3 music creation platform." />
          <meta property="og:image" content="https://blockbeats-tau.vercel.app/images/logos/logo.webp" />
          <meta property="og:url" content="https://blockbeats-tau.vercel.app/login-fresh" />
        </Head>
        <div className="login-container">
          <div className="login-title">
            🎵 BlockBeats
          </div>
          <div className="login-subtitle">
            {authenticated ? '🔄 Redirecting to dashboard...' : '⚠️ Troubles with some services on production'}
          </div>
          <div className="login-description">
            {authenticated ? 'Please wait...' : "We're working on it..."}
          </div>
          <div className="login-debug">
            Please try refreshing the page in a few moments
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Join BlockBeats - Connect Wallet & Start Creating Music NFTs</title>
        <meta name="description" content="Join BlockBeats 3.0 and start creating musical NFTs. Connect your Argent X or Braavos wallet to access the Web3 music creation platform." />
        <meta name="keywords" content="BlockBeats login, connect wallet, Argent X, Braavos, Starknet wallet, Web3 music, NFT creation, music platform" />
        <meta property="og:title" content="Join BlockBeats - Connect Wallet & Start Creating Music NFTs" />
        <meta property="og:description" content="Join BlockBeats 3.0 and start creating musical NFTs. Connect your Argent X or Braavos wallet to access the Web3 music creation platform." />
        <meta property="og:image" content="https://blockbeats-tau.vercel.app/images/logos/logo.webp" />
        <meta property="og:url" content="https://blockbeats-tau.vercel.app/login-fresh" />
      </Head>
      <main className={styles.main}>
      
      <div className={`${styles.bannerContainer} ${styles.bannerContainerCustom} banner-margin-bottom`}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <p>
          It's <span data-text="Web3" className="glitch">Web3</span>'s first community-powered <br /> <b>musical signature generator</b> — <b>mintable, shareable, tradable</b>... <br /><br />
        </p>
        <p>
          <span className={styles.typewriterLoop}>✨ We turn music into immutable art.</span> <br /><br />
        </p>
      </div>

      <br />
      <br />
      <br />
      <br />

      <div className={styles.bannerContainer}>
        {/* 🚀 Neon Whitelist Banner */}
     
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>🎧 Join <span data-text="BLOCKBEATS" className="glitch">BLOCKBEATS</span></h2>
          
          {!loading && (
            <div className="banner-logo-container">
              <Link href={'https://braavos.app/'} target={'_blank'}>
                <Image
                  src="/images/logos/braavos.jpeg"
                  alt="braavos-logo"
                  width={35}
                  height={35}
                  className="logo-filter"
                />
              </Link>  
              &nbsp;
              &nbsp;
              <Link href={'https://argent.xyz/'} target={'_blank'}>
                <Image
                  src="/images/logos/argentx.png"
                  alt="argentx-logo"
                  width={35}
                  height={35}
                  className="cursor-pointer"
                />
              </Link>  
            </div>
          )}

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
              🔗 Connect your Starknet wallet to create an account or sign in
            </p>
          </div>

          <StarknetConnectButton 
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />

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
              <button type="submit" className={`${styles.submitBtn} btn-join-now`}>Join Now 🚀</button>
            ) : (
              <div className="loading-container">
                Processing...
              </div>
            )}
          </form>

          <p>
            And take full ownership of your creation through <br /> 🔐 <span data-text="NFTs" className="glitch">NFTs</span>.
          </p>
          <br />
        </div>
      </div>
      

      <br />
      <br />
      <br />

      <div id="parallax-layers">
        <canvas id="neon-canvas"></canvas>
        <div className="neon-glow"></div>
      </div>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={handleModalClose}
        onContinue={handleModalContinue}
        walletAddress={connectedWalletAddress}
        profile={connectedProfile}
        isLoading={loading}
      />

    </main>
    </>
  );
};

export default LoginFresh;
