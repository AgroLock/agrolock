import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import Reveal from '../components/Reveal';
import TiltPanel from '../components/TiltPanel';
import { IconCheck, IconSatellite } from '../components/icons';

const PHASES = [
  {
    phase: 'Phase 1',
    window: 'Weeks 1–2',
    title: 'Soroban escrow contract',
    deliverable: 'Create, fund, multi-signature milestone release, refund path.',
    outcome: 'Working contract deployed and tested on Stellar Testnet.',
    status: 'done',
    statusLabel: 'Shipped',
  },
  {
    phase: 'Phase 2',
    window: 'Weeks 3–4',
    title: 'Buyer & farmer web app',
    deliverable: 'Contract creation, wallet connect, attestor assignment.',
    outcome: 'End-to-end demo: buyer funds escrow, attestor confirms milestone, farmer receives payout.',
    status: 'done',
    statusLabel: 'Shipped',
  },
  {
    phase: 'Phase 3',
    window: 'Weeks 5–6',
    title: 'Anchor integration & dispute flow',
    deliverable: 'Anchor integration for Naira on/off-ramp; dispute & partial-refund flow.',
    outcome: 'Buyer funds in Naira, farmer cashes out in Naira, no crypto exposure for either side.',
    status: 'partial',
    statusLabel: 'Partially shipped',
    note: 'Dispute + partial-refund logic is live in the contract today. The Naira on/off-ramp is currently a testnet demo token standing in for a real Stellar anchor — wiring up an actual anchor is the next step before a pilot.',
  },
  {
    phase: 'Phase 4',
    window: 'Post-MVP',
    title: 'Reputation & sensor-based verification',
    deliverable: 'Reputation scoring from completed contracts; satellite/IoT milestone verification; insurance partner integration.',
    outcome: 'Pathway to under-collateralized credit for farmers with a completed-contract track record.',
    status: 'planned',
    statusLabel: 'Planned',
  },
];

const STATUS_STYLES = {
  done: { dot: 'bg-brand-400', badge: 'bg-brand-400/10 text-brand-300 border border-brand-400/20' },
  partial: { dot: 'bg-gold-400', badge: 'bg-gold-400/10 text-gold-300 border border-gold-400/20' },
  planned: { dot: 'bg-slate-500', badge: 'bg-white/5 text-slate-400 border border-white/10' },
};

export default function Roadmap() {
  return (
    <div className="text-slate-100">
      <SiteNav />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-14">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Roadmap</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">MVP scope, phase by phase</h1>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            AgroLock's MVP was scoped in four phases. The first two are shipped and live on Stellar Testnet today;
            phase three is partially done; phase four is the sequenced path to a real pilot.
          </p>
        </Reveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative border-l border-white/10 ml-4 space-y-8">
          {PHASES.map((p, i) => {
            const style = STATUS_STYLES[p.status];
            return (
              <Reveal key={p.phase} delay={i * 90} className="relative pl-8">
                <span
                  className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full ${style.dot} ring-4 ring-ink-950 ${p.status === 'done' ? 'pulse-dot' : ''}`}
                />
                <TiltPanel max={3} className="glass rounded-2xl p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      {p.phase} · {p.window}
                    </span>
                    <span className={`status-pill ${style.badge}`}>
                      {p.status === 'done' && <IconCheck width="12" height="12" />}
                      {p.statusLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-slate-100">{p.title}</p>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-300">Deliverable:</span> {p.deliverable}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-300">Outcome:</span> {p.outcome}
                  </p>
                  {p.note && (
                    <p className="mt-3 text-sm text-gold-200/90 bg-gold-400/5 border border-gold-400/15 rounded-lg px-3 py-2.5 leading-relaxed">
                      {p.note}
                    </p>
                  )}
                </TiltPanel>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <div className="flex justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400 border border-gold-400/20">
                <IconSatellite />
              </span>
            </div>
            <h2 className="mt-5 text-2xl sm:text-3xl font-semibold">Phase 4 is a considered sequence, not an afterthought</h2>
            <p className="mt-3 text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A fully trustless oracle for confirming a crop was actually planted or delivered needs satellite
              imagery or IoT sensors — out of scope and budget for an MVP. The trusted-attestor model in the
              contract today is the deliberate first step; stronger verification is sequenced, not skipped.
            </p>
            <Link
              to="/technology"
              className="mt-7 inline-flex rounded-xl glass px-6 py-3 font-semibold text-slate-200 hover:border-brand-400/40 transition"
            >
              Read the verification model →
            </Link>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
