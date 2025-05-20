import styles from "@/app/assets/styles/MainPage.module.css";
import Image from "next/image";
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast';

import { useEffect, useState } from "react";

import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";

import { useAuth } from "@/context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { User } from "@/types/userTypes";
import Avatar from "react-avatar";
import Preloader from "@/components/Preloader";
import Link from "next/link";

const slides = [
  { id: "slide-1", title: "Crypto Jingle", img: "/item1.png" },
  { id: "slide-2", title: "Solidity Jingle", img: "/item2.png" },
  { id: "slide-3", title: "Love Song", img: "/item3.png" },
];

const Home = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { user, signUp, signIn, authenticated, verifyEmail } = useAuth();
  const router = useRouter();

  if (authenticated) {
    window.location.href = "/dashboard";
  }

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000); // auto-slide every 3s
    return () => clearInterval(interval);
  }, []);

  const prevIndex = (current - 1 + slides.length) % slides.length;
  const nextIndex = (current + 1) % slides.length;

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
        await signUp(email, "abc123");
        alert("Thanks for joining our whitelist!");
        setLoading(false);
        setIsModalOpen(true);
        setEmail("");
        return;
      }
      
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Error signing up. Please try again.");
      setLoading(false);
      return;
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    await signIn(email, "abc123");
  }

  const handleRevenue = () => {
    toast.loading("Loading revenue...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Revenue loaded successfully!");
    }, 2000);
  }

  return (
    <main className={styles.main}>
    
      <div className={`${styles.bannerContainer} ${styles.bannerCustomPositioning}`}>
        <p>
          It’s <span data-text="Web3" className="glitch">Web3</span>’s first community-powered <br /> <b>musical signature generator</b> — <b>mintable, shareable, tradable</b>... <br /><br />
        </p>
        <p>
          <span className={styles.typewriterLoop}>✨ We turn music into immutable art.</span> <br /><br />
        </p>
      </div>

      {/* 🚀 Neon Slider */}
      <div className={styles.sliderContainer}>
        <div className={styles.thumbnail + " " + styles.leftThumb}>
          <Image src={slides[prevIndex].img} alt="prev" width={100} height={100} />
        </div>

        <div className={styles.slider}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${
                index === current ? styles.activeSlide : styles.inactiveSlide
              }`}
            >
              <h3></h3>
              <p>{slide.title}</p>
              <Image src={slide.img} alt={slide.title} width={200} height={200} />
              
              <p><b>Price: </b> <span data-text="2.1Eth" className="glitch">2.1Eth</span> - <span style={{ color: 'gold' }}>$98.123k</span></p>
            </div>
          ))}
        </div>

        <div className={styles.thumbnail + " " + styles.rightThumb}>
          <Image src={slides[nextIndex].img} alt="next" width={100} height={100} />
        </div>

        <div className={styles.sliderControls}>
          <button onClick={handlePrev} className={styles.prevBtn}>
            &#60;
          </button>
          <button onClick={handleNext} className={styles.nextBtn}>
            &#62;
          </button>
        </div>
      </div>
      
      <br />
      <br />

      {/* 🚀 Neon Whitelist Banner */}
      <div className={styles.bannerContainer}>
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>🎧 Join <span data-text="BLOCKBEATS" className="glitch">BLOCKBEATS</span> whitelist</h2>
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
        <Image src={'/starknet-logo.svg'} alt={'metamask'} width={200} height={50} style={{ filter: 'invert(1) drop-shadow(0 0 0.3rem #ffffff70)' }} />
        &nbsp;
        &nbsp;
        &nbsp;
        <Link href={'https://josegomez-dev.github.io/MusicalPath/'} target={'_blank'}>
          <Image src={'/musicalpathlogo.png'} alt={'metamask'} width={100} height={70} style={{ marginBottom: '-5px' }} />
        </Link>
      </div>

      <br />
      <br />
      <br />
      <br />
      <br />
      <br />

      <Modal classNames={{ root: styles.modal }} open={isModalOpen} onClose={() => setIsModalOpen(false)} styles={{ modal: {  backdropFilter: 'blur(100px)', backgroundColor: 'rgba(20, 50, 100, 0.2)' } }} center>
        <div className="modal-content">
          <h2 className={styles.modalTitle}>¡Gracias por unirte a nuestra whitelist!</h2>
          <br />
          <Avatar 
            size="50" 
            textSizeRatio={1.75} 
            name={user?.email || 'Jhon Doe'} 
            // facebook-id={'facebookId'}
            // md5Email={'md5Email'}
            // twitterHandle='twitterHandle'
            // instagramId='instagramId'
            // githubHandle='githubHandle'
            // skypeId='skypeId'
            alt={'user-profile-picture'}
            round={true}
            color='var(--secondary-color)'
          />
          <br />
          <br />
          <p className={styles.modalText}>
            Tu correo electrónico es: &nbsp; 
            <b>{user?.email} ({user?.emailVerified ? (
              <span style={{ color: 'green' }}>Verificado</span>
            ) : (
              <span style={{ color: 'red' }}>No verificado</span>
            )})</b>
            &nbsp;
          </p>

          <br />
          <p data-text="¡Estamos emocionados de tenerte a bordo!" className={`glitch ${styles.modalText}`}>
            <b>¡Estamos emocionados de tenerte a bordo!</b>
          </p>
          <br />
          {!user?.emailVerified && (
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
          )}
          {!isLoading ? (
            <>
              <br />
              <button onClick={handleContinue} className={`${styles.submitBtn}`} >CONTINUAR 🚀</button>
              <br />
              <br />
              <button disabled={user?.emailVerified} onClick={handleRevenue} className={`${styles.submitBtn} ${!user?.emailVerified && 'disabled'}`} style={{ backgroundColor: 'transparent' }}>Reclama Bonos del Whitelist</button>
            </>
          ) : (
            <>
              <Preloader />
            </>
          )}
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
