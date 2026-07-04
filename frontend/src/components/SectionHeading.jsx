export default function SectionHeading({ eyebrow, title, lead }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
      {lead && <p className="mt-4 text-slate-400 leading-relaxed">{lead}</p>}
    </div>
  );
}
