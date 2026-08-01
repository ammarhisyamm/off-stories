import { ArrowLeft, ArrowRight, Quotes, Star } from "@phosphor-icons/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 40;

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarClass: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "We stopped asking \u2018did you handle it?\u2019. It is all in one place. The guest list alone saved us.",
    name: "Andra & Kirana",
    role: "Planning for October 2026",
    initials: "AK",
    avatarClass: "bg-[color:var(--sage)]/15 text-[color:var(--sage)]",
  },
  {
    quote:
      "Budget committed versus what is actually paid was the thing we kept losing. Now it is one glance.",
    name: "Rani & Dimas",
    role: "Two months out",
    initials: "RD",
    avatarClass: "bg-[color:var(--taupe)]/15 text-[color:var(--taupe)]",
  },
  {
    quote:
      "Our parents and the planner all work from the same list. Nobody is the messenger anymore.",
    name: "Sinta & Bagas",
    role: "Wedding season 2025",
    initials: "SB",
    avatarClass: "bg-[color:var(--rose)]/15 text-[color:var(--rose)]",
  },
  {
    quote:
      "The timeline put the chaos on a calendar. We finally stopped relaying the same update to three group chats.",
    name: "Naura & Fajar",
    role: "Three months out",
    initials: "NF",
    avatarClass: "bg-[color:var(--sage)]/15 text-[color:var(--sage)]",
  },
  {
    quote:
      "We set it up in an evening and invited our families the next day. Quietly, everything started moving.",
    name: "Ayu & Bima",
    role: "Just got engaged",
    initials: "AB",
    avatarClass: "bg-[color:var(--taupe)]/15 text-[color:var(--taupe)]",
  },
  {
    quote:
      "Four weeks out and nothing is in five places anymore. It feels like someone pressed pause on the stress.",
    name: "Laras & Raka",
    role: "Four weeks to go",
    initials: "LR",
    avatarClass: "bg-[color:var(--rose)]/15 text-[color:var(--rose)]",
  },
];

const TOTAL = testimonials.length;

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-[#E8A33D]" aria-label="Rated 5 out of 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} weight="fill" />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-[24px] border border-[#ECECEC] bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#DDDDDD] hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
      <Quotes size={22} weight="fill" className="text-sage/50" />
      <div className="mt-4">
        <Stars />
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground">
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${t.avatarClass}`}
        >
          {t.initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">{t.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(TOTAL);
  const [perView, setPerView] = useState(3);
  const [noTransition, setNoTransition] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const draggingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef(TOTAL);
  const nextRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const update = () => setPerView(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const moveTo = useCallback((value: number) => {
    currentRef.current = value;
    setCurrent(value);
  }, []);

  const next = useCallback(() => {
    const c = currentRef.current;
    if (c >= TOTAL * 2) {
      setNoTransition(true);
      moveTo(TOTAL);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setNoTransition(false);
          moveTo(TOTAL + 1);
        });
      });
    } else {
      moveTo(c + 1);
    }
  }, [moveTo]);

  const prev = useCallback(() => {
    const c = currentRef.current;
    if (c <= 0) {
      setNoTransition(true);
      moveTo(TOTAL);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setNoTransition(false);
          moveTo(TOTAL - 1);
        });
      });
    } else {
      moveTo(c - 1);
    }
  }, [moveTo]);

  nextRef.current = next;

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    timerRef.current = setInterval(() => nextRef.current(), AUTOPLAY_MS);
  }, [stopAutoplay]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoplay]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      dragStartX.current = e.clientX;
      setDragging(true);
      setDragOffset(0);
      stopAutoplay();
    },
    [stopAutoplay],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setDragOffset(e.clientX - dragStartX.current);
  }, []);

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    setDragOffset((dx) => {
      if (dx < -SWIPE_THRESHOLD) next();
      else if (dx > SWIPE_THRESHOLD) prev();
      return 0;
    });
    startAutoplay();
  }, [next, prev, startAutoplay]);

  const goToDot = useCallback(
    (i: number) => {
      setNoTransition(false);
      moveTo(TOTAL + i);
    },
    [moveTo],
  );

  const cw = containerRef.current?.clientWidth ?? 1;
  const dragPct = (dragOffset / cw) * 100;
  const slide = -(current * 100) / perView + dragPct;
  const realIndex = ((current % TOTAL) + TOTAL) % TOTAL;
  const track = Array.from({ length: 3 * TOTAL }).map((_, i) => testimonials[i % TOTAL]);

  return (
    <div className="relative">
      <div
        className="overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
      >
        <div
          className={`-mx-3 select-none ${dragging ? "cursor-grabbing" : "cursor-grab"} ${
            dragging || noTransition ? "" : "transition-transform duration-700 ease-in-out"
          }`}
          style={{ transform: `translateX(${slide}%)` }}
        >
          {track.map((t, i) => (
            <div key={i} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={prev}
        aria-label="Previous testimonials"
        className="absolute left-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-white/90 text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur transition hover:bg-surface-2 active:scale-95"
      >
        <ArrowLeft size={16} />
      </button>
      <button
        onClick={next}
        aria-label="Next testimonials"
        className="absolute right-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-white/90 text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur transition hover:bg-surface-2 active:scale-95"
      >
        <ArrowRight size={16} />
      </button>

      <div className="mt-8 flex items-center justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goToDot(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === realIndex ? "w-6 bg-foreground" : "w-2 bg-border hover:bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
