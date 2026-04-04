import { useRef, useState, useCallback, useEffect } from 'react';

export function useLiveAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Per-channel next-play-time, matching main app's approach exactly
  const nextPlayTimeRef = useRef<Record<string, number>>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);

  // Initialize AudioContext on mount (may be suspended until user gesture)
  useEffect(() => {
    let needsGestureVal = false;
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      nextPlayTimeRef.current = {};
      if (ctx.state === 'suspended') needsGestureVal = true;
    } catch {
      needsGestureVal = true;
    }
    // Batch state updates after setup is done
    setAnalyserNode(analyserRef.current);
    if (needsGestureVal) setNeedsGesture(true);

    return () => {
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  const ensureAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      setAnalyserNode(analyser);
      nextPlayTimeRef.current = {};
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setNeedsGesture(false);
  }, []);

  // Called by the audio WS hook for every audio_chunk message
  const feedAudioChunk = useCallback((base64: string, sampleRate: number, channel: string) => {
    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
      setNeedsGesture(false);
    }

    try {
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const buffer = ctx.createBuffer(1, float32.length, sampleRate);
      buffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);

      // Per-channel scheduling — key to glitch-free playback
      const prev = nextPlayTimeRef.current[channel] ?? 0;
      const startTime = Math.max(ctx.currentTime, prev);
      source.start(startTime);
      nextPlayTimeRef.current[channel] = startTime + buffer.duration;

      setIsPlaying(true);
      setHasAudio(true);
    } catch {
      // ignore decode errors
    }
  }, []);

  const stop = useCallback(() => {
    audioCtxRef.current?.suspend();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    ensureAudioCtx();
    setIsPlaying(true);
  }, [ensureAudioCtx]);

  // Full reset — called when leaving audio view
  const reset = useCallback(() => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      analyserRef.current = null;
      setAnalyserNode(null);
    }
    nextPlayTimeRef.current = {};
    setIsPlaying(false);
    setHasAudio(false);
  }, []);

  return { feedAudioChunk, ensureAudioCtx, isPlaying, hasAudio, needsGesture, stop, resume, reset, analyserNode };
}
