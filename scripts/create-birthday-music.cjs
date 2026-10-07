const fs = require("fs");
const path = require("path");

// Original composition: sixteen 4/4 bars at 96 BPM, circular synthesis.
const output = process.argv[2];
if (!output) throw new Error("Pass the output WAV path.");
const sampleRate = 22050;
const bpm = 96;
const beat = 60 / bpm;
const bars = 16;
const duration = bars * 4 * beat;
const sampleCount = Math.round(duration * sampleRate);
const left = new Float64Array(sampleCount);
const right = new Float64Array(sampleCount);
const tau = 2 * Math.PI;
const midiHz = (n) => 440 * Math.pow(2, (n - 69) / 12);
let seed = 20261007;
function noise() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 2147483648 - 1;
}
function addEvent(startBeat, seconds, amplitude, pan, waveform) {
  const start = Math.round(startBeat * beat * sampleRate);
  const count = Math.ceil(seconds * sampleRate);
  const gainL = Math.cos(((pan + 1) * Math.PI) / 4);
  const gainR = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let n = 0; n < count; n++) {
    const t = n / sampleRate;
    const attack = Math.min(1, t / 0.004);
    const release = Math.min(1, Math.max(0, (seconds - t) / 0.065));
    const value = waveform(t) * amplitude * attack * release;
    const index = (start + n) % sampleCount;
    left[index] += value * gainL;
    right[index] += value * gainR;
  }
}
function pluck(startBeat, note, amplitude, pan, seconds = 1.8) {
  const f = midiHz(note);
  addEvent(startBeat, seconds, amplitude, pan, (t) => {
    const fundamental = Math.sin(tau * f * t) * Math.exp(-2.2 * t);
    const second = 0.24 * Math.sin(tau * f * 2 * t) * Math.exp(-4.8 * t);
    const third = 0.075 * Math.sin(tau * f * 3 * t) * Math.exp(-8 * t);
    return fundamental + second + third;
  });
}
function bell(startBeat, note, amplitude, pan) {
  const f = midiHz(note);
  addEvent(startBeat, 2.4, amplitude, pan, (t) => {
    const phase = tau * f * t;
    const tine = Math.sin(
      phase + 0.45 * Math.sin(2 * phase) * Math.exp(-3.5 * t),
    );
    const sparkle = 0.1 * Math.sin(3.997 * phase) * Math.exp(-5.5 * t);
    return (tine + sparkle) * Math.exp(-1.9 * t);
  });
}
function bass(startBeat, note, amplitude) {
  const f = midiHz(note);
  addEvent(startBeat, beat * 1.85, amplitude, -0.05, (t) => {
    const envelope = Math.min(1, t / 0.015) * Math.exp(-2.4 * t);
    return (Math.sin(tau * f * t) + 0.1 * Math.sin(tau * f * 2 * t)) * envelope;
  });
}
function brush(startBeat, amplitude, pan) {
  let previous = 0;
  addEvent(startBeat, 0.08, amplitude, pan, (t) => {
    const current = noise();
    const high = current - previous;
    previous = current;
    return high * Math.exp(-47 * t);
  });
}
function softKick(startBeat, amplitude) {
  addEvent(startBeat, 0.23, amplitude, 0, (t) => {
    const phase = tau * (53 * t + (20 * (1 - Math.exp(-18 * t))) / 18);
    return Math.sin(phase) * Math.exp(-19 * t);
  });
}
function woodTap(startBeat, amplitude, pan) {
  addEvent(
    startBeat,
    0.085,
    amplitude,
    pan,
    (t) =>
      (Math.sin(tau * 920 * t) + 0.2 * Math.sin(tau * 1370 * t)) *
      Math.exp(-65 * t),
  );
}

