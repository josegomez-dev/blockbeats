import React from 'react';
import styles from '@/app/assets/styles/MachineSelector.module.css';

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
    name: '🎨 Music Drawing Machine',
    description: 'Compose melodies as pixel-art.',
    icon: '🎼',
  },
  {
    id: 'drums',
    name: '🥁 Drum Designer',
    description: 'Design rhythmic beats & patterns.',
    icon: '🪘',
  },
  {
    id: 'ai',
    name: '🤖 AI Melody Generator',
    description: 'Let AI help you compose music.',
    icon: '🎹',
  },
  {
    id: 'synth',
    name: '🎛️ Synth Playground',
    description: 'Tweak oscillators & filters live.',
    icon: '🎚️',
  },
  {
    id: 'visualizer',
    name: '📊 Music Visualizer',
    description: 'Turn audio into stunning visuals.',
    icon: '🌈',
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
            <div className={styles.icon}>{machine.icon}</div>
            <h3 className={styles.name}>{machine.name}</h3>
            <p className={styles.description}>{machine.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MachineSelector;