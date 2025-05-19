"use client";
import MusicDrawingPage from "@/components/MusicDrawingMachine";
import styles from "@/app/assets/styles/MainPage.module.css";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";

const DashboardPage = () => {
  const { user, role } = useAuth();

  return (
    <>
      <br />
      <br />
      <div style={{ textAlign: "center", margin: "0 auto" }}>
        <h2>Welcome to your dashboard, {user?.email}!</h2>
        <br />
        <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}>
          <p>
            It’s <span data-text="Web3" className="glitch">Web3</span>’s first community-powered <br /> <b>musical signature generator</b> — <b>mintable, shareable, tradable</b>... <br /><br />
          </p>
        </div>
      </div>
      {/* <p>Your role is: {role}</p> */}
      <MusicDrawingPage />
      <br />
      <div style={{ textAlign: "center", margin: "0 auto", maxWidth: "400px", width: "100%" }}>
        <p>
          <span className={styles.typewriterLoop}>✨ We turn music into immutable art.</span> <br /><br />
        </p>
      </div>
      <br />
      <Footer />
    </>
  );
};

export default DashboardPage;
