"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type TouchEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Maximize2,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { photos } from "./photos";
import { birthdayWishes } from "./wishes";
import { useBirthdayAudio } from "./useBirthdayAudio";

type Scene = "/" | "/home" | "/memories" | "/surprises" | "/birthday";
type Pose = "idle" | "wave" | "bonk" | "party";
const chapters: { path: Scene; label: string; number: string }[] = [
  { path: "/home", label: "Birthday girl", number: "01" },
  { path: "/memories", label: "Little moments", number: "02" },
  { path: "/surprises", label: "28 little wishes", number: "03" },
  { path: "/birthday", label: "Make a wish", number: "04" },
];
const spring = { type: "spring" as const, stiffness: 180, damping: 22 };

function GoggleMark({ className = "" }: { className?: string }) {
  return (
    <span className={`goggle-mark ${className}`} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

function Mascot({
  pose = "idle",
  className = "",
  onClick,
  label = "Say hello to Pip",
  character = "pip",
}: {
  pose?: Pose;
  className?: string;
  onClick?: () => void;
  label?: string;
  character?: "pip" | "pig";
}) {
  const frame = {
    idle: "0% 0%",
    wave: "100% 0%",
    bonk: "0% 100%",
    party: "100% 100%",
  }[pose];
  const face = useMotionValue(0);
  const lean = useSpring(face, { stiffness: 80, damping: 20 });
  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)")
        .matches
    )
      return;
    const follow = (event: PointerEvent) =>
      face.set((event.clientX / window.innerWidth - 0.5) * 8);
    window.addEventListener("pointermove", follow, { passive: true });
    return () => window.removeEventListener("pointermove", follow);
  }, [face]);
  return (
    <motion.button
      className={`mascot mascot-${pose} character-${character} ${className}`}
      aria-label={label}
      onClick={onClick}
      style={{ rotate: lean }}
      whileTap={{ scale: 0.88, rotate: -8 }}
      whileHover={{ y: -8 }}
    >
      <span className="mascot-sprite" style={{ backgroundPosition: frame }} />
      <span className="mascot-shadow" />
    </motion.button>
  );
}

function PigSidekick({
  className = "",
  celebrate = false,
  onReact,
}: {
  className?: string;
  celebrate?: boolean;
  onReact?: () => void;
}) {
  const [pose, setPose] = useState<Pose>("idle"),
    [snort, setSnort] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );
  const react = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setPose((value) => (value === "wave" ? "party" : "wave"));
    setSnort(true);
    onReact?.();
    timer.current = window.setTimeout(() => {
      setPose("idle");
      setSnort(false);
    }, 1900);
  };
  return (
    <div className={`pig-sidekick ${className}`}>
      <Mascot
        character="pig"
        pose={celebrate ? "party" : pose}
        onClick={react}
        label="Say hello to the birthday pig"
      />
      {snort && (
        <motion.span
          className="pig-oink handwritten"
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          oink! ♡
        </motion.span>
      )}
    </div>
  );
}

function AnimatedBackground({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`animated-background ${dark ? "dark" : ""}`}
      aria-hidden="true"
    >
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      {Array.from({ length: 16 }, (_, i) => (
        <span
          key={i}
          className={`particle particle-${i % 3}`}
          style={{
            left: `${(i * 37 + 7) % 100}%`,
            top: `${(i * 23 + 5) % 100}%`,
            animationDelay: `${-i * 0.7}s`,
            animationDuration: `${5 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
}
function Star({ className = "" }: { className?: string }) {
  return (
    <span className={`doodle-star ${className}`} aria-hidden="true">
      ✳
    </span>
  );
}
function FloatingPig({
  className = "",
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <PigSidekick className={`floating-pig ${className}`} onReact={onClick} />
  );
}

function ConfettiSystem({ burst }: { burst: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!burst || reduced) return;
    const surface = canvas.current,
      ctx = surface?.getContext("2d");
    if (!surface || !ctx) return;
    const width = window.innerWidth,
      height = window.innerHeight,
      ratio = Math.min(window.devicePixelRatio || 1, 2);
    surface.width = width * ratio;
    surface.height = height * ratio;
    ctx.scale(ratio, ratio);
    const colors = ["#ffce32", "#3563ed", "#fff6df", "#ff7b87", "#9edecb"];
    const pieces = Array.from({ length: width < 600 ? 90 : 160 }, () => ({
      x: width / 2,
      y: height * 0.7,
      vx: (Math.random() - 0.5) * 23,
      vy: -8 - Math.random() * 16,
      rotation: Math.random() * 6,
      spin: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 7,
    }));
    let animation = 0,
      previous = 0,
      elapsed = 0;
    const draw = (time: number) => {
      const step = Math.min((time - (previous || time)) / 16.67, 2);
      previous = time;
      elapsed += step;
      ctx.clearRect(0, 0, width, height);
      pieces.forEach((p) => {
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.vy += 0.22 * step;
        p.vx *= 0.993;
        p.rotation += p.spin * step;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, (270 - elapsed) / 50));
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (elapsed < 270) animation = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    };
    animation = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animation);
      ctx.clearRect(0, 0, width, height);
    };
  }, [burst, reduced]);
  return <canvas ref={canvas} className="confetti-canvas" aria-hidden="true" />;
}

function MagneticButton({
  children,
  onClick,
  className = "",
  disabled = false,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}) {
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const hover = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.12);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.12);
  };
  return (
    <motion.button
      className={`primary-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      onPointerMove={hover}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x, y }}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.025 }}
    >
      {children}
    </motion.button>
  );
}