const chords = [
  [48, 55, 59, 62, 64], // Cmaj9
  [45, 52, 55, 59, 60], // Am9
  [41, 48, 52, 57, 60], // Fmaj7
  [43, 50, 55, 57, 59], // G6
  [48, 55, 59, 62, 64],
  [40, 47, 50, 55, 59], // Em7
  [38, 45, 48, 52, 53], // Dm9
  [43, 50, 55, 57, 59],
  [45, 52, 55, 59, 60],
  [41, 48, 52, 57, 60],
  [48, 55, 59, 62, 64],
  [43, 50, 55, 57, 59],
  [38, 45, 48, 52, 53],
  [40, 47, 50, 55, 59],
  [41, 48, 52, 57, 60],
  [43, 50, 55, 57, 59],
];
const melody = [
  [76, 79, 74, 76],
  [72, 76, 81, 79],
  [81, 79, 76, 77],
  [74, 76, 79, 74],
  [79, 76, 74, 72],
  [79, 83, 81, 79],
  [77, 81, 84, 81],
  [83, 81, 79, 74],
  [76, 79, 81, 84],
  [81, 79, 76, 77],
  [79, 76, 72, 74],
  [71, 74, 79, 81],
  [77, 76, 74, 81],
  [79, 76, 83, 79],
  [81, 84, 81, 79],
  [76, 74, 79, 71],
];
const melodyOffsets = [0.5, 1.25, 2.5, 3.25];
for (let bar = 0; bar < bars; bar++) {
  const start = bar * 4;
  const chord = chords[bar];
  const swell = 0.93 + 0.07 * Math.sin((tau * bar) / bars);
  bass(start, chord[0], 0.055 * swell);
  bass(start + 2, chord[0] + 7, 0.039 * swell);
  // Soft, spaced broken chords leave room around the melody.
  const arpIndices = [1, 3, 2, 4, 1, 2];
  const arpOffsets = [0, 0.75, 1.5, 2, 2.75, 3.5];
  for (let j = 0; j < arpOffsets.length; j++) {
    pluck(
      start + arpOffsets[j],
      chord[arpIndices[j]] + 12,
      0.023 * swell,
      j % 2 ? 0.32 : -0.32,
      1.75,
    );
  }
  for (let j = 0; j < 4; j++) {
    bell(
      start + melodyOffsets[j],
      melody[bar][j],
      (j === 0 ? 0.043 : 0.037) * swell,
      0.12 * Math.sin(bar + j),
    );
  }
  softKick(start, 0.025);
  softKick(start + 2, 0.021);
  woodTap(start + 1, 0.017, -0.18);
  woodTap(start + 3, 0.015, 0.18);
  for (let j = 0; j < 8; j++) {
    const swing = j % 2 ? 0.028 : 0;
    brush(start + j * 0.5 + swing, j % 2 ? 0.007 : 0.011, j % 2 ? 0.45 : -0.45);
  }
}

// Circular stereo reflections carry every tail over the file seam.
const dryL = left.slice();
const dryR = right.slice();
const reflections = [
  { delay: 0.092, gain: 0.065, cross: true },
  { delay: 0.167, gain: 0.047, cross: false },
  { delay: 0.281, gain: 0.034, cross: true },
  { delay: 0.469, gain: 0.027, cross: false },
  { delay: 0.703, gain: 0.016, cross: true },
];
for (const reflection of reflections) {
  const offset = Math.round(reflection.delay * sampleRate);
  for (let n = 0; n < sampleCount; n++) {
    const source = (n - offset + sampleCount) % sampleCount;
    left[n] +=
      reflection.gain * (reflection.cross ? dryR[source] : dryL[source]);
    right[n] +=
      reflection.gain * (reflection.cross ? dryL[source] : dryR[source]);
  }
}
// Remove any residual DC without changing the circular timing.
const meanL = left.reduce((a, b) => a + b, 0) / sampleCount;
const meanR = right.reduce((a, b) => a + b, 0) / sampleCount;
let rawPeak = 0;
for (let n = 0; n < sampleCount; n++) {
  left[n] -= meanL;
  right[n] -= meanR;
  rawPeak = Math.max(rawPeak, Math.abs(left[n]), Math.abs(right[n]));
}
const targetPeak = Math.pow(10, -10 / 20);
const gain = targetPeak / rawPeak;
const dataBytes = sampleCount * 2 * 2;
const wav = Buffer.alloc(44 + dataBytes);
wav.write("RIFF", 0);
wav.writeUInt32LE(36 + dataBytes, 4);
wav.write("WAVE", 8);
wav.write("fmt ", 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(dataBytes, 40);
let squared = 0;
let peak = 0;
let clippedSamples = 0;
for (let n = 0; n < sampleCount; n++) {
  for (let channel = 0; channel < 2; channel++) {
    const value = (channel ? right[n] : left[n]) * gain;
    peak = Math.max(peak, Math.abs(value));
    squared += value * value;
    if (Math.abs(value) >= 1) clippedSamples++;
    wav.writeInt16LE(Math.round(value * 32767), 44 + n * 4 + channel * 2);
  }
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, wav);
const rms = Math.sqrt(squared / (sampleCount * 2));
const seamJump =
  Math.max(
    Math.abs(left[0] - left[sampleCount - 1]),
    Math.abs(right[0] - right[sampleCount - 1]),
  ) * gain;
const stats = {
  output,
  durationSeconds: duration,
  bpm,
  bars,
  channels: 2,
  sampleRate,
  bitDepth: 16,
  encoding: "PCM little-endian",
  bytes: wav.length,
  peakAmplitude: peak,
  peakDbFS: 20 * Math.log10(peak),
  rmsAmplitude: rms,
  rmsDbFS: 20 * Math.log10(rms),
  clippedSamples,
  seamJumpAmplitude: seamJump,
  seamJumpDbFS: 20 * Math.log10(seamJump),
};
fs.writeFileSync(
  output.replace(/\.wav$/i, "-metadata.json"),
  JSON.stringify(stats, null, 2),
);
console.log(JSON.stringify(stats, null, 2));
