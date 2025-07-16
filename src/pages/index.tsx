'use client';
import React, { useEffect, useState } from 'react';
import styles from './../app/assets/styles/LandingPage.module.css';
import stylesMain from "@/app/assets/styles/MainPage.module.css";
import { Modal } from 'react-responsive-modal';
import { FaRegNewspaper, FaTwitter, FaDiscord, FaYoutube, FaFacebook, FaMedium, FaTelegram, FaLinkedin, FaInstagram, FaTiktok } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import Image from 'next/image';

const LandingPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedEmbedHtml, setSelectedEmbedHtml] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

  const { user } = useAuth(); // Assuming you have a useAuth hook to get the user context

  const router = useRouter();

  const robotMessages = [
    'Howdy Web3 explorer!',
    'Ready to mint some NFTs?',
    'Feel the beat!',
    'Music meets blockchain!',
    'Let’s create magic',
    'Need help? I’m here!',
  ];

  const [randomMessage, setRandomMessage] = useState(robotMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRandomMessage(
        robotMessages[Math.floor(Math.random() * robotMessages.length)]
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);


  const handleOpenModal = (embedHtml: string | undefined, fallbackVideoUrl: string, title: string, description: string) => {
    if (embedHtml) {
      setSelectedEmbedHtml(embedHtml);
    } else {
      const embedUrl = fallbackVideoUrl.replace('watch?v=', 'embed/');
      setSelectedEmbedHtml(
        `<iframe width="560" height="315" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      );
    }
    setSelectedTitle(title);
    setSelectedDescription(description);
    setOpen(true);
  };

  useEffect(() => {
    if (user && user.uid) {
      router.push('/dashboard');
    }
  }
  , [user, router]);

  const services = [
    // {
    //   title: 'Holographic Experiences',
    //   description: 'Deliver immersive holographic live performances.',
    //   icon: '/icons/1.png',
    // },
    {
      title: 'Feel the Music',
      description: 'Innovative haptic feedback devices that allow users to feel music through vibrations.',
      icon: '/icons/5.png',
    },
    {
      title: 'Drone Performances',
      description: 'Coordinate drone-based visual performances for your music.',
      icon: '/icons/4.png',
    },
    {
      title: 'NFT Minting Machines',
      description: 'Deploy interactive minting machines for luxury NFT experiences.',
      icon: '/icons/2.png',
    },
    {
      title: 'Smart Light Shows',
      description: 'Synchronize light installations with your music NFTs.',
      icon: '/icons/3.png',
    },
  ];

  const teamMembers = [
    {
      name: 'José Alejandro Gómez Castro',
      role: 'Founder, CTO & Creative Director',
      avatar: '/team/ale.png',
      socialMediaLinks: [
        { url: 'https://www.linkedin.com/in/josealejandrogomezcastro/', icon: <FaLinkedin /> },
        { url: 'https://josegomezdev.medium.com/', icon: <FaMedium /> },
        { url: 'https://www.youtube.com/@musiqueandola', icon: <FaYoutube /> },
      ],
      extraLinks: [
        { url: 'https://x.com/josegomez_dev', icon: <FaTwitter /> },
        { url: 'https://discord.gg/hrjuWATX', icon: <FaDiscord /> },
        { url: 'https://t.me/josegomezdev', icon: <FaTelegram /> },
      ],
      socialLinks: [
        { url: 'https://www.facebook.com/alegomez.cr', icon: <FaFacebook /> },
        { url: 'https://www.instagram.com/alegomez.cr/', icon: <FaInstagram /> },
        { url: 'https://www.tiktok.com/@musiqueandola', icon: <FaTiktok /> },
      ],
    },
    {
      name: 'Ricardo Patino',
      role: 'Operations Manager',
      avatar: '/team/richard.png',
      socialMediaLinks: [
        { url: 'https://x.com/Ricardo15727088', icon: <FaTwitter /> },
        { url: 'https://www.linkedin.com/in/ricardopatino1/', icon: <FaLinkedin /> },
        { url: 't.me/RachaPatino', icon: <FaTelegram /> },
      ],
      extraLinks: [
        { url: 'https://www.facebook.com/ricardo.p.jimenez.5', icon: <FaFacebook /> },
        { url: 'https://www.instagram.com/racha_patino?igsh=dmIya3R5dHQxdnN0', icon: <FaInstagram /> },
        { url: 'https://www.youtube.com/@rickpatinor', icon: <FaYoutube /> },
      ],
      socialLinks: []
    },
    {
      name: 'Pamela Sanchez',
      role: 'Accessibility Specialist',
      avatar: '/team/pame.png',
      socialMediaLinks: [
        { url: 'https://www.facebook.com/pamela.sanchez.771282', icon: <FaFacebook className={styles.twitterIcon} /> },
        { url: 'https://www.linkedin.com/in/wensdy-s%C3%A1nchez-carranza-ing-sistemas/', icon: <FaLinkedin className={styles.discordIcon} /> },
        { url: 'https://t.me/PameSC', icon: <FaTelegram /> },
      ],
      extraLinks: [
      ],
      socialLinks: []
    },
    {
      name: 'Luis Elias Gomez Castro',
      role: 'Audience Engagement',
      avatar: '/team/elias.png',
      socialMediaLinks: [
        { url: 'https://www.facebook.com/eliasdevcr', icon: <FaFacebook className={styles.twitterIcon} /> },
        { url: 'https://www.linkedin.com/in/eliasgomezcastro/', icon: <FaLinkedin className={styles.discordIcon} /> },
      ],
      extraLinks: [ 
        { url: 'https://discord.gg/yesduet', icon: <FaDiscord/> },
        { url: 'https://t.me/yesduet/', icon: <FaTelegram /> },
      ],
      socialLinks: []
    },
  ];


  const sponsors = [
  { image: '/1.png', url: 'https://josegomez-dev.github.io/catarsismusical/' },
  { image: '/dojo.png', url: 'https://dojoengine.org' },
  { image: '/download.jpeg', url: 'https://starknet.io' },
];


  const newsItems = [
    {
      title: 'Inclusive Music Experiences',
      description: 'Developing new tools for inclusive music experiences for the visually and hearing impaired.',
      videoUrl: 'https://www.youtube.com/watch?v=aSXn2tCq9LE',
      previewImage: 'https://img.youtube.com/vi/aSXn2tCq9LE/maxresdefault.jpg',
    },
    {
      title: '🎵 Drones for Art, Not War | BlockBeats NFT Protest Collection for Peace',
      description: 'Inspired by recent tragic events in Kyiv. 🎨✨',
      videoUrl: 'https://www.youtube.com/watch?v=ZKzrGB9VxBM',
      previewImage: 'https://img.youtube.com/vi/ZKzrGB9VxBM/hqdefault.jpg',
    },
    {
      title: 'Drone NFT Shows',
      description: 'Sky-based drone shows synchronised with music and visual NFT art.',
      videoUrl: 'https://www.youtube.com/watch?v=3SxxMuSFfEo',
      previewImage: 'https://img.youtube.com/vi/3SxxMuSFfEo/hqdefault.jpg',
    },
    // {
    //   title: 'Feel the Music',
    //   description: 'Innovative haptic feedback devices that allow users to feel music through vibrations.',
    //   videoUrl: 'https://www.youtube.com/watch?v=JMBUPRZ3cYk',
    //   previewImage: 'https://img.youtube.com/vi/JMBUPRZ3cYk/maxresdefault.jpg',
    // },
    // {
    //   title: 'Smart Light Buildings',
    //   description: 'Service to create artistic light shows on buildings using musical NFTs.',
    //   videoUrl: 'https://www.youtube.com/watch?v=-adNKTEbynI',
    //   previewImage: 'https://img.youtube.com/vi/-adNKTEbynI/maxresdefault.jpg',
    // },
    {
      title: 'NFT Mint Machines',
      description: 'Deploying Vegas-style interactive minting machines for luxury NFT experiences.',
      videoUrl: 'https://www.youtube.com/watch?v=VmtUS50OEA8',
      previewImage: 'https://img.youtube.com/vi/VmtUS50OEA8/maxresdefault.jpg',
    },
    // {
    //   title: 'Holographic Live Concerts',
    //   description: 'Projections and experiences for live events with holographic technology.',
    //   videoUrl: 'https://www.youtube.com/watch?v=xm516bJeQOg',
    //   previewImage: 'https://img.youtube.com/vi/xm516bJeQOg/maxresdefault.jpg',
    //   embedYoutube:
    //     '<iframe width="560" height="315" src="https://www.youtube.com/embed/xm516bJeQOg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
    // },
  ];


  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>🤖 Welcome... </h1>
          <h2 className={styles.typewriter} style={{fontSize: '20px'}}>The Future of Music & Art NFTs</h2>
          <br />
          <span className="glitch">Create, share, and experience music like never before — powered by Web3.</span>
          <br />
          <br />
          <button className={stylesMain.submitBtn} onClick={() => window.location.replace('/login')}>🖼️ CREATE & 🎹 PLAY </button>
          <Link href="https://joses-organization-73.gitbook.io/blockbeats-3.0" target="_blank" rel="noopener noreferrer">
            <button  style={{ animation: 'none', background: 'transparent', color: 'white' }} className={stylesMain.submitBtn}>📑 DOCS</button>
          </Link>

          <ul className={styles.socialMediaLinks}>
            <li>
              <a href="https://x.com/blockbeats3pt0" target="_blank" rel="noopener noreferrer">
                <FaTwitter className={styles.twitterIcon} />
              </a>
            </li>
            <li>
              <a href="https://discord.gg/hrjuWATX" target="_blank" rel="noopener noreferrer">
                <FaDiscord className={styles.discordIcon} />
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@BlockBeats3.0" target="_blank" rel="noopener noreferrer">
                <FaYoutube className={styles.youtubeIcon} />
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/profile.php?id=61576616834732" target="_blank" rel="noopener noreferrer">
                <FaFacebook className={styles.facebookIcon} />
              </a>
            </li>
            <li>
              <a href="https://medium.com/@blockbeatscr" target="_blank" rel="noopener noreferrer">
                <FaMedium className={styles.mediumIcon} />
              </a>
            </li>
            <li>
              <a href="https://t.me/block_beats_bot/blockbeats" target="_blank" rel="noopener noreferrer">
                <FaTelegram className={styles.telegramIcon} />
              </a>
            </li>
          </ul>

          {/* <Link href="edublockbeats" target="_blank" rel="noopener noreferrer">
            <button  style={{ animation: 'none', background: 'transparent', color: 'white' }} className={stylesMain.submitBtn}>👩🏼‍🏫 EDU-BLOCKBEATS</button>
          </Link> */}

          <br />
          <img className={styles.character2} src="/avatar/phase-5.webp" style={{ width: '200px', height: 'auto', marginBottom: '-106px'  }} alt="BlockBeats Robot"  />
          <img className={styles.character3} src="/avatar/phase-4.webp" style={{ width: '200px', height: 'auto', marginBottom: '-120px'  }} alt="BlockBeats Robot"  />
          <img className={styles.character1} src="/avatar/phase-6.webp" style={{ width: '200px', height: 'auto', marginBottom: '-120px'  }} alt="BlockBeats Robot"  />
        </div>
      </section>
      <hr />


    {/* Robot Character */}
    <div className={`${styles.robotContainer}`}>
      <img src="/avatar/phase-1.webp" alt="BlockBeats Robot" className={styles.robotImage} />
      <div className={`${styles.robotSpeech}`}>
        {randomMessage}
      </div>
    </div>


      {/* Vision & Mission Section */}
      <section className={styles.visionMissionSection}>
        <h2>
            <Image
              src="/logo.webp"
              alt="BlockBeats Logo"
              width={80}
              height={80}
              style={{ verticalAlign: 'middle' }}
            />
            About &nbsp;
           <span className='glitch'>BlockBeats 3.0</span> LAUNCHPAD</h2>
        <div className={styles.visionMissionContent}>
          <div className={styles.visionBlock}>
            <h3>🎯 Vision</h3>
            <p>
              To become the leading platform for inclusive, creative, and immersive musical experiences on the Web3 space — where music, visual art, and technology converge to empower both artists and audiences worldwide.
            </p>
          </div>
          <div className={styles.missionBlock}>
            <h3>🚀 Mission</h3>
            <p>
              <span style={{ color: 'var(--neon-color)'}}>BlockBeats 3.0</span> is committed to democratizing access to music creation and NFT monetization, fostering innovation in audiovisual expression, and enabling new forms of interaction through cutting-edge technologies.
            </p>
          </div>
        </div>

        <br />
        <br />
        <br />
        <h2>🌀 Key FEATURES</h2>
        
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div className={`${styles.serviceItem}`} key={index}>
              <div className={styles.serviceIconWrapper}>
                <img src={service.icon} alt={service.title} className={styles.serviceIcon} />
              </div>
              {/* <h3>{service.title}</h3>
              <p>{service.description}</p> */}
            </div>
          ))}
        </div>
      </section>

<hr />

<section className={styles.keyFeaturesSection}>
  
      <div className={styles.featureGrid}>
        {/* Left Column: Text & Buttons */}
        <div className={styles.featureText}>
          <h2 className="glitch">UpComing Events...</h2>
          <h3>EDU BlockBeats & Real Robot to MIDI Keyboard and touch screen.</h3>
          <p>
            BlockBeats is committed to <strong>democratizing access</strong> to music creation and NFT monetization,
            fostering innovation in audiovisual expression, and enabling new forms of interaction through cutting-edge technologies such as:
          </p>
          <ul className={styles.featureList}>
            <li>🎵 Blockchain-based Music Drawing Machine for schools</li>
            <li>🤖 Interactive real robot connected to MIDI keyboard and touch screen</li>
            {/* <li>🚀 Drone shows for Premium Top Collections in real-world events</li> */}
            {/* <li>🌈 Smart light systems and holographic projections for immersive experiences</li> */}
          </ul>
          <div className={styles.featureActions}>
            {/* <button className={styles.ctaButton}>🚸 Launch Tutorials & Quick Guides</button> */}
            <button onClick={() => location.replace('https://joses-organization-73.gitbook.io/blockbeats-3.0/edu-blockbeats-3.0')} className={styles.ctaButton}>🚸 Check EDU BlockBeats DOCS</button>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className={styles.featureImage}>
          <Image
            src="/edu.png"
            alt="EDU BlockBeats"
            width={500}
            height={500}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '1rem',
              boxShadow: '0 0 25px rgba(255,255,255,0.2)',
            }}
          />
        </div>
      </div>
    </section>

      
    {/* News Section */}
    <hr />
    <section className={styles.newsSection}>
      <h2><span className='glitch'>🌎 BlockBeats NEWS</span></h2>
      <div className={styles.newsGrid}>
        {newsItems.map((item, index) => (
          <div
            className={styles.newsItem}
            key={index}
            onClick={() => handleOpenModal(undefined, item.videoUrl, item.title, item.description)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.newsIconPreview} style={{ backgroundImage: `url(${item.previewImage})` }}>
              <FaRegNewspaper className={styles.newsIconReact} />
              <div className={styles.previewOverlay}>▶️ Preview</div>
            </div>

            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
    
    {/* Welcome Section */}
    <section className={styles.welcomeSection}>
      <div className={styles.imageContainer}>
        <Image
          src="/co-create-music.png"
          alt="BlockBeats Launchpad"
          width={500}
          height={500}
          style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '1rem', boxShadow: '0 0 25px rgba(255,255,255,0.2)' }}
        />  
      </div>
    </section>

    {open && (
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeOnEsc={true}
        closeOnOverlayClick={true}
        showCloseIcon={false}
        center
        classNames={{
          modal: open ? stylesMain.modal : stylesMain.modalClosed,
          // overlay: stylesMain.modalOverlay,
          // closeButton: stylesMain.closeButton,
        }}
        styles={{ modal: { width: '100%' } }}
      >
        {selectedEmbedHtml && (
          <div>
              <div style={{ padding: '25px', textAlign: 'center' }}>
                <span className={`${stylesMain.modalTitle} glitch`} data-text={selectedTitle} style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {selectedTitle}
                </span>
                <br />
                <br />
                <p style={{ width: '200px', margin: '0 auto', fontSize: '12px' }}>
                  {selectedDescription}
                </p>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                    <div style="width: 100%; height: 100%;">
                      ${selectedEmbedHtml}
                    </div>
                  `,
                }}
              />
              <div style={{ textAlign: 'center' }}>
                <button className={stylesMain.submitBtn} onClick={() => setOpen(false)} style={{ width: '150px' }}>
                  Go Back
                </button>
              </div>
          </div>
        )}
      </Modal>
    )}
      
    </div>
  );
};

export default LandingPage;
