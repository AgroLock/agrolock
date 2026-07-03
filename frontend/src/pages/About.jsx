import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import TiltPanel from '../components/TiltPanel';
import { IconAlert, IconChart, IconTarget, IconCheck } from '../components/icons';

const PROBLEMS = [
  'Farmers need cash upfront for seed, fertilizer, and labour before a single naira of revenue exists.',
  'Formal lenders treat farmers as high-risk borrowers with no collateral or documented credit history, so interest rates are prohibitive or credit is unavailable altogether.',
  'Off-takers — agro-processors, aggregators, exporters — would often prefer to pay in advance to lock in supply, but have no reliable way to confirm that a farmer will actually plant, tend, and deliver as promised.',
  'Informal solutions such as middlemen and local cooperatives fill part of the gap, but leak value through fraud, underpayment, and delayed settlement, and rarely leave any usable financial record behind.',
];

const IMPACT = [
  {
    title: 'For farmers',
    body: 'Access to upfront capital without collateral — cash for seed, fertilizer, and labour before a single naira of revenue exists.',
  },
  {
    title: 'For buyers',
    body: 'Supply certainty they currently cannot get — pre-financing a farmer without gambling the full amount on an unverifiable promise.',
  },
  {
    title: 'For the ecosystem',
    body: "A growing history of completed, on-chain contracts becomes a reputation layer formal lenders and insurers could eventually plug into — a verifiable credit history built from real production activity, not paperwork farmers don't have.",
  },
];

export default function About() {
  return (
    <div className="text-slate-100">
      <SiteNav />

      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-14">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">About</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
            Real-world financing infrastructure for farmers who have none
          </h1>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            AgroLock is a milestone-based escrow protocol built on Stellar that lets agricultural buyers pre-finance
            smallholder farmers with confidence, and lets farmers access capital without collateral. Instead of a
            single all-or-nothing payment, a buyer's funds are locked in a Soroban smart contract and released to
            the farmer in tranches, tied to verifiable production milestones such as planting, mid-season growth,
            and delivery. Neither party has to trust the other on faith: the contract enforces the agreement.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Reveal>
            <TiltPanel max={3} className="glass rounded-2xl p-6 grid sm:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Presented by</p>
                <p className="mt-1 font-medium text-slate-100">Victor</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Network</p>
                <p className="mt-1 font-medium text-slate-100">Stellar — Soroban + classic rails + anchors</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Category</p>
                <p className="mt-1 font-medium text-slate-100">Real-world asset financing / agricultural fintech</p>
              </div>
            </TiltPanel>
          </Reveal>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <Reveal>
          <SectionHeading
            eyebrow="The problem"
            title="A standoff between capital and farmers"
            lead="Smallholder farmers make up the majority of Nigeria's agricultural workforce, yet most operate on thin, unpredictable cash flow."
          />
        </Reveal>
        <div className="mt-10 space-y-4">
          {PROBLEMS.map((text, i) => (
            <Reveal key={text} delay={i * 70}>
              <TiltPanel max={3} className="glass rounded-2xl p-5 flex gap-4 items-start">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <IconAlert width="16" height="16" />
                </span>
                <p className="text-sm text-slate-300 leading-relaxed pt-1">{text}</p>
              </TiltPanel>
            </Reveal>
          ))}
        </div>
        <Reveal delay={280}>
          <p className="mt-8 text-slate-400 leading-relaxed max-w-3xl">
            The result is a standoff: capital that wants to reach farmers sits on the sidelines because there is no
            trusted mechanism to release it conditionally, on terms both sides can verify.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Impact" title="Why it matters beyond one deal at a time" />
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            {IMPACT.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <TiltPanel className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 h-full">
                  <IconChart className="text-gold-400" />
                  <p className="mt-4 font-semibold text-slate-100">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.body}</p>
                </TiltPanel>
              </Reveal>
            ))}
          </div>
          <Reveal delay={260}>
            <p className="mt-8 text-slate-400 leading-relaxed max-w-3xl">
              This fits squarely within what GrantFox and the wider Stellar ecosystem are trying to fund: real-world
              financial infrastructure for underserved populations, built with Soroban's actual programmability
              rather than a token wrapped around an otherwise ordinary app.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24">
        <Reveal>
          <TiltPanel max={3} className="glass-strong rounded-3xl p-8 sm:p-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-700/20 text-brand-300 border border-brand-400/20">
              <IconTarget />
            </div>
            <h2 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight">The ask</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              I'm applying to the GrantFox Maintainer Program to build the AgroLock MVP: a working Soroban escrow
              contract, a functioning buyer/farmer/attestor web app, and a live Naira-in/Naira-out demo on testnet.
              Support would go toward development time and testnet-to-mainnet infrastructure costs as the project
              moves from prototype to a pilot with a real cooperative or aggregator partner in Nigeria.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
              {[
                'A working Soroban escrow contract, deployed and tested on Stellar Testnet',
                'A functioning buyer / farmer / attestor web app',
                'A live Naira-in / Naira-out demo, no crypto exposure for either side',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-300">
                    <IconCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/roadmap"
                className="rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 font-semibold text-ink-950 hover:brightness-110 transition"
              >
                See the MVP roadmap
              </Link>
              <Link
                to="/how-it-works"
                className="rounded-xl glass px-6 py-3 font-semibold text-slate-200 hover:border-brand-400/40 transition"
              >
                How it works
              </Link>
            </div>
          </TiltPanel>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
