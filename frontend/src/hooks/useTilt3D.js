import { useRef } from 'react';

// Lightweight 3D tilt-on-hover, à la Linear/Vercel product cards. Tracks the
// cursor position relative to the element and applies a perspective
// rotation + a CSS custom property (--mx/--my) that index.css uses to draw
// a radial glare following the pointer. Pure CSS transform — no library.
export function useTilt3D({ max = 8, glare = true } = {}) {
  const ref = useRef(null);

  function onMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * max * 2;
    const rotateX = (0.5 - py) * max * 2;
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    if (glare) {
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    }
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  }

  return { ref, onMouseMove, onMouseLeave, className: 'tilt-card' };
}
