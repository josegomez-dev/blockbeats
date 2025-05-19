"use client";
import MusicDrawingPage from "@/components/MusicDrawingMachine";
import styles from "@/app/assets/styles/MainPage.module.css";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Avatar from "react-avatar";

const DashboardPage = () => {
  const { user, role } = useAuth();

  useEffect(() => {
    toast.success(`Welcome to your dashboard!`, { icon: ( 
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
    ) });
  }, []);

  return (
    <>
      <br />
      <br />
      <div style={{ textAlign: "center", margin: "0 auto" }}>
        <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}>
          <p>
            It’s <span data-text="Web3" className="glitch">Web3</span>’s first community-powered <br /> <b>musical signature generator</b> — <b>mintable, shareable, tradable</b>... <br /><br />
          </p>
        </div>
      </div>
      {/* <p>Your role is: {role}</p> */}
      <MusicDrawingPage />
      <br />
      <Footer />
    </>
  );
};

export default DashboardPage;
