import GalleryHeader from '@/components/GalleryHeader';
import MachineSelector from '@/components/machines/MachineSelector';
import MusicDrawingMachine from '@/components/machines/musicDrawingMachine/MusicDrawingMachine';
import DrumDesigner from '@/components/machines/drumDesigner/DrumDesigner';
// import AIMelodyGenerator from '@/components/machines/AIMelodyGenerator';
import { useState } from 'react';
import styles from '@/app/assets/styles/MusicStudio.module.css';
import MidiOscillatorRecorder from '@/components/machines/midiMachine/MidiOscillatorRecorder';

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
  );
};

export default MusicStudioPage;
