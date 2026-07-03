import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import TiltPanel from '../components/TiltPanel';
import { IconHandshake, IconLock, IconSprout, IconShield, IconCoins, IconAlert } from '../components/icons';

const STEPS = [
  {
    title: 'Agreement',
    icon: IconHandshake,
    body: 'A buyer (off-taker, processor, or agro-exporter) and a farmer agree on crop type, quantity, price, delivery date, and a milestone schedule directly in the AgroLock web app.',
  },
  {
    title: 'Funding',
    icon: IconLock,
    body: "The buyer deposits stablecoin funds into a Soroban escrow contract. Funds can originate as Naira through a Stellar anchor, so the buyer never has to think in crypto terms.",
  },
  {
    title: 'Milestone tracking',
    icon: IconSprout,
    body: 'A neutral local attestor (an agricultural extension officer, cooperative lead, or partner aggregator) verifies each stage of the growing cycle and co-signs the corresponding release.',
    detail: 'A typical schedule: 30% at confirmed planting, 30% at confirmed mid-season growth, 40% at confirmed delivery and quality check.',
  },
  {
    title: 'Multi-signature release',
    icon: IconShield,
    body: 'Each tranche requires signatures from a defined quorum — for example, two of three among farmer, buyer, and attestor — before the contract releases funds, so no single party can unilaterally move money.',
  },
  {
    title: 'Cash-out',
    icon: IconCoins,
    body: 'The farmer withdraws in Naira through the same anchor infrastructure, receiving funds directly to a bank account or mobile money wallet.',
  },
  {
    title: 'Dispute handling',
    icon: IconAlert,
    body: "If a milestone is not met, the contract supports partial refund to the buyer or holds remaining funds for a defined arbitration path, rather than defaulting to an all-or-nothing loss for either side.",
  },
];

const SCHEDULE = [
  { label: 'Planting confirmed', pct: 30 },
  { label: 'Mid-season growth confirmed', pct: 30 },
  { label: 'Delivery & quality check confirmed', pct: 40 },
];

export default function HowItWorks() {
  return (
    <div className="text-slate-100">
      <SiteNav />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-14">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">How it works</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
            Six steps, one contract, no blind trust
          </h1>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            A buyer and a farmer agree on a supply deal. The buyer's funds go into a Soroban smart contract instead
            of the farmer's pocket or a middleman's — and release in tranches only as the people who were actually
            there confirm each stage happened.
          </p>
        </Reveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <ol className="space-y-5">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 70}>
              <TiltPanel max={4} className="glass rounded-2xl p-6 sm:p-7 relative">
                <div className="flex items-start gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-700/20 text-brand-300 border border-brand-400/20">
                      <step.icon />
                    </span>
                    <span className="mt-2 text-xs font-semibold text-slate-600">{`0${i + 1}`}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-slate-100">{step.title}</p>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{step.body}</p>
                    {step.detail && (
                      <p className="mt-3 text-sm text-brand-300 bg-brand-400/5 border border-brand-400/15 rounded-lg px-3 py-2 inline-block">
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              </TiltPanel>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Example schedule" title="What a typical 3-milestone deal looks like" />
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 glass rounded-2xl p-6 sm:p-8">
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/5">
                <div className="bg-brand-400" style={{ width: '30%' }} />
                <div className="bg-brand-500 border-x border-ink-950" style={{ width: '30%' }} />
                <div className="bg-gold-400" style={{ width: '40%' }} />
              </div>
              <div className="mt-6 grid sm:grid-cols-3 gap-5">
                {SCHEDULE.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-semibold gradient-text">{s.pct}%</p>
                    <p className="mt-1 text-sm text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-semibold">Curious about the trust model behind this?</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            See how milestone verification and the underlying Stellar &amp; Soroban stack actually work.
          </p>
          <Link
            to="/technology"
            className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 font-semibold text-ink-950 hover:brightness-110 transition"
          >
            Technology &amp; security →
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
