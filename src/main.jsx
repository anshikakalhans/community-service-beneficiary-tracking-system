import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

import {
  Heart,
  Menu,
  X,
  Home as HomeIcon,
  WalletCards,
  Leaf,
  PlusCircle,
  BarChart3,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  MapPin,
  Phone,
  Save,
  HeartPulse,
  BookOpen,
  PawPrint,
  TreePine,
} from "lucide-react";

import "./styles.css";

/* =========================================================
   DATA
========================================================= */

const causes = [
  [
    "Education for All",
    "Better Education, Brighter Future",
    "BookOpen",
    500000,
    325000,
  ],
  [
    "Healthcare Support",
    "Health for a Healthier Tomorrow",
    "HeartPulse",
    600000,
    410000,
  ],
  [
    "Tree Plantation",
    "Greener Planet, Healthier Future",
    "TreePine",
    300000,
    180000,
  ],
  [
    "Animal Welfare",
    "For a Kinder World",
    "PawPrint",
    250000,
    140000,
  ],
];

const seed = [
  {
    id: "1",
    donor: "Rahul",
    amount: 2500,
    cause: "Education for All",
    date: "12 Sep 2026",
    anonymous: false,
    status: "Completed",
  },
  {
    id: "2",
    donor: "Anonymous Donor",
    amount: 5000,
    cause: "Healthcare Support",
    date: "11 Sep 2026",
    anonymous: true,
    status: "Completed",
  },
  {
    id: "3",
    donor: "Priya",
    amount: 1500,
    cause: "Tree Plantation",
    date: "09 Sep 2026",
    anonymous: false,
    status: "Completed",
  },
  {
    id: "4",
    donor: "Neha",
    amount: 3000,
    cause: "Animal Welfare",
    date: "07 Sep 2026",
    anonymous: false,
    status: "Completed",
  },
  {
    id: "5",
    donor: "Anonymous Donor",
    amount: 2000,
    cause: "Education for All",
    date: "05 Sep 2026",
    anonymous: true,
    status: "Completed",
  },
];

/* =========================================================
   LOCAL STORAGE
========================================================= */

const getD = () => {
  try {
    const stored = JSON.parse(
      localStorage.getItem("tripti_donations")
    );

    if (stored) {
      return stored;
    }

    localStorage.setItem(
      "tripti_donations",
      JSON.stringify(seed)
    );

    return seed;
  } catch {
    return seed;
  }
};

const saveD = (data) => {
  localStorage.setItem(
    "tripti_donations",
    JSON.stringify(data)
  );

  window.dispatchEvent(new Event("tripti-update"));
};

const getUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("tripti_user")
    );
  } catch {
    return null;
  }
};

const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

/* =========================================================
   LOGO
========================================================= */

function Logo({ light = false }) {
  return (
    <div className={`logo ${light ? "light" : ""}`}>
      <span className="logoMark">
        <Heart size={17} fill="currentColor" />
      </span>

      <b>Tripti Foundation</b>
    </div>
  );
}

/* =========================================================
   PUBLIC NAVBAR
========================================================= */

function PublicNav() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(getUser());

  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("tripti_user");
    setUser(null);
    nav("/");
  };

  return (
    <header className="nav">
      <Link to="/">
        <Logo />
      </Link>

      <button
        className="mobileMenu"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>

      <div
        className={`navLinks ${
          open ? "open" : ""
        }`}
      >
        <Link to="/">Home</Link>

        <Link to="/causes">Causes</Link>

        <Link to="/dashboard">
          Live Dashboard
        </Link>

        <Link to="/add-donation">
          Donate
        </Link>

        {user ? (
          <>
            <Link to="/profile">
              Profile
            </Link>

            <button onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link
              className="signupBtn"
              to="/signup"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ open, onClose }) {
  const nav = useNavigate();

  // IMPORTANT:
  // Use useLocation instead of global location
  const location = useLocation();

  const links = [
    ["/dashboard", "Dashboard", HomeIcon],
    ["/my-donations", "My Donations", WalletCards],
    ["/causes", "Causes", Heart],
    ["/add-donation", "Add Donation", PlusCircle],
    ["/impact", "Impact", BarChart3],
    ["/profile", "Profile", User],
  ];

  const logout = () => {
    localStorage.removeItem("tripti_user");
    nav("/login");
  };

  return (
    <>
      <div
        className={`sideOverlay ${
          open ? "show" : ""
        }`}
        onClick={onClose}
      />

      <aside
        className={`sidebar ${
          open ? "open" : ""
        }`}
      >
        <Logo />

        <nav>
          {links.map(
            ([to, label, Icon]) => (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={
                  location.pathname === to
                    ? "active"
                    : ""
                }
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          )}
        </nav>

        <button
          className="logout"
          onClick={logout}
        >
          <LogOut size={17} />
          Logout
        </button>
      </aside>
    </>
  );
}

/* =========================================================
   DASHBOARD LAYOUT
========================================================= */

function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
      />

      <main className="main">
        <button
          className="sideBtn"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>

        {children}
      </main>
    </div>
  );
}