function PhotoReveal({
  index,
  className = "",
  interactive = false,
  onOpen,
  openButtonRef,
}: {
  index: 0 | 1 | 2 | 3;
  className?: string;
  interactive?: boolean;
  onOpen?: () => void;
  openButtonRef?: Ref<HTMLButtonElement>;
}) {
  const photo = photos[index],
    rotateX = useMotionValue(0),
    rotateY = useMotionValue(0),
    tiltX = useSpring(rotateX, spring),
    tiltY = useSpring(rotateY, spring);
  const tilt = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateY.set(
      ((event.clientX - rect.left - rect.width / 2) / rect.width) * 9,
    );
    rotateX.set(
      (-(event.clientY - rect.top - rect.height / 2) / rect.height) * 9,
    );
  };
  return (
    <motion.figure
      className={`photo-reveal photo-${index + 1} ${className}`}
      onPointerMove={tilt}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
      style={{ rotateX: tiltX, rotateY: tiltY }}
    >
      <div className="photo-image-wrap">
        <motion.img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          style={{ objectPosition: photo.position }}
          initial={{ opacity: 0, scale: 1.09, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <figcaption>
        <span className="handwritten">{photo.label}</span>
        <Heart size={21} strokeWidth={1.5} />
      </figcaption>
      {interactive && (
        <button
          className="photo-open"
          ref={openButtonRef}
          onClick={onOpen}
          aria-label="View the memory photo"
        >
          <Maximize2 size={17} />
        </button>
      )}
    </motion.figure>
  );
}

function SplashExperience({
  onEnter,
  replayKey,
}: {
  onEnter: () => void;
  replayKey: number;
}) {
  const reduced = useReducedMotion(),
    [second, setSecond] = useState(0),
    skipped = useRef(false);
  useEffect(() => {
    skipped.current = false;
    setSecond(reduced ? 10 : 0);
    if (reduced) return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (skipped.current) {
        window.clearInterval(timer);
        return;
      }
      const elapsed = Math.min(10, Math.floor((Date.now() - started) / 1000));
      setSecond(elapsed);
      if (elapsed === 10) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [reduced, replayKey]);
  return (
    <section
      className={`splash scene intro-second-${second}`}
      aria-label="Birthday opening"
    >
      <AnimatedBackground dark />
      <button
        className="skip-intro quiet-button"
        onClick={() => {
          skipped.current = true;
          setSecond(10);
          onEnter();
        }}
      >
        Skip intro <ChevronRight size={16} />
      </button>
      <div className="intro-light" />
      {second >= 2 && second < 6 && (
        <div className="intro-eyes">
          <GoggleMark />
        </div>
      )}
      {second >= 3 && (
        <Mascot
          pose={second === 4 ? "bonk" : second >= 7 ? "party" : "wave"}
          className="splash-mascot"
          onClick={() => {
            skipped.current = true;
            setSecond(10);
          }}
        />
      )}
      {second >= 6 && (
        <motion.div
          className="splash-photo"
          initial={{ opacity: 0, scale: 0.75, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 7 }}
          transition={{ duration: 1.1 }}
        >
          <PhotoReveal index={0} />
        </motion.div>
      )}
      <div className="splash-title">
        {second >= 7 && (
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            NAYANA<span className="intro-heart">♥</span>
          </motion.h1>
        )}
        {second >= 8 && (
          <motion.div
            className="splash-age"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
          >
            28 <span>✳</span>
          </motion.div>
        )}
      </div>
      {second >= 9 && (
        <motion.div
          className="splash-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MagneticButton onClick={onEnter}>
            Enter <ArrowRight size={18} />
          </MagneticButton>
          <span className="small-label">A LITTLE BIRTHDAY MAGIC</span>
        </motion.div>
      )}
      {second >= 5 && (
        <PigSidekick className="splash-pig" celebrate={second >= 7} />
      )}
      <div className="splash-progress" aria-hidden="true">
        <span style={{ width: `${second * 10}%` }} />
      </div>
    </section>
  );
}

function HomeScene({
  go,
  surprise,
  pose,
  react,
}: {
  go: (scene: Scene) => void;
  surprise: () => void;
  pose: Pose;
  react: () => void;
}) {
  const section = useRef<HTMLElement>(null),
    { scrollYProgress } = useScroll({
      target: section,
      offset: ["start start", "end start"],
    }),
    photoY = useTransform(scrollYProgress, [0, 1], [0, -80]),
    characterY = useTransform(scrollYProgress, [0, 1], [0, 100]),
    backgroundY = useTransform(scrollYProgress, [0, 1], [0, 45]);
  return (
    <>
      <section
        className="home-scene scene"
        ref={section}
        aria-labelledby="home-title"
      >
        <motion.div className="home-depth" style={{ y: backgroundY }}>
          <AnimatedBackground />
        </motion.div>
        <div className="home-copy">
          <span className="eyebrow">
            <span className="mini-line" /> THE NAYANA EDITION
          </span>
          <h1 id="home-title">
            Twenty
            <br />
            <span>eight.</span>
            <Star className="title-star" />
          </h1>
          <span className="handwritten home-note">& a little piggy magic.</span>
          <MagneticButton onClick={() => go("/memories")} className="home-cta">
            Let’s make memories <ArrowRight size={18} />
          </MagneticButton>
        </div>
        <div className="home-visual">
          <div className="portrait-orbit" />
          <motion.div className="home-photo" style={{ y: photoY }}>
            <PhotoReveal index={0} />
            <span className="photo-tape" />
            <span className="birthday-stamp">
              BIRTHDAY
              <br />
              <b>GIRL</b>
              <Sparkles size={16} />
            </span>
          </motion.div>
          <span className="handwritten portrait-note">our leading lady</span>
          <Star className="portrait-star" />
          <FloatingPig className="home-pig-sticker" onClick={surprise} />
          <motion.div className="home-mascot-wrap" style={{ y: characterY }}>
            <Mascot pose={pose} className="home-mascot" onClick={react} />
            <span className="mascot-bubble handwritten">Hi, Nayana!</span>
          </motion.div>
        </div>
        <div className="scene-footer">
          <span className="small-label">28 YEARS OF MAIN CHARACTER ENERGY</span>
          <button
            className="scroll-cue quiet-button"
            onClick={() =>
              document
                .getElementById("little-chaos")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            A little chaos <ArrowDown size={16} />
          </button>
        </div>
      </section>
      <FunScene go={go} surprise={surprise} />
    </>
  );
}

function FunScene({
  go,
  surprise,
}: {
  go: (scene: Scene) => void;
  surprise: () => void;
}) {
  const [excited, setExcited] = useState(false),
    timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );
  const party = () => {
    setExcited(true);
    surprise();
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setExcited(false), 2000);
  };
  return (
    <section
      id="little-chaos"
      className={`fun-scene scene ${excited ? "crew-party" : ""}`}
      aria-labelledby="fun-title"
    >
      <AnimatedBackground dark />
      <span className="eyebrow">YOUR VERY UNOFFICIAL PARTY CREW</span>
      <h2 id="fun-title">
        Oink, oink.<span className="handwritten">the party crew is here</span>
      </h2>
      <div className="comedy-stage">
        <Mascot
          pose={excited ? "party" : "wave"}
          className="fun-mascot"
          onClick={party}
          label="Celebrate with Pip"
        />
        <PigSidekick
          className="comedy-pig"
          celebrate={excited}
          onReact={party}
        />
        {excited && (
          <motion.span
            className="crew-caption handwritten"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            party mode: ON ♡
          </motion.span>
        )}
      </div>
      <div className="fun-controls">
        <span className="small-label">TAP THE LITTLE PIG</span>
        <MagneticButton
          onClick={() => go("/memories")}
          className="button-yellow"
        >
          The next little moment <ArrowRight size={18} />
        </MagneticButton>
      </div>
    </section>
  );
}

function MemoryScene({
  go,
  surprise,
}: {
  go: (scene: Scene) => void;
  surprise: () => void;
}) {
  const [opened, setOpened] = useState(false),
    [focused, setFocused] = useState(false);
  const photoOpener = useRef<HTMLButtonElement>(null);
  return (
    <section
      className={`memory-scene scene ${focused ? "memory-focused" : ""}`}
      aria-labelledby="memory-title"
    >
      <AnimatedBackground />
      <div className="memory-copy">
        <span className="eyebrow">LITTLE MOMENTS. BIG SMILES.</span>
        <h1 id="memory-title">
          Some things
          <br /> just <span className="handwritten">stay.</span>
        </h1>
        <MagneticButton onClick={() => go("/surprises")}>
          A little birthday magic <Sparkles size={17} />
        </MagneticButton>
      </div>
      <motion.div
        className="memory-composition"
        initial={{ y: 80, rotate: -8, scale: 0.86 }}
        whileInView={{ y: 0, rotate: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="memory-ring" />
        <PhotoReveal
          index={1}
          interactive
          openButtonRef={photoOpener}
          onOpen={() => {
            setOpened(true);
            setFocused(true);
          }}
        />
        <span className="photo-tape memory-tape" />
        <span className="memory-number">02</span>
        <Star className="memory-star" />
        <span className="handwritten memory-note">a moment to keep ♡</span>
        <Mascot
          pose={focused ? "party" : "wave"}
          className="memory-mascot"
          onClick={() => {
            setFocused(!focused);
            surprise();
          }}
          label="Pip reacts to the memory"
        />
      </motion.div>
      <FloatingPig className="memory-pig-sticker" onClick={surprise} />
      <div className="scene-footer">
        <span className="small-label">ONE PHOTO. A WHOLE FEELING.</span>
        <span className="scene-counter">02 / 04</span>
      </div>
      <Dialog open={opened} onOpenChange={setOpened}>
        <DialogContent
          className="memory-dialog"
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            photoOpener.current?.focus();
          }}
        >
          <DialogTitle className="sr-only">A moment to keep</DialogTitle>
          <DialogDescription className="sr-only">
            Nayana among carved temple pillars. Close to return to the birthday
            celebration.
          </DialogDescription>
          <button
            className="dialog-close icon-button"
            aria-label="Close memory photo"
            onClick={() => setOpened(false)}
          >
            <X size={22} />
          </button>
          <img src={photos[1].src} alt={photos[1].alt} />
          <span className="handwritten">a moment to keep ♡</span>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function WishScene({
  go,
  surprise,
}: {
  go: (scene: Scene) => void;
  surprise: () => void;
}) {
  const [wish, setWish] = useState(0),
    [cheering, setCheering] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );
  const moreMagic = () => {
    setWish((value) => (value + 1) % birthdayWishes.length);
    setCheering(true);
    surprise();
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCheering(false), 1600);
  };
  return (
    <section className="surprise-scene scene" aria-labelledby="wish-title">
      <AnimatedBackground dark />
      <div className="surprise-heading">
        <span className="eyebrow">28 LITTLE WISHES, JUST FOR YOU</span>
        <h1 id="wish-title">
          More joy.
          <br />
          <span className="handwritten">More you.</span>
        </h1>
      </div>
      <div className={`wish-universe ${cheering ? "wish-cheering" : ""}`}>
        <div className="wish-orbit wish-orbit-one" />
        <div className="wish-orbit wish-orbit-two" />
        <span className="wish-age" aria-hidden="true">
          28
        </span>
        <div className="wish-portrait">
          <PhotoReveal index={3} />
          <span className="photo-tape" />
        </div>
        <button
          className="wish-emoji wish-heart"
          onClick={moreMagic}
          aria-label="Send a little love"
        >
          💛
        </button>
        <button
          className="wish-emoji wish-sparkle"
          onClick={moreMagic}
          aria-label="Send a little sparkle"
        >
          ✦
        </button>

        <Mascot
          pose={cheering ? "party" : "wave"}
          className="wish-mascot"
          onClick={moreMagic}
          label="Pip sends a birthday wish"
        />
        <PigSidekick
          className="wish-pig"
          celebrate={cheering}
          onReact={moreMagic}
        />
        <span className="handwritten wish-orbit-note">
          a whole universe of good things
        </span>
      </div>
      <div className="wish-message">
        <span className="wish-index small-label">
          WISH {String(wish + 1).padStart(2, "0")} / 28
        </span>
        <div className="wish-text" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            <motion.p
              key={wish}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {birthdayWishes[wish]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="wish-actions">
        <MagneticButton className="button-yellow" onClick={moreMagic}>
          <Sparkles size={17} />
          One more wish
        </MagneticButton>
        <button
          className="quiet-button wish-next"
          onClick={() => go("/birthday")}
        >
          Birthday time <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function BirthdayCake({ candles }: { candles: boolean[] }) {
  return (
    <div className="birthday-cake">
      <img
        className="cake-art"
        src="/art/cake.webp"
        width={1230}
        height={1278}
        alt="A yellow birthday cake with blue frosting and sprinkles"
      />
      <div className="cake-candles">
        {candles.map((lit, index) => (
          <span
            key={index}
            className={`candle candle-${index} ${lit ? "lit" : "out"}`}
            aria-hidden="true"
          >
            <span className="candle-flame" />
            <span className="candle-wick" />
            <span className="candle-body" />
            <span className="candle-smoke" />
            {!lit && <Check className="candle-check" size={14} />}
          </span>
        ))}
      </div>
      <span className="cake-floor" />
    </div>
  );
}

function CelebrationScene({
  candles,
  countdown,
  blastCandles,
  revealed,
  surprise,
  replay,
}: {
  candles: boolean[];
  countdown: number;
  blastCandles: () => void;
  revealed: boolean;
  surprise: () => void;
  replay: () => void;
}) {
  const [memories, setMemories] = useState(false);
  const reduced = useReducedMotion(),
    finalHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!revealed) {
      setMemories(false);
      return;
    }
    const timer = window.setTimeout(
      () => {
        setMemories(true);
        surprise();
      },
      reduced ? 1000 : 6000,
    );
    const focusTimer = window.setTimeout(
      () => finalHeading.current?.focus({ preventScroll: true }),
      reduced ? 200 : 1100,
    );
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(focusTimer);
    };
  }, [revealed, reduced, surprise]);
  return (
    <section
      className={`birthday-scene scene ${revealed ? "birthday-revealed" : ""}`}
      aria-labelledby="birthday-title"
    >
      <AnimatedBackground dark />
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="cake"
            className="cake-scene-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.12 }}
            transition={{ duration: reduced ? 0 : 0.7 }}
          >
            <span className="eyebrow">YOUR MOMENT, BIRTHDAY GIRL</span>
            <h1 id="birthday-title">
              Make a <span className="handwritten">wish.</span>
            </h1>
            <div className="cake-composition">
              <BirthdayCake candles={candles} />
              <Mascot
                className="cake-mascot"
                pose={candles.every(Boolean) ? "wave" : "party"}
                onClick={surprise}
              />
              <PigSidekick
                className="cake-pig"
                celebrate={!candles.every(Boolean)}
                onReact={surprise}
              />
              <Star className="cake-star" />
              <span className="handwritten cake-note">
                all the good things ♡
              </span>
            </div>
            <div className="candle-instruction">
              <AnimatePresence mode="wait">
                <motion.span
                  className="auto-countdown"
                  key={candles.some(Boolean) ? countdown : "wish-sent"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: reduced ? 0 : 0.15 }}
                >
                  {candles.some(Boolean) ? countdown : "💛"}
                </motion.span>
              </AnimatePresence>
              <span className="small-label">
                {candles.some(Boolean)
                  ? "CLOSE YOUR EYES. MAKE A WISH."
                  : "WISH SENT."}
              </span>
              <button
                className="quiet-button celebrate-now"
                onClick={blastCandles}
                disabled={!candles.some(Boolean)}
              >
                {candles.some(Boolean)
                  ? "Celebrate now"
                  : "Here comes the magic"}
                <Sparkles size={15} />
              </button>
              <div
                className="candle-progress"
                aria-label={`${candles.filter(Boolean).length} candles still lit`}
              >
                {candles.map((lit, i) => (
                  <i key={i} className={lit ? "" : "done"}>
                    {lit ? "" : <Check size={12} />}
                  </i>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="finale"
            className="finale-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 1.2 }}
          >
            <div className="finale-copy">
              <motion.span
                className="eyebrow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduced ? 0 : 0.4 }}
              >
                HAPPY BIRTHDAY <Heart size={14} fill="currentColor" />
              </motion.span>
              <motion.h1
                id="birthday-title"
                ref={finalHeading}
                tabIndex={-1}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reduced ? 0 : 1.1,
                  duration: reduced ? 0 : 1,
                }}
              >
                Nayana<span className="finale-heart">♥</span>
              </motion.h1>
              <motion.div
                className="finale-age"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduced ? 0 : 2, ...spring }}
              >
                28<span className="handwritten">& one of a kind.</span>
              </motion.div>
            </div>
            <motion.div
              className="finale-visual"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(15px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{
                delay: reduced ? 0 : 0.8,
                duration: reduced ? 0 : 1.6,
              }}
            >
              <div className="finale-spotlight" />
              <PhotoReveal index={2} />
              <PigSidekick
                className="finale-pig"
                celebrate={memories}
                onReact={surprise}
              />
              <Star className="finale-star" />
              <Mascot
                className="finale-mascot"
                pose={memories ? "party" : "idle"}
                onClick={surprise}
              />
            </motion.div>
            <motion.div
              className="finale-replay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 2.5 }}
            >
              <MagneticButton onClick={replay} className="button-yellow">
                <RotateCcw size={17} /> Replay the magic
              </MagneticButton>
            </motion.div>
            {memories && (
              <motion.div
                className="floating-memories"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <img src={photos[0].src} alt="The opening memory" />
                <span className="handwritten">all of you. all the magic.</span>
                <img src={photos[1].src} alt="The temple memory" />
              </motion.div>
            )}
            <div className="rising-balloons" aria-hidden="true">
              {["💛", "🎈", "✦", "🎈", "🐷"].map((emoji, i) => (
                <span
                  key={i}
                  style={{
                    left: `${10 + i * 19}%`,
                    animationDelay: `${3 + i * 0.6}s`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function BirthdayExperience() {
  const pathname = usePathname(),
    router = useRouter(),
    scene = (pathname || "/") as Scene,
    reduced = useReducedMotion();
  const {
    audioRef,
    enabled: musicEnabled,
    starting: musicStarting,
    error: musicError,
    toggle: toggleMusic,
    onFirstGesture,
    play,
  } = useBirthdayAudio();
  const [burst, setBurst] = useState(0),
    [pose, setPose] = useState<Pose>("wave"),
    [transition, setTransition] = useState<Scene | null>(null),
    [candles, setCandles] = useState([true, true, true]),
    [revealed, setRevealed] = useState(false),
    [countdown, setCountdown] = useState(3),
    [replayKey, setReplayKey] = useState(0);
  const timers = useRef<Set<number>>(new Set()),
    birthdayTimers = useRef<Set<number>>(new Set()),
    celebrationRun = useRef(0),
    revealedRef = useRef(false),
    previousScene = useRef(scene),
    navigating = useRef(false),
    candlesRef = useRef(candles),
    sceneRef = useRef(scene),
    sceneHeading = useRef<HTMLElement>(null),
    swipeStart = useRef<{ x: number; y: number; time: number } | null>(null),
    navigationFallback = useRef<number | null>(null),
    navigationPush = useRef<number | null>(null),
    navigationTarget = useRef<Scene | null>(null);
  useEffect(() => {
    sceneRef.current = scene;
    if (navigationTarget.current && scene !== navigationTarget.current) {
      for (const id of [navigationPush.current, navigationFallback.current]) {
        if (id !== null) {
          window.clearTimeout(id);
          timers.current.delete(id);
        }
      }
      navigationPush.current = null;
      navigationFallback.current = null;
      navigationTarget.current = null;
      navigating.current = false;
      setTransition(null);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    if (scene !== previousScene.current)
      sceneHeading.current?.focus({ preventScroll: true });
    previousScene.current = scene;
  }, [scene]);
  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const later = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      callback();
    }, delay);
    timers.current.add(id);
    return id;
  }, []);
  const surprise = useCallback(() => {
    setBurst((value) => value + 1);
    setPose("party");
    play("party");
    later(() => setPose("idle"), 2100);
  }, [later, play]);
  const react = () => {
    setPose("bonk");
    play("bonk");
    later(() => {
      setPose("wave");
      setBurst((value) => value + 1);
    }, 650);
  };
  const go = useCallback(
    (target: Scene) => {
      if (target === sceneRef.current || navigating.current) return;
      navigating.current = true;
      navigationTarget.current = target;
      setTransition(target);
      play("pop");
      navigationPush.current = later(
        () => {
          navigationPush.current = null;
          router.push(target);
        },
        reduced ? 0 : 420,
      );
      navigationFallback.current = later(() => {
        setTransition(null);
        navigating.current = false;
        navigationTarget.current = null;
      }, 6000);
    },
    [router, reduced, later, play],
  );
  useEffect(() => {
    if (transition !== scene) return;
    if (navigationFallback.current !== null) {
      window.clearTimeout(navigationFallback.current);
      timers.current.delete(navigationFallback.current);
      navigationFallback.current = null;
    }
    const arrival = later(
      () => {
        setTransition(null);
        navigating.current = false;
        navigationTarget.current = null;
      },
      reduced ? 0 : 400,
    );
    return () => {
      window.clearTimeout(arrival);
      timers.current.delete(arrival);
    };
  }, [scene, transition, reduced, later]);
  const blastCandles = useCallback(() => {
    if (
      sceneRef.current != "/birthday" ||
      revealedRef.current ||
      !candlesRef.current.some(Boolean)
    )
      return;
    birthdayTimers.current.forEach(window.clearTimeout);
    birthdayTimers.current.clear();
    const run = celebrationRun.current;
    setCountdown(0);
    candlesRef.current = [false, false, false];
    setCandles([false, false, false]);
    surprise();
    const revealTimer = window.setTimeout(
      () => {
        birthdayTimers.current.delete(revealTimer);
        if (run !== celebrationRun.current || sceneRef.current != "/birthday")
          return;
        revealedRef.current = true;
        setRevealed(true);
        surprise();
      },
      reduced ? 150 : 1100,
    );
    birthdayTimers.current.add(revealTimer);
  }, [surprise, reduced]);
  useEffect(() => {
    if (scene != "/birthday" || revealed) return;
    celebrationRun.current += 1;
    const run = celebrationRun.current;
    setCountdown(3);
    candlesRef.current = [true, true, true];
    setCandles([true, true, true]);
    const beat = reduced ? 450 : 1000;
    const schedule = (callback: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        birthdayTimers.current.delete(id);
        if (run === celebrationRun.current && sceneRef.current === "/birthday")
          callback();
      }, delay);
      birthdayTimers.current.add(id);
    };
    schedule(() => setCountdown(2), beat);
    schedule(() => setCountdown(1), beat * 2);
    schedule(blastCandles, beat * 3);
    return () => {
      celebrationRun.current += 1;
      birthdayTimers.current.forEach(window.clearTimeout);
      birthdayTimers.current.clear();
    };
  }, [scene, revealed, replayKey, reduced, blastCandles]);
  const replay = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current.clear();
    birthdayTimers.current.forEach(window.clearTimeout);
    birthdayTimers.current.clear();
    celebrationRun.current += 1;
    revealedRef.current = false;
    setCountdown(3);
    navigating.current = false;
    setRevealed(false);
    setCandles([true, true, true]);
    candlesRef.current = [true, true, true];
    setReplayKey((value) => value + 1);
    setPose("wave");
    go("/");
  }, [go]);
  useEffect(() => {
    const registry = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: {
              name: string;
              description: string;
              inputSchema: object;
              annotations: object;
              execute: (input: unknown) => unknown;
            },
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!registry?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: "start_birthday_celebration",
      description:
        "Start the birthday celebration now, blowing out all candles and revealing Nayana's final photograph. The birthday scene also does this automatically after its countdown.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input: unknown) => {
        if (sceneRef.current !== "/birthday")
          throw new Error("Open the birthday scene first.");
        if (
          !input ||
          typeof input !== "object" ||
          Array.isArray(input) ||
          Object.keys(input).length
        )
          throw new Error("Provide an empty object.");
        blastCandles();
        await new Promise((resolve) =>
          window.setTimeout(resolve, reduced ? 350 : 1900),
        );
        return {
          candlesLit: candlesRef.current.filter(Boolean).length,
          finalPhotoRevealed: revealedRef.current,
        };
      },
    };
    try {
      void Promise.resolve(
        registry.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {
      /* Experimental support is optional. */
    }
    return () => lifecycle.abort();
  }, [blastCandles, reduced]);
  const chapter = chapters.findIndex((c) => c.path === scene);
  const touchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (
      !start ||
      scene === "/" ||
      scene === "/birthday" ||
      (event.target instanceof Element &&
        event.target.closest("button,a,[role=dialog]"))
    )
      return;
    const dx = event.changedTouches[0].clientX - start.x,
      dy = event.changedTouches[0].clientY - start.y;
    if (
      dy < -90 &&
      Math.abs(dy) > Math.abs(dx) * 1.5 &&
      Date.now() - start.time < 700 &&
      window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 90
    ) {
      const next = chapters[chapter + 1];
      if (next) go(next.path);
      return;
    }
    if (
      Math.abs(dx) > 90 &&
      Math.abs(dx) > Math.abs(dy) * 1.5 &&
      Date.now() - start.time < 700
    ) {
      const next = chapters[chapter + (dx < 0 ? 1 : -1)];
      if (next) go(next.path);
    }
  };
  const musicControl = (
    <button
      type="button"
      className={`sound-toggle icon-button ${scene === "/" ? "intro-music" : ""}`}
      data-music-toggle
      onClick={toggleMusic}
      aria-label={
        musicStarting
          ? "Cancel music playback"
          : musicEnabled
            ? "Turn music off"
            : "Play birthday music"
      }
      aria-pressed={musicEnabled}
      aria-busy={musicStarting}
      title={musicEnabled ? "Pause birthday music" : "Play birthday music"}
    >
      {musicEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      <span>
        {musicStarting ? "Starting…" : musicEnabled ? "Music on" : "Music off"}
      </span>
    </button>
  );
  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`birthday-app route-${scene.slice(1) || "splash"} ${transition ? "is-transitioning" : ""}`}
        onClickCapture={onFirstGesture}
        onTouchStart={(event) => {
          swipeStart.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
            time: Date.now(),
          };
        }}
        onTouchEnd={touchEnd}
      >
        <audio
          ref={audioRef}
          src="/audio/birthday-music.wav"
          loop
          preload="auto"
        />
        {scene === "/" && musicControl}
        {musicError && (
          <div className="music-notice" role="status">
            {musicError}
          </div>
        )}
        <a className="skip-link" href="#scene-content">
          Skip to scene
        </a>
        {scene !== "/" && (
          <header className="site-header">
            <button
              className="brand"
              onClick={() => go("/home")}
              aria-label="Nayana birthday home"
            >
              <GoggleMark />
              <span>
                NAYANA<span className="brand-age"> / 28</span>
              </span>
            </button>
            <nav className="desktop-navigation" aria-label="Chapters">
              {chapters.map((c) => (
                <button
                  key={c.path}
                  className={c.path === scene ? "active" : ""}
                  onClick={() => go(c.path)}
                  aria-current={c.path === scene ? "page" : undefined}
                >
                  {c.label}
                </button>
              ))}
            </nav>
            {musicControl}
          </header>
        )}
        <main id="scene-content" ref={sceneHeading} tabIndex={-1}>
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.22 }}
            >
              {scene === "/" && (
                <SplashExperience
                  onEnter={() => {
                    surprise();
                    go("/home");
                  }}
                  replayKey={replayKey}
                />
              )}
              {scene === "/home" && (
                <HomeScene
                  go={go}
                  surprise={surprise}
                  pose={pose}
                  react={react}
                />
              )}
              {scene === "/memories" && (
                <MemoryScene go={go} surprise={surprise} />
              )}
              {scene === "/surprises" && (
                <WishScene go={go} surprise={surprise} />
              )}
              {scene === "/birthday" && (
                <CelebrationScene
                  candles={candles}
                  countdown={countdown}
                  blastCandles={blastCandles}
                  revealed={revealed}
                  surprise={surprise}
                  replay={replay}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        {scene !== "/" && (
          <nav className="mobile-navigation" aria-label="Chapters">
            {chapters.map((c) => (
              <button
                key={c.path}
                className={c.path === scene ? "active" : ""}
                onClick={() => go(c.path)}
                aria-label={c.label}
                aria-current={c.path === scene ? "page" : undefined}
              >
                <span>{c.number}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </nav>
        )}
        <ConfettiSystem burst={burst} />
        <AnimatePresence>
          {transition && (
            <motion.div
              className={`page-transition transition-to-${transition.slice(1) || "intro"}`}
              key="transition"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              aria-hidden="true"
            >
              <div className="iris iris-left" />
              <div className="iris iris-right" />
              <GoggleMark />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="sr-only" aria-live="polite">
          {scene === "/birthday" &&
            (revealed
              ? "Happy 28th birthday, Nayana! Your final photograph is revealed."
              : candles.some(Boolean)
                ? `Birthday countdown: ${countdown}. The candles blow out automatically.`
                : "Wish sent. Your birthday surprise is coming.")}
        </div>
      </div>
    </MotionConfig>
  );
}
