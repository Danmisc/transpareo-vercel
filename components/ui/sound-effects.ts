"use client";

class SoundEffects {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private ringInterval: NodeJS.Timeout | null = null;

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5; // Master volume
            this.masterGain.connect(this.ctx.destination);

            // Resume context on user interaction if needed
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        } catch (e) {
            console.warn("Web Audio API not supported");
        }
    }

    // Click sound (soft tap)
    playClick() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(1200, t);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.06);
    }

    // Pop sound
    playPop() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    // Error sound
    playError() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(200, t);
        osc.type = 'sawtooth';

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.35);
    }

    // Satisfaction "Pop" for sending
    playSend() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Distinct "Pop" - fast frequency sweep
        osc.type = 'sine'; // Sine is cleaner than triangle for this
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.01); // Quick attack
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); // Fast decay

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    playSlideUp() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(800, t + 0.15); // Fast sweep up

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    // Soft ascending "Chime" for receiving
    playReceive() {
        // Alias to incoming message
        this.playIncomingMessage();
    }

    // Warm "Bubble" Chime (ascending notes)
    playIncomingMessage() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;

        // Note 1
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, t); // A4
        gain1.gain.setValueAtTime(0, t);
        gain1.gain.linearRampToValueAtTime(0.1, t + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(t);
        osc1.stop(t + 0.3);

        // Note 2 (slightly delayed)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, t + 0.1); // E5
        gain2.gain.setValueAtTime(0, t + 0.1);
        gain2.gain.linearRampToValueAtTime(0.1, t + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(t + 0.1);
        osc2.stop(t + 0.4);
    }

    // Recording start sound
    playStartRecord() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(880, t);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.18);
    }

    // Recording stop sound
    playStopRecord() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(440, t);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.18);
    }

    // Delete sound
    playDelete() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    // --- CALL SOUNDS ---

    // Outbound Ring (The "Tuuut... Tuuut..." you hear when calling)
    playOutboundRing() {
        this.stopRing();
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const playTone = () => {
            const t = this.ctx!.currentTime;
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.frequency.setValueAtTime(425, t);
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
            gain.gain.setValueAtTime(0.1, t + 1.4);
            gain.gain.linearRampToValueAtTime(0, t + 1.5);

            osc.connect(gain);
            gain.connect(this.masterGain!);
            osc.start(t);
            osc.stop(t + 1.6);
        };

        playTone();
        this.ringInterval = setInterval(playTone, 4500);
    }

    // Inbound Ringtone (Pleasant, looping melody)
    playRingtone() {
        this.stopRing();
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const playMelody = () => {
            const t = this.ctx!.currentTime;
            const notes = [
                { f: 523.25, d: 0.2, s: 0 },    // C5
                { f: 659.25, d: 0.2, s: 0.25 }, // E5
                { f: 783.99, d: 0.2, s: 0.5 },  // G5
                { f: 1046.50, d: 0.4, s: 0.75 },// C6
                { f: 783.99, d: 0.2, s: 1.5 },  // G5
                { f: 659.25, d: 0.2, s: 1.75 }, // E5
            ];

            notes.forEach(note => {
                const osc = this.ctx!.createOscillator();
                const gain = this.ctx!.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(note.f, t + note.s);

                gain.gain.setValueAtTime(0, t + note.s);
                gain.gain.linearRampToValueAtTime(0.1, t + note.s + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, t + note.s + note.d);

                osc.connect(gain);
                gain.connect(this.masterGain!);
                osc.start(t + note.s);
                osc.stop(t + note.s + note.d + 0.1);
            });
        };

        playMelody();
        this.ringInterval = setInterval(playMelody, 3500);
    }

    stopRing() {
        if (this.ringInterval) {
            clearInterval(this.ringInterval);
            this.ringInterval = null;
        }
    }

    // Call Connected (Quick harmonious chord)
    playCallConnect() {
        this.stopRing();
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

            osc.connect(gain);
            gain.connect(this.masterGain!);
            osc.start(t);
            osc.stop(t + 0.6);
        });
    }

    // Call Ended (Lower pitch, descending)
    playCallEnd() {
        this.stopRing();
        this.init();
        if (!this.ctx || !this.masterGain) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.35);
    }
}

export const soundEffects = new SoundEffects();
