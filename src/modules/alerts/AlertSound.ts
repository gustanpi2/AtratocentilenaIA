let audioCtx: AudioContext | null = null;
let isPlaying = false;
let osc: OscillatorNode | null = null;
let gain: GainNode | null = null;

const getCtx = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playSiren = () => {
  if (isPlaying) return;
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    isPlaying = true;
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = "sawtooth";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    const startTime = ctx.currentTime;
    const sweep = () => {
      if (!osc || !isPlaying) return;
      const elapsed = ctx.currentTime - startTime;
      const freq = 600 + 400 * Math.sin(elapsed * 4 * Math.PI);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (isPlaying) requestAnimationFrame(sweep);
    };
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    sweep();
  } catch (e) {
    console.warn("AudioContext requires gesture", e);
    isPlaying = false;
  }
};

export const stopSiren = () => {
  isPlaying = false;
  try {
    osc?.stop();
    osc?.disconnect();
  } catch {}
  try {
    gain?.disconnect();
  } catch {}
  osc = null;
  gain = null;
};

export const playAlertBeep = () => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn("AudioContext requires gesture", e);
  }
};

export const isSirenPlaying = () => isPlaying;
