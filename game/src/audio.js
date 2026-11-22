// Synthesized sounds: short WebAudio blips, no audio files. The game plays
// fine muted; every call is guarded so a missing AudioContext never breaks
// the game.
let ctx = null;

function ensure() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    return null;
  }
  return ctx;
}

function blip(freq, dur, type, gain, when = 0) {
  const ac = ensure();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') void ac.resume();
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    // Sound is garnish; never let it break the game.
  }
}

export const sfx = {
  coin() {
    blip(1320, 0.09, 'sine', 0.12);
    blip(1760, 0.12, 'sine', 0.1, 0.07);
  },
  grab() {
    blip(660, 0.12, 'triangle', 0.14);
    blip(880, 0.12, 'triangle', 0.14, 0.09);
    blip(1320, 0.22, 'triangle', 0.14, 0.18);
  },
  tick() {
    blip(220, 0.06, 'square', 0.05);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.22, 'triangle', 0.14, i * 0.11));
  },
  lose() {
    [392, 330, 262, 196].forEach((f, i) => blip(f, 0.25, 'sawtooth', 0.07, i * 0.13));
  },
};

export function unlockAudio() {
  ensure();
}
