import { Link } from "react-router-dom";
import { ArrowRight, Camera, HandCoins, HeartHandshake, Quote, Users } from "lucide-react";
import { useApi, money } from "../api";
import { Loading } from "../ui";
import { CauseCard, LiveFeed, ProofCard, ProofEmpty } from "./shared";

function Stat({ icon: Icon, value, label, tone }) {
  return (
    <div className="statItem">
      <span className={`statIcon ${tone}`}>
        <Icon size={22} />
      </span>
      <div>
        <b>{value}</b>
        <small>{label}</small>
      </div>
    </div>
  );
}

export default function Home() {
  const summary = useApi("/api/summary", { poll: 20000 });
  const feed = useApi("/api/donations?limit=6", { poll: 10000 });
  const proofs = useApi("/api/proofs?limit=3", { poll: 30000 });

  const totals = summary.data?.totals;
  const causes = summary.data?.causes || [];
  const latestProofs = proofs.data?.proofs || [];

  return (
    <>
      <section className="hero">
        <div className="heroInner">
          <div className="heroCopy">
            <span className="eyebrow">An Education Trust</span>
            <h1>
              Small donations.
              <br />
              <span>Big impact.</span>
            </h1>
            <p>
              Tripti Foundation supports education, healthcare, the environment and animal welfare. Donate in a minute,
              then see a photo when your help reaches the people who need it.
            </p>
            <div className="actions">
              <Link className="btn accent lg" to="/donate">
                Start donating <ArrowRight size={18} />
              </Link>
              <Link className="btn outline lg" to="/causes">
                Explore causes
              </Link>
            </div>
            <ul className="trust">
              <li>Every donation is listed publicly</li>
              <li>Photo proof of every delivery</li>
              <li>Thank-you email straight away</li>
            </ul>
          </div>
          <div className="heroArt">
            <div className="heroCard">
              <img src="/tripti-logo.jpg" alt="Tripti Foundation - an education trust" />
            </div>
            <div className="floatChip one">
              <span className="dot" />
              <div>
                <small>Raised so far</small>
                <b>{money(totals?.raised)}</b>
              </div>
            </div>
            <div className="floatChip two">
              <Camera size={18} />
              <div>
                <small>Deliveries shown</small>
                <b>{totals?.deliveries ?? 0}</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="statsBand">
        <div className="statsInner">
          <Stat icon={HandCoins} tone="indigo" value={money(totals?.raised)} label="Total donations" />
          <Stat icon={HeartHandshake} tone="red" value={totals?.donations ?? 0} label="Donations made" />
          <Stat icon={Users} tone="gold" value={totals?.donors ?? 0} label="Generous donors" />
          <Stat icon={Camera} tone="sky" value={totals?.deliveries ?? 0} label="Delivery photos" />
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">Make a difference</span>
            <h2>Causes that need your support</h2>
          </div>
          <Link to="/causes" className="textLink">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {summary.loading && !summary.data ? (
          <Loading />
        ) : (
          <div className="causeGrid">
            {causes.map((c) => (
              <CauseCard key={c.key} cause={c} />
            ))}
          </div>
        )}
      </section>

      <section className="section alt">
        <div className="sectionHead center">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>From your donation to a smile, in three steps</h2>
          </div>
        </div>
        <div className="steps">
          <div className="step">
            <span>1</span>
            <h3>You donate</h3>
            <p>Pick a cause and an amount. You can donate without an account, and stay anonymous if you prefer.</p>
          </div>
          <div className="step">
            <span>2</span>
            <h3>We deliver</h3>
            <p>Our team puts your donation to work and records every person and family we support.</p>
          </div>
          <div className="step">
            <span>3</span>
            <h3>You see the proof</h3>
            <p>We upload a delivery photo and email you, so you can see exactly where your help went.</p>
          </div>
        </div>
      </section>

      <section className="section split">
        <LiveFeed donations={feed.data?.donations} loading={feed.loading && !feed.data} limit={6} />
        <div className="card quoteCard">
          <Quote size={30} />
          <p>A little kindness goes a long way. Together we can create a better tomorrow.</p>
          <span>Education • Empowerment • Service</span>
          <Link className="btn accent" to="/donate">
            Donate now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">Transparency</span>
            <h2>Latest deliveries</h2>
          </div>
          <Link to="/delivery-proof" className="textLink">
            See all proof <ArrowRight size={16} />
          </Link>
        </div>
        {proofs.loading && !proofs.data ? (
          <Loading />
        ) : latestProofs.length === 0 ? (
          <ProofEmpty />
        ) : (
          <div className="proofGrid">
            {latestProofs.map((p) => (
              <ProofCard key={p.id} proof={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
