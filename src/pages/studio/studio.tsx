import GalleryHeader from '../../components/layout/GalleryHeader';
import MachineSelector from '../../components/machines/MachineSelector';
import MusicDrawingMachine from '../../components/machines/musicDrawingMachine/MusicDrawingMachine';
import DrumDesigner from '../../components/machines/drumDesigner/DrumDesigner';
// import AIMelodyGenerator from ../../components/machines/AIMelodyGenerator';
import { useState } from 'react';
import styles from '@/app/assets/styles/pages/MusicStudio.module.css';
import Head from 'next/head';

const MusicStudioPage = () => {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  const renderMachine = () => {
    switch (selectedMachine) {
      case 'drawing':
        return <MusicDrawingMachine />;
      case 'drums':
        return <DrumDesigner />;
      // case 'voicemusic':
      //   return <MidiOscillatorRecorder />;
      // case 'ai':
      //   return <AIMelodyGenerator />;
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>BlockBeats Studio - Create Music with Drawing Machine & Drum Designer</title>
        <meta name="description" content="Create music NFTs with BlockBeats Studio. Use the Music Drawing Machine, Drum Designer, and MIDI controllers to compose unique musical pieces." />
        <meta name="keywords" content="BlockBeats studio, music creation, drawing machine, drum designer, MIDI, music composition, pixel music, music NFTs, Web3 music studio" />
        <meta property="og:title" content="BlockBeats Studio - Create Music with Drawing Machine & Drum Designer" />
        <meta property="og:description" content="Create music NFTs with BlockBeats Studio. Use the Music Drawing Machine, Drum Designer, and MIDI controllers to compose unique musical pieces." />
        <meta property="og:image" content="https://blockbeats-tau.vercel.app/images/logos/logo.webp" />
        <meta property="og:url" content="https://blockbeats-tau.vercel.app/studio" />
      </Head>
      <div className={styles.fullScreenStudio}>
      <br />
      <br />
      <br />
      <GalleryHeader title='BlockBeats Studio' />
      {!selectedMachine ? (
        <MachineSelector onSelect={setSelectedMachine} />
      ) : (
        renderMachine()
      )}
    </div>
    </>
  );
};

export default MusicStudioPage;
