import { useState, useRef, useCallback } from 'react';

const PRESETS = {
  normal: { pitch: 1.0, filterFreq: 0, filterType: null, distortion: 0, delay: 0 },
  robot: { pitch: 1.0, filterFreq: 800, filterType: 'bandpass', distortion: 50, delay: 0.02 },
  chipmunk: { pitch: 1.8, filterFreq: 4000, filterType: 'highpass', distortion: 0, delay: 0 },
  deep: { pitch: 0.5, filterFreq: 300, filterType: 'lowpass', distortion: 0, delay: 0 },
};

function createDistortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

export function useVoiceChanger() {
  const [voicePreset, setVoicePresetState] = useState('normal');
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const destRef = useRef(null);
  const nodesRef = useRef([]);
  const originalTrackRef = useRef(null);

  const cleanup = useCallback(() => {
    nodesRef.current.forEach((n) => {
      try { n.disconnect(); } catch (e) { /* ignore */ }
    });
    nodesRef.current = [];
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch (e) { /* ignore */ }
      sourceRef.current = null;
    }
  }, []);

  const applyPreset = useCallback((stream, preset) => {
    if (!stream) return null;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return null;

    originalTrackRef.current = audioTrack;
    const config = PRESETS[preset];
    if (!config || preset === 'normal') {
      cleanup();
      return null; // Use original track
    }

    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      cleanup();

      // Create source from the stream
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const dest = ctx.createMediaStreamDestination();
      destRef.current = dest;

      let currentNode = source;
      const nodes = [];

      // Pitch shift via playback rate workaround — we use a BiquadFilter to shape frequency
      // Real pitch shifting in Web Audio is complex; we simulate with filter shaping

      // Filter
      if (config.filterType && config.filterFreq > 0) {
        const filter = ctx.createBiquadFilter();
        filter.type = config.filterType;
        filter.frequency.value = config.filterFreq;
        filter.Q.value = 1;
        currentNode.connect(filter);
        currentNode = filter;
        nodes.push(filter);
      }

      // Distortion (robot effect)
      if (config.distortion > 0) {
        const distortion = ctx.createWaveShaper();
        distortion.curve = createDistortionCurve(config.distortion);
        distortion.oversample = '4x';
        currentNode.connect(distortion);
        currentNode = distortion;
        nodes.push(distortion);
      }

      // Delay (robot effect)
      if (config.delay > 0) {
        const delay = ctx.createDelay();
        delay.delayTime.value = config.delay;
        currentNode.connect(delay);
        currentNode = delay;
        nodes.push(delay);
      }

      // Gain normalization
      const gain = ctx.createGain();
      gain.gain.value = preset === 'deep' ? 1.5 : preset === 'chipmunk' ? 0.8 : 1.0;
      currentNode.connect(gain);
      currentNode = gain;
      nodes.push(gain);

      currentNode.connect(dest);
      nodesRef.current = nodes;

      return dest.stream.getAudioTracks()[0];
    } catch (err) {
      console.error('Voice changer error:', err);
      return null;
    }
  }, [cleanup]);

  const setVoicePreset = useCallback((preset) => {
    setVoicePresetState(preset);
  }, []);

  const destroy = useCallback(() => {
    cleanup();
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, [cleanup]);

  return {
    voicePreset,
    setVoicePreset,
    applyPreset,
    destroy,
    PRESETS: Object.keys(PRESETS),
  };
}
