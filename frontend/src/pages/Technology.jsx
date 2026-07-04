import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import TiltPanel from '../components/TiltPanel';
import { IconShield, IconLayers, IconSatellite, IconCheck } from '../components/icons';

const WHY_STELLAR = [
  {
    title: 'Programmable milestone logic',
    body: 'Soroban provides the programmable milestone and multi-signature logic that a plain payment rail, mobile money, or bank transfer simply cannot express.',
  },
  {
    title: 'Sub-second finality, near-zero fees',
    body: "Agricultural transactions are frequent, small in value, and happen in a sector operating on razor-thin margins — a fee structure built for large transfers would eat the model alive.",
  },
  {
    title: 'Naira in, Naira out',
    body: 'Stellar anchors let both sides transact in Naira on the front end and back end, while the trust and escrow logic runs on-chain in the middle — no crypto literacy required.',
  },
  {
    title: 'A future credit history',
    body: "Every completed contract becomes an on-chain, auditable record of a farmer's reliability — the foundation for a future credit history that today simply does not exist for this population.",
  },
];

const LAYERS = [
  {
    title: 'Soroban contract layer',
    tag: 'Rust',
    body: 'Escrow creation, fund locking, milestone definitions, multi-signature release logic, refund and dispute paths.',
  },
  {
    title: 'Application layer',
    tag: 'Web app',
    body: 'Contract creation and management UI for buyers and farmers, wallet connection, attestor role assignment, milestone status tracking.',
  },
  {
    title: 'Fiat rail layer',
    tag: 'Stellar anchors',
    body: 'Naira-in from the buyer, Naira-out to the farmer, so the underlying stablecoin settlement is invisible to both end users.',
  },
];

export default function Technology() {
  return (
    <div className="text-slate-100">
      <SiteNav />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-14">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Technology &amp; security</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
            Not a blockchain bolted on for its own sake
          </h1>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            The core value AgroLock offers — programmable, conditional, multi-party release of funds — genuinely
            requires a smart contract layer, and Stellar's cost and settlement profile make it viable at the
            transaction sizes agriculture actually operates at.
          </p>
        </Reveal>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <Reveal>
          <SectionHeading eyebrow="Why Stellar & Soroban" title="Four reasons this needed a smart contract layer" />
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-2 gap-5">
          {WHY_STELLAR.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <TiltPanel className="glass rounded-2xl p-6 h-full">
                <p className="font-semibold text-slate-100">{item.title}</p>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.body}</p>
              </TiltPanel>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400 border border-gold-400/20">
              <IconSatellite />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-brand-400">
              Verification: the honest hard part
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              A trusted-attestor model, by design — not an oversight
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-slate-400 leading-relaxed">
              A fully trustless oracle for confirming that a crop was actually planted or delivered would require
              satellite imagery or IoT sensors that are out of scope, and out of budget, for an MVP. AgroLock's
              first version deliberately uses a pragmatic trusted-attestor model instead: a known local figure — an
              extension worker, cooperative officer, or aggregator already embedded in the farming community — signs
              off on each milestone using their own Stellar key, and release requires a signature quorum rather than
              a single party's word.
            </p>
            <p className="mt-4 text-slate-400 leading-relaxed">
              This is a considered design tradeoff, not an oversight. Stronger, sensor-based verification is a
              clearly sequenced future phase — see the{' '}
              <Link to="/roadmap" className="text-brand-300 underline hover:text-brand-200">
                roadmap
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <Reveal>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-700/20 text-brand-300 border border-brand-400/20">
            <IconLayers />
          </div>
          <SectionHeading
            eyebrow="Technical architecture"
            title="Three layers working together"
            lead=""
          />
        </Reveal>
        <div className="mt-8 space-y-4">
          {LAYERS.map((layer, i) => (
            <Reveal key={layer.title} delay={i * 90}>
              <TiltPanel max={3} className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="status-pill bg-brand-400/10 text-brand-300 border border-brand-400/20 shrink-0 w-fit">
                  {layer.tag}
                </span>
                <div>
                  <p className="font-semibold text-slate-100">{layer.title}</p>
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed">{layer.body}</p>
                </div>
              </TiltPanel>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Security model" title="Programmable trust, not blind trust" />
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            {[
              { title: '2-of-3 multi-signature', body: 'Buyer, farmer, and attestor — no single party can move funds alone, in either direction.' },
              { title: 'Dispute → refund path', body: "A missed milestone doesn't mean total loss. Any party can flag it, and quorum can refund the buyer instead." },
              { title: 'On-chain, auditable', body: 'Every escrow, vote, and payout is a public transaction on Stellar Testnet.' },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <TiltPanel className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 h-full">
                  <IconShield className="text-gold-400" />
                  <p className="mt-4 font-semibold text-slate-100">{p.title}</p>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{p.body}</p>
                </TiltPanel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <Reveal>
          <div className="flex justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-400/15 text-brand-300">
              <IconCheck width="20" height="20" />
            </span>
          </div>
          <h2 className="mt-5 text-2xl sm:text-3xl font-semibold">See what's next</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Sensor-based verification, reputation scoring, and insurance integration are sequenced as clear future
            phases.
          </p>
          <Link
            to="/roadmap"
            className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 font-semibold text-ink-950 hover:brightness-110 transition"
          >
            View the roadmap →
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
