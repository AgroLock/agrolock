import { useInView } from '../hooks/useInView';

// Fades + slides a section's content up into place the first time it
// scrolls into view. Pure CSS transition under the hood (see .reveal in
// index.css) — no animation library needed.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'in-view' : ''} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
