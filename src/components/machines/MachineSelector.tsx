import React from 'react';
import styles from '@/app/assets/styles/components/MachineSelector.module.css';
import Image from 'next/image';
import Footer from '../layout/Footer';

interface Machine {
  id: string;
  name: string;
  description: string;
  icon: string;
  ready: boolean;
}

interface MachineSelectorProps {
  onSelect: (machineId: string) => void;
}

const machines: Machine[] = [
  {
    id: 'drawing',
    name: 'Music Drawing Machine',
    description: 'Compose 8Bit melodies as pixel-art with 🎹 MIDI compatibility.',
    icon: '/images/store/drumkit/synth-pixel.png',
    ready: true,
  },
  {
    id: 'drums',
    name: 'Drums Designer Machine',
    description: 'Create custom drum patterns with a grid interface.',
    icon: '/images/store/drumkit/futurebass.png',
    ready: true,
  },
  {
    id: 'voicemusic',
    name: 'Voice Music Machine',
    description: 'Generate melodies with your voice using AI.',
    icon: '/images/store/drumkit/voicemusicmachine.png',
    ready: false,
  },
  {
    id: 'launchpad',
    name: 'Launchpad Machine',
    description: 'Trigger samples and loops with a grid interface.',
    icon: '/images/store/drumkit/trap.png',
    ready: false,
  },
];

const MachineSelector: React.FC<MachineSelectorProps> = ({ onSelect }) => {
  return (
    <>
      <div className={styles.selectorWrapper}>
        <h2 className={`box`}>🎛️ Select Your&nbsp;<strong className='glitch'>BlockBeats</strong>&nbsp; <strong style={{ color: 'var(--clr-3)'}}>Music Machine</strong></h2>
        <div className={styles.slider}>
          {machines.map((machine) => (
            <div
              key={machine.id}
              className={`${styles.machineCard} ${!machine.ready ? styles.notReady : ''}`}
              onClick={() => machine.ready && onSelect(machine.id)}
            >
              <Image
                src={machine.icon}
                alt={machine.name}
                width={200}
                height={200}
              />
              <h3 className={styles.name}>{machine.name}</h3>
              <p className={styles.description}>{machine.description}</p>
            </div>

          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MachineSelector;