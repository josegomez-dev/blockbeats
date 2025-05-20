"use client";
import MusicDrawingPage from "@/components/MusicDrawingMachine";
import styles from "@/app/assets/styles/MainPage.module.css";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Avatar from "react-avatar";
import NeonSlider from "@/components/NeonSlider";

const DashboardPage = () => {
  const { user, role } = useAuth();

  useEffect(() => {
    toast.success(`Welcome to your dashboard!`, { icon: ( 
      <Avatar 
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
      />
    ) });
  }, []);

  return (
    <>
      <div className={`${styles.bannerContainer} ${styles.bannerContainerCustom}`}>
        <br />
        <br />
      </div>
      
      {/* <p>Your role is: {role}</p> */}
      <div style={{ zIndex: 1, position: "relative", margin: "0 auto", width: "100%", maxWidth: "800px" }}>
        <MusicDrawingPage />
      </div>
      <br />
      <br />
      <Footer />
    </>
  );
};

export default DashboardPage;
