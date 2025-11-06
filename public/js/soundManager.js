// Sound Manager - Generates sound effects using Web Audio API
class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      // Create Audio Context (with fallback for older browsers)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  // Resume audio context (needed for some browsers)
  resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Play a beep sound
  playBeep(frequency = 440, duration = 0.1, volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    this.resumeContext();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Correct answer sound (cheerful ascending tones)
  playCorrect() {
    if (!this.enabled) return;
    this.playBeep(523.25, 0.1, 0.3); // C
    setTimeout(() => this.playBeep(659.25, 0.1, 0.3), 100); // E
    setTimeout(() => this.playBeep(783.99, 0.15, 0.3), 200); // G
  }

  // Incorrect answer sound (descending tone)
  playIncorrect() {
    if (!this.enabled) return;
    this.playBeep(400, 0.2, 0.2);
    setTimeout(() => this.playBeep(300, 0.3, 0.2), 150);
  }

  // Join game sound
  playJoin() {
    if (!this.enabled) return;
    this.playBeep(440, 0.1, 0.2);
    setTimeout(() => this.playBeep(554.37, 0.15, 0.2), 100);
  }

  // Leave game sound
  playLeave() {
    if (!this.enabled) return;
    this.playBeep(554.37, 0.1, 0.2);
    setTimeout(() => this.playBeep(440, 0.15, 0.2), 100);
  }

  // Game start countdown
  playCountdown() {
    if (!this.enabled) return;
    this.playBeep(440, 0.1, 0.3);
  }

  // Game start sound
  playGameStart() {
    if (!this.enabled) return;
    this.playBeep(523.25, 0.1, 0.3);
    setTimeout(() => this.playBeep(659.25, 0.1, 0.3), 100);
    setTimeout(() => this.playBeep(783.99, 0.1, 0.3), 200);
    setTimeout(() => this.playBeep(1046.50, 0.2, 0.3), 300);
  }

  // Game end/victory sound
  playVictory() {
    if (!this.enabled) return;
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 0.15, 0.25), i * 80);
    });
  }

  // New question sound
  playNewQuestion() {
    if (!this.enabled) return;
    this.playBeep(659.25, 0.1, 0.25);
  }

  // Chat message sound
  playChatMessage() {
    if (!this.enabled) return;
    this.playBeep(600, 0.05, 0.15);
  }

  // Timer warning (last 5 seconds)
  playTimerWarning() {
    if (!this.enabled) return;
    this.playBeep(800, 0.1, 0.2);
  }

  // Click/button sound
  playClick() {
    if (!this.enabled) return;
    this.playBeep(400, 0.05, 0.1);
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Set enabled state
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// Export for use in other scripts
window.SoundManager = SoundManager;
