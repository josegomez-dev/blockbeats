import styles from '@/app/assets/styles/Footer.module.css'
import Link from 'next/link';
import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>  
        {/* <a data-text="josegomez.dev" className="glitch" href="https://www.linkedin.com/in/josealejandrogomezcastro/">josegomez.dev</a> */}
        {/* <Link href="https://www.linkedin.com/in/josealejandrogomezcastro/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin className={styles.icon} />
        </Link>
        <Link href="https://www.facebook.com/alegomez.cr/" target="_blank" rel="noopener noreferrer">
          <FaFacebook className={styles.icon} />
        </Link>
        <Link href="https://www.instagram.com/josegomez.dev/" target="_blank" rel="noopener noreferrer">
          <FaInstagram className={styles.icon} />
        </Link> */}
      </p>
      {/* <hr style={{ width: "300px", maxWidth: "100%", margin: '0 auto' }} /> */}
      <p>&copy; 2025 BlockBeats 3.0 <br /> All rights reserved.</p>
    </footer>
  )
}

export default Footer
