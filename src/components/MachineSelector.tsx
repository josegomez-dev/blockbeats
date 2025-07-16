import React from 'react';
import styles from '@/app/assets/styles/MachineSelector.module.css';
import Image from 'next/image';

interface Machine {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface MachineSelectorProps {
  onSelect: (machineId: string) => void;
}

const machines: Machine[] = [
  {
    id: 'drawing',
    name: 'Music Drawing Machine',
    description: 'Compose 8Bit melodies as pixel-art with 🎹 MIDI compatibility.',
    icon: '/store/drumkit/synth-pixel.png',
  },
  {
    id: 'drums',
    name: 'Drums Designer Machine',
    description: 'Create custom drum patterns with a grid interface.',
    icon: '/store/drumkit/futurebass.png',
  },
  {
    id: 'voicemusic',
    name: 'Voice Music Machine',
    description: 'Generate melodies with your voice using AI.',
    icon: '/store/drumkit/voicemusicmachine.png',
  },
  {
    id: 'launchpad',
    name: 'Launchpad Machine',
    description: 'Trigger samples and loops with a grid interface.',
    icon: '/store/drumkit/trap.png',
  },
];

const MachineSelector: React.FC<MachineSelectorProps> = ({ onSelect }) => {
  return (
    <div className={styles.selectorWrapper}>
      <h2 className={styles.title}>🎛️ Select Your Music Machine</h2>
      <div className={styles.slider}>
        {machines.map((machine) => (
          <div
            key={machine.id}
            className={styles.machineCard}
            onClick={() => onSelect(machine.id)}
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
  );
};

export default MachineSelector;