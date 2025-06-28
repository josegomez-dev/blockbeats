import { useEffect, useRef } from 'react';

type MidiInputOptions = {
  onMidiNote: (note: number) => void;
  onDeviceConnect?: (deviceName: string) => void;
  onDeviceDisconnect?: () => void;
};

export const useMidiInput = ({
  onMidiNote,
  onDeviceConnect,
  onDeviceDisconnect,
}: MidiInputOptions) => {
  const connectedDevices = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      console.warn("⚠️ Web MIDI API is not supported in this browser.");
      return;
    }

    navigator.requestMIDIAccess({ sysex: false })
      .then((midiAccess) => {
        const handleMIDIMessage = (event: MIDIMessageEvent) => {
          if (event.data) {
            const [command, note, velocity] = Array.from(event.data);
            if (command === 144 && velocity > 0) {
              console.log(`🎹 MIDI Note ON: ${note}, Velocity: ${velocity}`);
              onMidiNote(note);
            }
          }
        };

        const bindInput = (input: MIDIInput) => {
          if (!connectedDevices.current.has(input.id)) {
            console.log(`✅ MIDI Device Connected: ${input.name}`);
            input.onmidimessage = handleMIDIMessage;
            connectedDevices.current.add(input.id);
            onDeviceConnect?.(input.name || "Unknown MIDI Device");
          }
        };

        const unbindInput = (input: MIDIInput) => {
          console.log(`❌ MIDI Device Disconnected: ${input.name}`);
          connectedDevices.current.delete(input.id);
          input.onmidimessage = null;
          onDeviceDisconnect?.();
        };

        // Initial device bindings
        Array.from(midiAccess.inputs.values()).forEach((input) => {
          bindInput(input);
        });

        // Handle device connections/disconnections
        midiAccess.onstatechange = (event) => {
          const port = event.port;
          if (port && port.type === 'input') {
            if (port.state === 'connected') {
              bindInput(port as MIDIInput);
            } else if (port.state === 'disconnected') {
              unbindInput(port as MIDIInput);
            }
          }
        };
      })
      .catch((err) => {
        console.error("🚫 MIDI Access Error:", err);
      });
  }, [onMidiNote, onDeviceConnect, onDeviceDisconnect]);
};