/* =========================================================
   LIVE DONATION FEED
========================================================= */

function Feed({
  donations,
  compact = false,
}) {
  return (
    <section className="feed">
      <div className="feedHead">
        <div>
          <h3>
            Live Donation Activity
          </h3>

          <p>
            Every contribution creates a
            little more impact.
          </p>
        </div>

        <span className="live">
          <i />
          LIVE
        </span>
      </div>

      {donations
        .slice(
          0,
          compact ? 5 : 12
        )
        .map((d) => (
          <div
            className="feedRow"
            key={d.id}
          >
            <span className="avatar">
              {d.anonymous
                ? "♡"
                : d.donor[0]}
            </span>

            <div>
              <b>
                {d.anonymous
                  ? "Anonymous Donor"
                  : d.donor}
              </b>

              <small>
                donated to {d.cause}
              </small>
            </div>

            <div className="feedAmt">
              <b>
                {money(d.amount)}
              </b>

              <small>
                {d.date}
              </small>
            </div>
          </div>
        ))}
    </section>
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  const [ds, setDs] = useState(getD());

  useEffect(() => {
    const update = () => {
      setDs(getD());
    };

    window.addEventListener(
      "tripti-update",
      update
    );

    window.addEventListener(
      "storage",
      update
    );

    return () => {
      window.removeEventListener(
        "tripti-update",
        update
      );

      window.removeEventListener(
        "storage",
        update
      );
    };
  }, []);

  const total = ds.reduce(
    (a, d) => a + d.amount,
    0
  );

  return (
    <>
      <PublicNav />

      <section className="hero">
        <div className="heroCopy">
          <span className="eyebrow">
            Small Donations, Big Impact.
          </span>

          <h1>
            Track Your Donations, Create a{" "}
            <em>Bigger Change</em>
          </h1>

          <p>
            Tripti Foundation helps you make
            a difference by tracking your
            donations, supporting causes and
            seeing impact grow.
          </p>

          <div className="actions">
            <Link
              className="btn primary"
              to="/add-donation"
            >
              Start Donating
              <ArrowRight size={16} />
            </Link>

            <Link
              className="btn outline"
              to="/causes"
            >
              Learn More
            </Link>
          </div>

          <div className="heroStats">
            <div>
              <Users />
              <b>1,250+</b>
              <small>Donors</small>
            </div>

            <div>
              <Heart />
              <b>50+</b>
              <small>
                Causes Supported
              </small>
            </div>

            <div>
              <WalletCards />
              <b>
                {money(total)}+
              </b>
              <small>
                Total Donations
              </small>
            </div>
          </div>
        </div>

        <div className="heroArt">
          <div className="blob a" />
          <div className="blob b" />

          <div className="hands">
            🤲
            <Heart
              size={88}
              fill="#ef6b60"
              color="#ef6b60"
            />
            🤲
          </div>

          <span className="leaves">
            🌿
          </span>

          <span className="leaves r">
            🌱
          </span>

          <div className="heroNote">
            Together
            <br />
            we can do
            <br />
            more ♡
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              Make a Difference
            </span>

            <h2>
              Causes that need your support
            </h2>
          </div>

          <Link to="/causes">
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="causeGrid">
          {causes.map((c) => (
            <CauseCard
              key={c[0]}
              c={c}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <Feed
          donations={ds}
          compact
        />
      </section>
    </>
  );
}

/* =========================================================
   CAUSE ICON
========================================================= */

function iconFor(name) {
  if (name === "Healthcare Support")
    return <HeartPulse />;

  if (name === "Animal Welfare")
    return <PawPrint />;

  if (name === "Tree Plantation")
    return <TreePine />;

  return <BookOpen />;
}

/* =========================================================
   CAUSE CARD
========================================================= */

function CauseCard({
  c,
  large = false,
}) {
  return (
    <article
      className={`cause ${
        large ? "large" : ""
      }`}
    >
      <span className="causeIcon">
        {iconFor(c[0])}
      </span>

      <small className="causeLabel">
        Tripti Foundation
      </small>

      <h3>{c[0]}</h3>

      <p>
        {c[1]}. Support meaningful work
        and help create a brighter future.
      </p>

      <div className="progress">
        <i
          style={{
            width: `${
              (c[4] / c[3]) * 100
            }%`,
          }}
        />
      </div>

      <div className="meta">
        <b>
          {money(c[4])} raised
        </b>

        <span>
          Goal {money(c[3])}
        </span>
      </div>

      {large && (
        <Link
          className="btn outline"
          to="/add-donation"
        >
          Support this cause
          <ArrowRight size={15} />
        </Link>
      )}
    </article>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [ds, setDs] = useState(getD());

  useEffect(() => {
    const update = () => {
      setDs(getD());
    };

    window.addEventListener(
      "tripti-update",
      update
    );

    window.addEventListener(
      "storage",
      update
    );

    return () => {
      window.removeEventListener(
        "tripti-update",
        update
      );

      window.removeEventListener(
        "storage",
        update
      );
    };
  }, []);

  const total = ds.reduce(
    (a, d) => a + d.amount,
    0
  );

  return (
    <Layout>
      <div className="top">
        <div>
          <h1>
            Hello, Khushi! 👋
          </h1>

          <p>
            Here's your donation journey
            at a glance.
          </p>
        </div>

        <span className="topUser">
          <Bell />

          <b>K</b>

          Khushi Singh

          <ChevronDown size={14} />
        </span>
      </div>

      <div className="stats">
        {[
          [
            "Total Donations",
            money(total),
            "↑ 12% from last month",
            WalletCards,
          ],
          [
            "Donations Made",
            ds.length,
            "↑ 2 new this month",
            Sparkles,
          ],
          [
            "Causes Supported",
            new Set(
              ds.map((x) => x.cause)
            ).size,
            "↑ 1 new this month",
            Heart,
          ],
          [
            "Impact Score",
            "100%",
            "Keep going!",
            Leaf,
          ],
        ].map(
          ([a, b, c, Icon], i) => (
            <div
              className="stat"
              key={a}
            >
              <span
                className={`sicon s${i}`}
              >
                <Icon />
              </span>

              <small>{a}</small>

              <strong>{b}</strong>

              <em>{c}</em>
            </div>
          )
        )}
      </div>

      <div className="dashGrid">
        <div className="chart">
          <h3>
            Donation Overview
          </h3>

          <div className="bars">
            {[55, 72, 82, 105, 88, 115, 130].map(
              (h, i) => (
                <div key={i}>
                  <i
                    style={{
                      height: h,
                    }}
                  />

                  <small>
                    {
                      [
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                      ][i]
                    }
                  </small>
                </div>
              )
            )}
          </div>
        </div>

        <div className="chart">
          <h3>
            Donations by Cause
          </h3>

          <div className="donutWrap">
            <div className="donut">
              <span>
                {
                  new Set(
                    ds.map(
                      (x) => x.cause
                    )
                  ).size
                }

                <small>
                  Causes
                </small>
              </span>
            </div>

            <div className="legend">
              <span>
                ● Education{" "}
                <b>35%</b>
              </span>

              <span>
                ● Healthcare{" "}
                <b>25%</b>
              </span>

              <span>
                ● Environment{" "}
                <b>15%</b>
              </span>

              <span>
                ● Animal Welfare{" "}
                <b>15%</b>
              </span>

              <span>
                ● Others{" "}
                <b>10%</b>
              </span>
            </div>
          </div>
        </div>
      </div>

      <Feed donations={ds} />

      <div className="dashCta">
        <div>
          <h2>
            Every small act can create a
            bigger change.
          </h2>

          <p>
            Support a cause that matters
            to you.
          </p>
        </div>

        <Link
          className="btn primary"
          to="/add-donation"
        >
          Donate Now
          <Heart />
        </Link>
      </div>
    </Layout>
  );
}

/* =========================================================
   LOGIN / SIGNUP
========================================================= */

function Auth({ signup = false }) {
  const [show, setShow] =
    useState(false);

  const [err, setErr] =
    useState("");

  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const nav = useNavigate();

  const submit = (e) => {
    e.preventDefault();

    setErr("");

    if (signup) {
      if (f.password.length < 6) {
        return setErr(
          "Password must contain at least 6 characters."
        );
      }

      if (
        f.password !== f.confirm
      ) {
        return setErr(
          "Passwords do not match."
        );
      }

      let users = JSON.parse(
        localStorage.getItem(
          "tripti_users"
        ) || "[]"
      );

      if (
        users.some(
          (x) => x.email === f.email
        )
      ) {
        return setErr(
          "An account with this email already exists."
        );
      }

      users.push({
        name: f.name,
        email: f.email,
        password: f.password,
      });

      localStorage.setItem(
        "tripti_users",
        JSON.stringify(users)
      );

      localStorage.setItem(
        "tripti_user",
        JSON.stringify({
          name: f.name,
          email: f.email,
        })
      );

      nav("/dashboard");
    } else {
      let users = JSON.parse(
        localStorage.getItem(
          "tripti_users"
        ) || "[]"
      );

      let u = users.find(
        (x) =>
          x.email === f.email &&
          x.password === f.password
      );

      if (!u) {
        return setErr(
          "Invalid email or password. For demo, create an account first."
        );
      }

      localStorage.setItem(
        "tripti_user",
        JSON.stringify({
          name: u.name,
          email: u.email,
        })
      );

      nav("/dashboard");
    }
  };

  return (
    <div className="auth">
      <div className="authBrand">
        <Logo light />

        <div>
          <span>
            {signup
              ? "Small donations. Big impact."
              : "Give with purpose."}
          </span>

          <h1>
            {signup
              ? "Join the change with Tripti Foundation."
              : "Be the reason someone smiles today."}
          </h1>

          <p>
            Track. Support. Create Impact.
          </p>

          <Heart
            size={72}
            strokeWidth={1.2}
          />
        </div>

        <b className="authQuote">
          “A little kindness goes a
          long way.”
        </b>
      </div>

      <div className="authForm">
        <div className="authBox">
          <h1>
            {signup
              ? "Create Account"
              : "Welcome Back!"}
          </h1>

          <p>
            {signup
              ? "Start your journey with Tripti Foundation"
              : "Login to your account"}
          </p>

          <form onSubmit={submit}>
            {signup && (
              <>
                <label>
                  Full name
                </label>

                <div className="input">
                  <User />

                  <input
                    value={f.name}
                    onChange={(e) =>
                      setF({
                        ...f,
                        name: e.target
                          .value,
                      })
                    }
                    placeholder="Your name"
                    required
                  />
                </div>
              </>
            )}

            <label>
              Email address
            </label>

            <div className="input">
              <Mail />

              <input
                type="email"
                value={f.email}
                onChange={(e) =>
                  setF({
                    ...f,
                    email: e.target
                      .value,
                  })
                }
                placeholder="Email address"
                required
              />
            </div>

            <label>
              Password
            </label>

            <div className="input">
              <LockKeyhole />

              <input
                type={
                  show
                    ? "text"
                    : "password"
                }
                value={f.password}
                onChange={(e) =>
                  setF({
                    ...f,
                    password:
                      e.target.value,
                  })
                }
                placeholder="Password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShow(!show)
                }
              >
                {show ? (
                  <EyeOff />
                ) : (
                  <Eye />
                )}
              </button>
            </div>

            {signup && (
              <>
                <label>
                  Confirm password
                </label>

                <div className="input">
                  <LockKeyhole />

                  <input
                    type="password"
                    value={f.confirm}
                    onChange={(e) =>
                      setF({
                        ...f,
                        confirm:
                          e.target.value,
                      })
                    }
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </>
            )}

            {!signup && (
              <div className="remember">
                <span>
                  □ Remember me
                </span>

                <a href="#">
                  Forgot password?
                </a>
              </div>
            )}

            {err && (
              <div className="error">
                {err}
              </div>
            )}

            <button className="btn primary full">
              {signup
                ? "Create Account"
                : "Login"}
            </button>
          </form>

          {!signup && (
            <>
              <div className="or">
                <i />
                or
                <i />
              </div>

              <button className="google">
                G &nbsp; Continue with
                Google
              </button>
            </>
          )}

          <p className="authBottom">
            {signup
              ? "Already have an account? "
              : "Don't have an account? "}

            <Link
              to={
                signup
                  ? "/login"
                  : "/signup"
              }
            >
              {signup
                ? "Login"
                : "Sign Up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADD DONATION
========================================================= */

function AddDonation() {
  const [f, setF] = useState({
    name: "",
    email: "",
    cause: causes[0][0],
    amount: "",
    payment: "UPI",
    anonymous: false,
    message: "",
  });

  const [ok, setOk] =
    useState(null);

  const change = (e) => {
    setF({
      ...f,
      [e.target.name]:
        e.target.type ===
        "checkbox"
          ? e.target.checked
          : e.target.value,
    });
  };

  const submit = (e) => {
    e.preventDefault();

    const d = {
      id: Date.now().toString(),
      donor: f.anonymous
        ? "Anonymous Donor"
        : f.name,

      amount: Number(f.amount),

      cause: f.cause,

      date:
        new Date().toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),

      anonymous: f.anonymous,

      status: "Completed",
    };

    saveD([d, ...getD()]);

    setOk(d);

    setF({
      name: "",
      email: "",
      cause: causes[0][0],
      amount: "",
      payment: "UPI",
      anonymous: false,
      message: "",
    });
  };

  return (
    <>
      <PublicNav />

      <section className="formPage">
        <span className="eyebrow">
          Your support makes a real
          difference.
        </span>

        <h1>Add Donation</h1>

        <p className="sub">
          Make a contribution to a cause
          you care about.
        </p>

        {ok && (
          <div className="success">
            <span>✓</span>

            <div>
              <b>
                Donation recorded
                successfully!
              </b>

              <small>
                {ok.anonymous
                  ? "Anonymous Donor"
                  : ok.donor}{" "}
                donated{" "}
                {money(ok.amount)} to{" "}
                {ok.cause}.
              </small>
            </div>

            <button
              onClick={() =>
                setOk(null)
              }
            >
              ×
            </button>
          </div>
        )}

        <div className="donationLayout">
          <form
            className="donationForm"
            onSubmit={submit}
          >
            <div className="fields">
              <label>
                Donor name

                <div className="input">
                  <User />

                  <input
                    name="name"
                    value={f.name}
                    onChange={change}
                    placeholder="Enter your name"
                    required={
                      !f.anonymous
                    }
                  />
                </div>
              </label>

              <label>
                Email address

                <div className="input">
                  <Mail />

                  <input
                    name="email"
                    type="email"
                    value={f.email}
                    onChange={change}
                    placeholder="For appreciation email"
                    required
                  />
                </div>
              </label>

              <label className="full">
                Select Cause

                <div className="select">
                  <select
                    name="cause"
                    value={f.cause}
                    onChange={change}
                  >
                    {causes.map(
                      (c) => (
                        <option
                          key={c[0]}
                        >
                          {c[0]}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown />
                </div>
              </label>

              <label>
                Amount (₹)

                <div className="input">
                  <WalletCards />

                  <input
                    name="amount"
                    type="number"
                    min="1"
                    value={f.amount}
                    onChange={change}
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </label>

              <label>
                Payment Method

                <div className="select">
                  <select
                    name="payment"
                    value={f.payment}
                    onChange={change}
                  >
                    <option>
                      UPI
                    </option>

                    <option>
                      Card
                    </option>

                    <option>
                      Net Banking
                    </option>

                    <option>
                      Cash
                    </option>
                  </select>

                  <ChevronDown />
                </div>
              </label>

              <label className="anon full">
                <input
                  name="anonymous"
                  type="checkbox"
                  checked={
                    f.anonymous
                  }
                  onChange={change}
                />

                <span>
                  <b>
                    Donate anonymously
                  </b>

                  <small>
                    Your name will show
                    as “Anonymous Donor”
                    on the public
                    dashboard.
                  </small>
                </span>
              </label>

              <label className="full">
                Add a message
                (optional)

                <div className="input textarea">
                  <MessageSquare />

                  <textarea
                    name="message"
                    value={f.message}
                    onChange={change}
                    placeholder="E.g. Keep up the good work!"
                  />
                </div>
              </label>
            </div>

            <button className="btn primary full">
              Donate Now ♡
            </button>

            <div className="secure">
              <ShieldCheck />
              Frontend demo: no real
              payment is processed.
            </div>
          </form>

          <aside className="donationAside">
            <div className="plant">
              🌱
            </div>

            <h3>
              Education builds
              brighter futures.
            </h3>

            <p>
              Your kindness can help
              someone learn, heal, grow
              and hope.
            </p>

            <hr />

            <b>
              Thank you for giving.
            </b>
          </aside>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   CAUSES PAGE
========================================================= */

function Causes() {
  return (
    <>
      <PublicNav />

      <section className="causesHero">
        <span className="eyebrow">
          Support What Matters
        </span>

        <h1>
          Choose a cause.
          <br />
          <em>Create an impact.</em>
        </h1>

        <p>
          Every contribution helps
          Tripti Foundation support
          people, communities, animals
          and our environment.
        </p>
      </section>

      <section className="section">
        <div className="causeGrid two">
          {causes.map((c) => (
            <CauseCard
              key={c[0]}
              c={c}
              large
            />
          ))}
        </div>
      </section>
    </>
  );
}

/* =========================================================
   MY DONATIONS
========================================================= */

function MyDonations() {
  const [ds, setDs] =
    useState(getD());

  const [q, setQ] =
    useState("");

  useEffect(() => {
    const update = () => {
      setDs(getD());
    };

    window.addEventListener(
      "tripti-update",
      update
    );

    return () => {
      window.removeEventListener(
        "tripti-update",
        update
      );
    };
  }, []);

  const rows = ds.filter((d) =>
    `${d.cause}${d.donor}${d.amount}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <>
      <div className="top">
        <div>
          <h1>
            My Donations
          </h1>

          <p>
            View and manage your
            donation history.
          </p>
        </div>

        <div className="search">
          <Search />

          <input
            placeholder="Search by cause or date..."
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
          />

          <SlidersHorizontal />
        </div>
      </div>

      <div className="table">
        <div className="thead">
          <span>Cause</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Status</span>
        </div>

        {rows.map((d) => (
          <div
            className="trow"
            key={d.id}
          >
            <div>
              <b>{d.cause}</b>

              <small>
                {d.anonymous
                  ? "Anonymous contribution"
                  : "Your contribution"}
              </small>
            </div>

            <b>
              {money(d.amount)}
            </b>

            <span>{d.date}</span>

            <em>{d.status}</em>
          </div>
        ))}
      </div>
    </>
  );
}

/* =========================================================
   IMPACT
========================================================= */

function Impact() {
  return (
    <>
      <div className="top">
        <div>
          <h1>
            Your Impact
          </h1>

          <p>
            See how your contributions
            are making a difference.
          </p>
        </div>

        <select className="year">
          <option>
            This Year
          </option>

          <option>
            Last Year
          </option>
        </select>
      </div>

      <div className="impactStats">
        <div>
          <Leaf />
          <b>5</b>
          <small>
            Causes Supported
          </small>
        </div>

        <div>
          <Users />
          <b>1,250+</b>
          <small>
            Lives Impacted
          </small>
        </div>

        <div>
          <TreePine />
          <b>500+</b>
          <small>
            Trees Planted
          </small>
        </div>

        <div>
          <Heart />
          <b>100%</b>
          <small>
            Your Impact Score
          </small>
        </div>
      </div>

      <div className="impactGrid">
        <div className="table">
          <h3>
            Recent Impact
          </h3>

          {[
            [
              "Helped provide clean drinking water",
              "Healthcare Support",
            ],
            [
              "Supported education for 20+ children",
              "Education for All",
            ],
            [
              "Planted 100 trees in rural areas",
              "Environment",
            ],
          ].map((x, i) => (
            <div
              className="impactRow"
              key={i}
            >
              <span>
                {i === 0
                  ? "♡"
                  : i === 1
                  ? "▣"
                  : "♣"}
              </span>

              <div>
                <b>{x[0]}</b>
                <small>{x[1]}</small>
              </div>

              <time>
                {
                  [
                    "10 Aug 2026",
                    "28 Jul 2026",
                    "15 Jul 2026",
                  ][i]
                }
              </time>
            </div>
          ))}
        </div>

        <div className="quote">
          <Leaf size={32} />

          <blockquote>
            “A little kindness goes a
            long way.”
          </blockquote>

          <span>
            Tripti Foundation
          </span>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function Profile() {
  const u =
    getUser() || {
      name: "Khushi Singh",
      email: "khushi@example.com",
    };

  const [f, setF] =
    useState({
      ...u,
      phone: "",
      city: "",
    });

  const [saved, setSaved] =
    useState(false);

  const submit = (e) => {
    e.preventDefault();

    localStorage.setItem(
      "tripti_user",
      JSON.stringify({
        name: f.name,
        email: f.email,
      })
    );

    setSaved(true);

    setTimeout(
      () => setSaved(false),
      1800
    );
  };

  return (
    <>
      <div className="top">
        <div>
          <h1>Profile</h1>

          <p>
            Manage your personal
            information.
          </p>
        </div>
      </div>

      <form
        className="profile"
        onSubmit={submit}
      >
        <div className="profileAvatar">
          {f.name[0]}
        </div>

        <div className="profileFields">
          <label>
            Full name

            <div className="input">
              <User />

              <input
                value={f.name}
                onChange={(e) =>
                  setF({
                    ...f,
                    name: e.target.value,
                  })
                }
              />
            </div>
          </label>

          <label>
            Email

            <div className="input">
              <Mail />

              <input
                value={f.email}
                onChange={(e) =>
                  setF({
                    ...f,
                    email:
                      e.target.value,
                  })
                }
              />
            </div>
          </label>

          <label>
            Phone

            <div className="input">
              <Phone />

              <input
                value={f.phone}
                onChange={(e) =>
                  setF({
                    ...f,
                    phone:
                      e.target.value,
                  })
                }
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </label>

          <label>
            City

            <div className="input">
              <MapPin />

              <input
                value={f.city}
                onChange={(e) =>
                  setF({
                    ...f,
                    city:
                      e.target.value,
                  })
                }
                placeholder="Your city"
              />
            </div>
          </label>
        </div>

        <div className="profileActions">
          {saved && (
            <span>
              Profile saved ✓
            </span>
          )}

          <button className="btn primary">
            <Save />
            Save Profile
          </button>
        </div>
      </form>
    </>
  );
}

/* =========================================================
   PROTECTED ROUTE
========================================================= */

function Protected({
  children,
}) {
  const user = getUser();

  if (!user) {
    return <RedirectLogin />;
  }

  return children;
}

function RedirectLogin() {
  const nav = useNavigate();

  useEffect(() => {
    nav("/login", {
      replace: true,
    });
  }, [nav]);

  return null;
}

/* =========================================================
   MAIN ROUTER
========================================================= */

function AppRouter() {
  const location = useLocation();

  const path = location.pathname;

  /*
     IMPORTANT:
     Each URL renders ONLY ONE page.
  */

  if (path === "/") {
    return <Home />;
  }

  if (path === "/login") {
    return <Auth />;
  }

  if (path === "/signup") {
    return <Auth signup />;
  }

  /*
     Dashboard is PUBLIC.
     Anyone can see the live donations.
  */

  if (path === "/dashboard") {
    return <Dashboard />;
  }

  /*
     Donation page is PUBLIC.
  */

  if (path === "/add-donation") {
    return <AddDonation />;
  }

  /*
     Causes are PUBLIC.
  */

  if (path === "/causes") {
    return <Causes />;
  }

  /*
     These pages use the dashboard layout
     and require login.
  */

  if (path === "/my-donations") {
    return (
      <Layout>
        <Protected>
          <MyDonations />
        </Protected>
      </Layout>
    );
  }

  if (path === "/impact") {
    return (
      <Layout>
        <Protected>
          <Impact />
        </Protected>
      </Layout>
    );
  }

  if (path === "/profile") {
    return (
      <Layout>
        <Protected>
          <Profile />
        </Protected>
      </Layout>
    );
  }

  /*
     Unknown URL
     → go to Home
  */

  return <Home />;
}

/* =========================================================
   START REACT
========================================================= */

createRoot(
  document.getElementById("root")
).render(
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
);