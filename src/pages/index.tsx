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
import LevelUpOverlay from "@/components/LevelUpOverlay";

// import { WebWalletConnector } from "starknetkit/webwallet"
// import { useConnect } from "@starknet-react/core";
// import WalletConnector from "@/components/WalletConector";

import { IWalletConnection } from "@/types/walletTypes";
import { connect, disconnect } from "starknetkit";

const coins = [
  { x: 'calc(-100px + 24px)', y: 'calc(-105px + 24px)', delay: '0.3s' },
  { x: 'calc(-70px + 24px)', y: '-90px', delay: '0.1s' },
  { x: 'calc(-30px + 24px)', y: '-125px', delay: '0s' },
  { x: 'calc(10px + 24px)', y: '-130px', delay: '0.2s' },
  { x: 'calc(30px + 24px)', y: '-100px', delay: '0.1s' },
  { x: 'calc(70px + 24px)', y: '-95px', delay: '0.4s' },
  { x: 'calc(100px + 24px)', y: '-100px', delay: '0.2s' },
];

const Home = () => {
  const [email, setEmail] = useState("");
  const [createAccountEmail, setCreateAccountEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claimCoins, setClaimCoins] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [messageOverlay, setMessageOverlay] = useState("");
 
  const [walletConnection, setWalletConnection] = useState<IWalletConnection | null>(null);

  const { user, signUpWithWallet, signUp, signIn, authenticated, verifyEmail, sendWelcomeEmail, walletConnectionAuth, setWalletConnectionAuth } = useAuth();

  // if (authenticated) {
  //   window.location.href = "/dashboard";
  // }

  useEffect(() => {
    document.addEventListener("mousemove", (e) => {
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
    });
  }, []);

  const triggerCoinAnimation = () => {
  const container = document.createElement("div");
  container.className = styles["coin-animation-container"];
  document.body.appendChild(container);

  for (let i = 0; i < 20; i++) {
    const coin = document.createElement("div");
    coin.className = styles.coin;

    // Randomize position a bit
    coin.style.left = `${window.innerWidth / 2 + (Math.random() - 0.5) * 100}px`;
    coin.style.top = `${window.innerHeight / 2 + (Math.random() - 0.5) * 100}px`;

    container.appendChild(coin);

    setTimeout(() => {
      coin.remove();
    }, 1500);
  }

  // Cleanup container
  setTimeout(() => {
    container.remove();
  }, 1600);
};

  const readWalletAddress = async () => {
    const address = prompt("Please enter your wallet address:")
    setWalletConnection({
      // wallet: null,
      address: address || '',
    });
    if (address) {
      handleConnect(address);
    }
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
      
      // check if email is already in accounts collection in firebase

      const accounts = await getAllAccounts();
      const emailExists = accounts.some((account) => account.email === email);
      if (emailExists) {
        toast.success("You're already in.");
        setLoading(false);
        setIsModalOpen(true);
        return;
      } else {
        await sendWelcomeEmail(email, "abc123");
        await signUp(email, "abc123");
        setLoading(false);
        setIsModalOpen(true);
        setEmail("");
        return;
      }
      
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Error signing up. Please try again.");
      setLoading(false);
      return;
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    await signIn(createAccountEmail, "abc123");
  }

  const playSucessSound = () => {
    const audio = new Audio("/sounds/coins.mp3");
    audio.volume = 0.6;
    audio.play();
  };

  const playLevelUp2Sound = () => {
    const audio = new Audio("/sounds/level-up-2.mp3");
    audio.volume = 0.6;
    audio.play();
  };

  const handleRevenue = () => {
    setMessageOverlay("💰 Claim your coins!");
    setShowOverlay(true);
    triggerCoinAnimation();
    playLevelUp2Sound();

    setTimeout(() => {
      setShowOverlay(false);
      setMessageOverlay("");
      setClaimCoins(true);
      playSucessSound();
    }, 3000);

    setTimeout(() => {
      setClaimCoins(false);
    }, 6000);
  }

  return (
    <main className={styles.main}>
      {showOverlay && (
        <LevelUpOverlay
          message={messageOverlay}
          onClose={() => setShowOverlay(true)}
        />
      )}

      <div className={`${styles.bannerContainer} ${styles.bannerContainerCustom}`} style={{ marginBottom: '-80px' }}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <p>
          It’s <span data-text="Web3" className="glitch">Web3</span>’s first community-powered <br /> <b>musical signature generator</b> — <b>mintable, shareable, tradable</b>... <br /><br />
        </p>
        <p>
          <span className={styles.typewriterLoop}>✨ We turn music into immutable art.</span> <br /><br />
        </p>
      </div>

      <br />
      <br />
      <br />
      <br />
      <br />

      {/* 🚀 Neon Whitelist Banner */}
      <div className={styles.bannerContainer}>
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>🎧 Join <span data-text="BLOCKBEATS" className="glitch">BLOCKBEATS</span></h2>
          
          <>
            {walletConnection?.address ? (
              <button
                className={styles.submitBtnLarge}
                onClick={handleDisconnect}
              >
                Disconnect Wallet: {walletConnection.address.slice(0, 6)}...{walletConnection.address.slice(-4)}
              </button>
            ) : (
              <button
                className={styles.submitBtnLarge}
                onClick={readWalletAddress}
              >
                <img src="/starknet-logo.svg" style={{ position: 'absolute', top: 30, margin: '0 auto', marginLeft: 20 }} alt="blockbeats-logo" width={60} />
                Connect Wallet
              </button>
            )}
          </>

          {/* <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              required
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your wallet address"
              className={styles.emailInput}
              disabled={loading}
            />
            {!loading ? (
              <WalletConnector />
            ) : (
              <Preloader />
            )}
          </form> */}

          {/* <button onClick={handleConnect} className={styles.submitBtnLarge} disabled style={{ background: 'goldenrod', animation: 'none', opacity: 0.5 }}>Connect Wallet</button> */}

          <br />
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
              <button type="submit" className={styles.submitBtn}>Join Now 🚀</button>
            ) : (
              <Preloader />
            )}
          </form>

          <br />
          <p>
            And take full ownership of your creation through <br /> 🔐 <span data-text="NFTs" className="glitch">NFTs</span>.
          </p>
          <br />
        </div>
      </div>
      
      <div>
        <br />
        <br />
        <Image src={'/starknet-logo.svg'} alt={'metamask'} width={200} height={50} style={{ filter: 'invert(1) drop-shadow(0 0 0.3rem #ffffff70)' }} />
        &nbsp;
        &nbsp;
        &nbsp;
        <Link href={'https://josegomez-dev.github.io/MusicalPath/'} target={'_blank'}>
          <Image src={'/musicalpathlogo.webp'} alt={'metamask'} width={100} height={70} style={{ marginBottom: '-5px' }} />
        </Link>
      </div>

      <br />
      <br />
      <br />

      <Modal classNames={{ root: styles.modal }} open={isModalOpen} onClose={() => setIsModalOpen(false)} styles={{ modal: {  backdropFilter: 'blur(100px)', backgroundColor: 'rgba(20, 50, 100, 0.6)', width: '90%' } }} center>
        <div className="modal-content">
          <br />
          <h2 className={styles.modalTitle}>Thanks to join our whitelist</h2>
          <br />
          {walletConnectionAuth?.wallet.icon ? (<img src={walletConnectionAuth?.wallet.icon} alt="Wallet Icon" />) : (<Avatar 
            size="50" 
            textSizeRatio={1.75} 
            name={user?.email || ''} 
            // facebook-id={'facebookId'}
            // md5Email={'md5Email'}
            // twitterHandle='twitterHandle'
            // instagramId='instagramId'
            // githubHandle='githubHandle'
            // skypeId='skypeId'
            alt={'user-profile-picture'}
            round={true}
            color='var(--secondary-color)'
          />)}
          
          <br />
          <br />
          <p style={{ fontSize: '12px' }}>
            Your Wallet Address:&nbsp;
            <b style={{ color: 'gold' }}>
              {walletConnectionAuth?.address
                ? `${walletConnectionAuth.address.slice(0, 6)}...${walletConnectionAuth.address.slice(-4)}`
                : 'Not connected'}
            </b>
            &nbsp;
          </p>
          <br />
          <p style={{ fontSize: '12px' }}>
            Your email is: &nbsp; 
            <b>{user?.email} ({user?.email ? (
              <span style={{ color: 'green' }}>Verified</span>
            ) : (
              <span style={{ color: 'red' }}>Unverified</span>
            )})</b>
            &nbsp;
          </p>


          {!user && (
            <div>
              <br />
              <div style={{ display: "flex", justifyContent: "space-between", gap: "25px" }}>
                <input className={styles.emailInput} style={{ height: '50px', marginTop: '15px' }} onChange={(e) => setCreateAccountEmail(e.target.value)} type="text" />
                <button className={styles.submitBtn} style={{ width: '100px', padding: '0 20px' }} onClick={() => {
                  signUpWithWallet(createAccountEmail, "abc123", walletConnectionAuth || null);
                }}>
                  Create <br/>  Account
                </button>
              </div>
            </div>
          )}
          
           {claimCoins && (
            <div className="wrap">
              <div className="wallet" id="wallet">
                <div className="icon">
                  <Image
                    src="/coins.webp"
                    alt="blockbeats-logo"
                    width={65}
                    height={65}
                    className='pulse-animation'
                  />
                  {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 458.5 458.5" fill="currentColor">
                    <path d="M336.7 344c-22 0-39.9-18-39.9-39.9V238c0-22 18-39.8 39.9-39.8h105.7v-65.9c0-17-13.8-30.7-30.7-30.7h-381c-17 0-30.7 13.7-30.7 30.7v277.6c0 17 13.8 30.8 30.7 30.8h381c17 0 30.7-13.8 30.7-30.8V344H336.7z" />
                    <path d="M440.5 220H336.7c-10 0-18 8-18 18V304c0 10 8 18 18 18h103.8c10 0 18-8 18-18V238c0-10-8-18-18-18zm-68 77a26 26 0 1 1 0-52 26 26 0 0 1 0 52zM358.2 45.2A39.7 39.7 0 0 0 308 20L152 71.6h214.9l-8.7-26.4z" />
                  </svg> */}
                </div>
                {coins.map((coin, index) => (
                  <div
                    key={index}
                    className="coin coin--animated"
                    style={{
                      '--coin-to-x': coin.x,
                      '--coin-to-y': coin.y,
                      '--coin-delay': coin.delay,
                    } as any}
                  />
                ))}
              </div>
            </div>)}
            
          {/* {!user?.emailVerified && (
            <>
              <hr />
              <br />
              <p className={`${styles.modalText} text-error`}>
                Por favor verifica tu <b>correo electrónico</b> para acceder a <b>todas las funciones</b>.
              </p>
              <br />
              <button onClick={() => { if (user) verifyEmail(user); }} className={styles.submitBtn}>Verificar correo electrónico</button>
              <br />
              <br />
              <br />
              <hr />
            </>
          )} */}
          {!isLoading ? (
            <>
              {user && (<button onClick={handleContinue} className={`${styles.submitBtn} ${!user?.email && 'disabled'}`} >LET'S BEGIN 🚀</button>)}
              <hr />
              <button 
                onClick={handleRevenue} 
                className={`${styles.submitBtn} ${!user?.email && 'disabled'}`} 
                style={{ backgroundColor: !user?.emailVerified ? 'transparent' : '#0ff', color: !user?.emailVerified ? 'white' : 'var(--primary-color)' }}>
                  Claim Coins! 💰
              </button>
              
            </>
          ) : (
            <>
              <Preloader />
            </>
          )}
          <br />
          <p className={`glitch ${styles.modalText}`} style={{ fontSize: '12px' }}>
            <b>We're excited to have you on board!</b>
          </p>
        </div>
      </Modal>

      <div id="parallax-layers">
        <canvas id="neon-canvas"></canvas>
        <div className="neon-glow"></div>
      </div>

    </main>
  );
};

export default Home;
