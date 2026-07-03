import { useTilt3D } from '../hooks/useTilt3D';

// A div that tilts in 3D toward the cursor on hover, with a glare that
// follows the pointer (see .tilt-card in index.css). Each instance owns
// its own hook state, so it's safe to render many inside a .map().
export default function TiltPanel({ className = '', children, max = 6, ...rest }) {
  const tilt = useTilt3D({ max });
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={`${tilt.className} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
