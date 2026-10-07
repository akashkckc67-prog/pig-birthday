"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

export function useBirthdayAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const context = useRef<AudioContext | null>(null);
  const requested = useRef(true);
  const optedOut = useRef(false);
  const playing = useRef(false);
  const pending = useRef(false);
  const started = useRef(false);
  const lifecyclePaused = useRef(false);
  const attempt = useRef(0);
  const mounted = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || pending.current || (playing.current && !audio.paused)) return;
    requested.current = true;
    pending.current = true;
    const currentAttempt = ++attempt.current;
    setStarting(true);
    setError(null);
    try {
      if (audio.error) audio.load();
      // Start directly in the click handler, before any asynchronous work.
      await audio.play();
      if (currentAttempt !== attempt.current || !mounted.current) return;
      pending.current = false;
      if (!requested.current || document.hidden) {
        audio.pause();
        setStarting(false);
        return;
      }
      playing.current = true;
      started.current = true;
      setEnabled(true);
      setStarting(false);
    } catch {
      if (currentAttempt !== attempt.current || !mounted.current) return;
      pending.current = false;
      playing.current = false;
      setEnabled(false);
      setStarting(false);
      setError("Music didn't start. Tap the music button to try again.");
    }
  }, []);

  const pauseMusic = useCallback(() => {
    attempt.current += 1;
    pending.current = false;
    playing.current = false;
    audioRef.current?.pause();
    setEnabled(false);
    setStarting(false);
  }, []);

  const toggle = useCallback(() => {
    if (playing.current || pending.current) {
      optedOut.current = true;
      requested.current = false;
      lifecyclePaused.current = false;
      setError(null);
      pauseMusic();
    } else {
      optedOut.current = false;
      lifecyclePaused.current = false;
      void startMusic();
    }
  }, [pauseMusic, startMusic]);

  const onFirstGesture = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-music-toggle]")
      )
        return;
      if (!optedOut.current && !document.hidden) void startMusic();
    },
    [startMusic],
  );

  useEffect(() => {
    mounted.current = true;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.8;
    const onPlaying = () => {
      if (!requested.current || document.hidden) {
        audio.pause();
        return;
      }
      playing.current = true;
      started.current = true;
      setEnabled(true);
      setStarting(false);
      setError(null);
    };
    const onPause = () => {
      if (!audio.paused) return;
      playing.current = false;
      setEnabled(false);
    };
    const onError = () => {
      attempt.current += 1;
      pending.current = false;
      playing.current = false;
      setEnabled(false);
      setStarting(false);
      setError("Music couldn't load. Tap the music button to try again.");
    };
    const hide = () => {
      if (!requested.current || (!started.current && !pending.current)) return;
      lifecyclePaused.current = true;
      pauseMusic();
    };
    const show = () => {
      if (document.hidden || !lifecyclePaused.current) return;
      lifecyclePaused.current = false;
      if (requested.current && started.current) void startMusic();
    };
    const visibility = () => (document.hidden ? hide() : show());
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    audio.addEventListener("error", onError);
    if (audio.error) onError();
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", show);
    return () => {
      mounted.current = false;
      attempt.current += 1;
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
      audio.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", show);
      audio.pause();
      if (context.current) void context.current.close().catch(() => {});
      context.current = null;
    };
  }, [pauseMusic, startMusic]);

  const play = useCallback((kind: "pop" | "bonk" | "party" = "pop") => {
    if (!playing.current || document.hidden) return;
    try {
      const AudioEngine =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioEngine) return;
      context.current ??= new AudioEngine();
      const audio = context.current;
      const schedule = () => {
        if (!playing.current || document.hidden || audio.state !== "running")
          return;
        const notes =
          kind === "party"
            ? [523, 659, 784, 1047]
            : [kind === "bonk" ? 170 : 680];
        notes.forEach((frequency, i) => {
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          const start = audio.currentTime + i * 0.13;
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, start);
          oscillator.frequency.exponentialRampToValueAtTime(
            frequency * (kind === "bonk" ? 0.3 : 1.25),
            start + 0.16,
          );
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.025, start + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.start(start);
          oscillator.stop(start + 0.28);
        });
      };
      if (audio.state === "suspended")
        void audio
          .resume()
          .then(schedule)
          .catch(() => {});
      else schedule();
    } catch {
      // Music still works if this browser cannot play the optional effects.
    }
  }, []);

  return { audioRef, enabled, starting, error, toggle, onFirstGesture, play };
}
