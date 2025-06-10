'use client';
import React, { useEffect, useState } from 'react';
import styles from './../app/assets/styles/LandingPage.module.css';
import stylesMain from "@/app/assets/styles/MainPage.module.css";
import Footer from '@/components/Footer';
import { Modal } from 'react-responsive-modal';
import { FaRegNewspaper } from 'react-icons/fa';

const LandingPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedEmbedHtml, setSelectedEmbedHtml] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

  const robotMessages = [
    'Howdy Web3 explorer!',
    'Ready to mint some NFTs?',
    'Feel the beat!',
    'Music meets blockchain 🎵',
    'Let’s create magic 🚀',
    'Need help? I’m here!',
  ];

  const [randomMessage, setRandomMessage] = useState(robotMessages[0]);
  const [isSticky, setIsSticky] = useState(false);

  // Rotate messages every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setRandomMessage(
        robotMessages[Math.floor(Math.random() * robotMessages.length)]
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll to stick robot
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 400); // Adjust threshold
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const services = [
    {
      title: 'Holographic Experiences',
      description: 'Deliver immersive holographic live performances.',
      icon: '/icons/1.png',
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
    {
      title: 'Drone Performances',
      description: 'Coordinate drone-based visual performances for your music.',
      icon: '/icons/4.png',
    },
    {
      title: 'Feel the Music',
      description: 'Innovative haptic feedback devices that allow users to feel music through vibrations.',
      icon: '/icons/5.png',
    },
  ];


  const teamMembers = [
    {
      name: 'José Alejandro Gómez Castro',
      role: 'Founder, CTO & Creative Director',
      avatar: '/team/ale.png',
    },
    {
      name: 'Ricardo Patino',
      role: 'Operations Manager & Partnerships Lead',
      avatar: '/team/richard.png',
    },
    {
      name: 'Pamela Sanchez',
      role: 'Accessibility Specialist',
      avatar: '/team/pame.png',
    },
    {
      name: 'Luis Elias Gomez Castro',
      role: 'Audience Engagement',
      avatar: '/team/elias.png',
    },
  ];

  const sponsors = [
    '/starknet-logo.svg',
    '/metamask.webp',
    '/musicalpathlogo.webp',
    '/starknet-logo.svg',
    '/metamask.webp',
    '/musicalpathlogo.webp',
  ];



  const newsItems = [
    {
      title: 'Holographic Live Concerts',
      description: 'Projections and experiences for live events with holographic technology.',
      videoUrl: 'https://www.youtube.com/watch?v=xm516bJeQOg',
      previewImage: 'https://img.youtube.com/vi/xm516bJeQOg/maxresdefault.jpg',
      embedYoutube:
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/xm516bJeQOg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
    },
    {
      title: 'Smart Light Buildings',
      description: 'Service to create artistic light shows on buildings using musical NFTs.',
      videoUrl: 'https://www.youtube.com/watch?v=-adNKTEbynI',
      previewImage: 'https://img.youtube.com/vi/-adNKTEbynI/maxresdefault.jpg',
    },
    {
      title: 'Vegas NFT Mint Machines',
      description: 'Deploying Vegas-style interactive minting machines for luxury NFT experiences.',
      videoUrl: 'https://www.youtube.com/watch?v=VmtUS50OEA8',
      previewImage: 'https://img.youtube.com/vi/VmtUS50OEA8/maxresdefault.jpg',
    },
    {
      title: 'Drone NFT Shows',
      description: 'Sky-based drone shows synchronised with music and visual NFT art.',
      videoUrl: 'https://www.youtube.com/watch?v=3SxxMuSFfEo',
      previewImage: 'https://img.youtube.com/vi/3SxxMuSFfEo/hqdefault.jpg',
    },
    {
      title: 'Feel the Music',
      description: 'Innovative haptic feedback devices that allow users to feel music through vibrations.',
      videoUrl: 'https://www.youtube.com/watch?v=JMBUPRZ3cYk',
      previewImage: 'https://img.youtube.com/vi/JMBUPRZ3cYk/maxresdefault.jpg',
    },
    {
      title: 'Inclusive Music Experiences',
      description: 'Developing new tools for inclusive music experiences for the visually and hearing impaired.',
      videoUrl: 'https://www.youtube.com/watch?v=aSXn2tCq9LE',
      previewImage: 'https://img.youtube.com/vi/aSXn2tCq9LE/maxresdefault.jpg',
    },
  ];


  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>🎵 BlockBeats </h1>
          <h2 className={styles.typewriter} style={{fontSize: '20px'}}>The Future of Music & Art NFTs</h2>

          <br />
          <span data-text="Create, share, and experience music like never before — powered by Web3." className="glitch">Create, share, and experience music like never before — powered by Web3.</span>
          <br />
          <br />
          <img className={styles.character2} src="/avatar/phase-5.webp" style={{ width: '200px', height: 'auto', marginBottom: '-120px'  }} alt="BlockBeats Robot"  />
          <img className={styles.character3} src="/avatar/phase-4.webp" style={{ width: '200px', height: 'auto', marginBottom: '-120px'  }} alt="BlockBeats Robot"  />
          <img className={styles.character1} src="/avatar/phase-6.webp" style={{ width: '200px', height: 'auto', marginBottom: '-120px'  }} alt="BlockBeats Robot"  />
        </div>
      </section>


    {/* Robot Character */}
    <div className={`${styles.robotContainer} ${isSticky ? styles.sticky : ''}`}>
      <img src="/avatar/phase-1.webp" alt="BlockBeats Robot" className={styles.robotImage} />
      <div className={`${styles.robotSpeech} ${isSticky ? styles.speechHidden : ''}`}>
        {randomMessage}
      </div>
    </div>




      {/* Services Section */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div className={styles.serviceItem} key={index}>
              <div className={styles.serviceIconWrapper}>
                <img src={service.icon} alt={service.title} className={styles.serviceIcon} />
              </div>
              {/* <h3>{service.title}</h3>
              <p>{service.description}</p> */}
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className={styles.visionMissionSection}>
        <h2>🌟 Our Vision & Mission</h2>
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
              BlockBeats is committed to democratizing access to music creation and NFT monetization, fostering innovation in audiovisual expression, and enabling new forms of interaction through cutting-edge technologies such as blockchain, holography, smart light systems, and drone-based performances.
            </p>
          </div>
        </div>
      </section>

      
      {/* News Section */}
      <section className={styles.newsSection}>
        <h2>🚀 Commercial Projections & Opportunities</h2>
        <br />
        <br />
        <div className={styles.newsGrid}>
          {newsItems.map((item, index) => (
            <div
              className={styles.newsItem}
              key={index}
              onClick={() => handleOpenModal(item.embedYoutube, item.videoUrl, item.title, item.description)}
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

      {/* Team Section */}
      <section className={styles.teamSection}>
        <h2>🎵 Meet the Team</h2>
        <div className={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <div className={styles.teamMember} key={index}>
              <div className={styles.avatarWrapper}>
                <img src={member.avatar} alt={member.name} className={styles.avatar} />
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Parallax + Sponsors Section */}
      <section className={styles.parallaxSponsorsSection}>
        <div className={styles.parallaxOverlay}>
          <h2>🎼 Powered by our Sponsors</h2>
          <div className={styles.sponsorsSlider}>
            <div className={styles.sliderTrack}>
              {sponsors.concat(sponsors).map((sponsor, index) => (
                <div className={styles.slide} key={index}>
                  <img src={sponsor} alt={`Sponsor ${index + 1}`} />
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* Footer */}
      <Footer />

      {/* Video Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        center
        classNames={{ modal: stylesMain.modal }}
        styles={{
          modal: {
            width: '100%',
            height: 'auto',
            padding: 50,
            backdropFilter: 'blur(50px)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {selectedEmbedHtml && (
          <>
            <div className={stylesMain.modalContent}>
              <h2 className={stylesMain.modalTitle}>Video Preview</h2>
              <p className={stylesMain.modalText}>
                Watch the video preview of this feature. Click outside to close.
              </p>
            </div>
            <br />
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                textAlign: 'center',
              }}
              dangerouslySetInnerHTML={{
                __html: `
                  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                    ${selectedEmbedHtml}
                  </div>
                `,
              }}
            />
            {selectedTitle && (
              <div style={{ marginTop: '-50px' }}>
                <h2 className={`${stylesMain.modalTitle} glitch`} data-text={selectedTitle}>
                  {selectedTitle}
                </h2>
                <p className={stylesMain.modalText}>{selectedDescription}</p>
                <br />
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default LandingPage;
