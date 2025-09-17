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

const LoginFresh = () => {
  const { signUp, signIn, authenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (mounted && authenticated) {
      console.log('User already authenticated, redirecting to dashboard...');
      router.push('/dashboard/dashboard');
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

  const handleWalletClick = () => {
    console.log('🔘 Fresh Login: Wallet button clicked');
    alert('Wallet connection coming soon!');
  };

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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'radial-gradient(circle at center, #0f0f2a 0%, #070713 100%)',
          color: '#00FFFF',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px', fontWeight: 'bold' }}>
            🎵 BlockBeats
          </div>
          <div style={{ fontSize: '16px', marginBottom: '10px' }}>
            {authenticated ? '🔄 Redirecting to dashboard...' : '⚠️ Troubles with some services on production'}
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            {authenticated ? 'Please wait...' : "We're working on it..."}
          </div>
          <div style={{ 
            marginTop: '30px', 
            fontSize: '12px', 
            color: '#666',
            border: '1px solid #333',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: 'rgba(0,0,0,0.3)'
          }}>
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
      
      <div className={`${styles.bannerContainer} ${styles.bannerContainerCustom}`} style={{ marginBottom: '-80px' }}>
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', float: 'right', marginTop: '-90px' }}>
              <Link href={'https://braavos.app/'} target={'_blank'}>
                <Image
                  src="/images/logos/braavos.jpeg"
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
                  src="/images/logos/argentx.png"
                  alt="argentx-logo"
                  width={35}
                  height={35}
                  style={{ cursor: 'pointer' }}
                />
              </Link>  
            </div>
          )}

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className={styles.submitBtnLarge}
              onClick={handleWalletClick}
              style={{
                background: 'linear-gradient(45deg, #333, #666)',
                color: '#fff',
                opacity: 0.7,
                cursor: 'not-allowed',
                width: '300px'
              }}
            >
              <span style={{ position: 'relative', marginTop: '-20px' }}>Connect Wallet</span>
              <img src="/images/logos/starknet-logo.svg" style={{ position: 'absolute', top: 30, margin: '0 auto', left: 10, filter: 'grayscale(100%)' }} alt="blockbeats-logo" width={60} />
            </button>
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
            }}>
              Coming Soon
            </div>
          </div>

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
              <button type="submit" className={styles.submitBtn} style={{ animation: 'none'}}>Join Now 🚀</button>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50px',
                color: '#00FFFF',
                fontSize: '16px'
              }}>
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

    </main>
    </>
  );
};

export default LoginFresh;
