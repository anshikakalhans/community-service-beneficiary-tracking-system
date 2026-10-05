import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
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
   CAUSES DATA
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


/* =========================================================
   SAMPLE DONATIONS
========================================================= */

const seed = [
  {
    id: "1",
    donor: "Rahul",
    amount: 2500,
    cause: "Education for All",
    date: "12 Sep 2026",
    anonymous: false,
    status: "Completed",
    email: "rahul@example.com",
  },
  {
    id: "2",
    donor: "Anonymous Donor",
    amount: 5000,
    cause: "Healthcare Support",
    date: "11 Sep 2026",
    anonymous: true,
    status: "Completed",
    email: "",
  },
  {
    id: "3",
    donor: "Priya",
    amount: 1500,
    cause: "Tree Plantation",
    date: "09 Sep 2026",
    anonymous: false,
    status: "Completed",
    email: "priya@example.com",
  },
  {
    id: "4",
    donor: "Neha",
    amount: 3000,
    cause: "Animal Welfare",
    date: "07 Sep 2026",
    anonymous: false,
    status: "Completed",
    email: "neha@example.com",
  },
  {
    id: "5",
    donor: "Anonymous Donor",
    amount: 2000,
    cause: "Education for All",
    date: "05 Sep 2026",
    anonymous: true,
    status: "Completed",
    email: "",
  },
];


/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

const getD = () => {
  try {
    const stored = JSON.parse(
      localStorage.getItem("tripti_donations")
    );

    if (Array.isArray(stored) && stored.length > 0) {
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

  window.dispatchEvent(
    new Event("tripti-update")
  );
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


const money = (number) => {
  return `₹${Number(number || 0).toLocaleString("en-IN")}`;
};


const today = () => {
  return new Date().toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


/* =========================================================
   LOGO
========================================================= */

function Logo() {
  return (
    <Link
      to="/"
      className="logoLink"
    >
      <div className="logo">
        <div className="logoImageWrap">
          <img
            src="/tripti-logo.jpg"
            alt="Tripti Foundation"
          />
        </div>
      </div>
    </Link>
  );
}


/* =========================================================
   PUBLIC NAVBAR
========================================================= */

function PublicNav() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(getUser());

  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => {
      setUser(getUser());
    };

    window.addEventListener(
      "tripti-user-update",
      updateUser
    );

    return () => {
      window.removeEventListener(
        "tripti-user-update",
        updateUser
      );
    };
  }, []);


  const closeMenu = () => {
    setOpen(false);
  };


  const logout = () => {
    localStorage.removeItem(
      "tripti_user"
    );

    setUser(null);

    closeMenu();

    navigate("/");
  };


  return (
    <header className="publicNav">

      <div className="navInner">

        <Logo />

        <button
          className="mobileMenu"
          onClick={() =>
            setOpen(!open)
          }
        >
          {open ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>


        <nav
          className={`navLinks ${
            open ? "open" : ""
          }`}
        >

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/causes"
            onClick={closeMenu}
          >
            Causes
          </Link>

          <Link
            to="/dashboard"
            onClick={closeMenu}
          >
            Live Dashboard
          </Link>

          <Link
            to="/add-donation"
            onClick={closeMenu}
          >
            Donate
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={closeMenu}
              >
                Profile
              </Link>

              <button
                className="navLogout"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                className="signupBtn"
                to="/signup"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </>
          )}

        </nav>

      </div>

    </header>
  );
}


/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  open,
  onClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    [
      "/dashboard",
      "Dashboard",
      HomeIcon,
    ],
    [
      "/my-donations",
      "My Donations",
      WalletCards,
    ],
    [
      "/causes",
      "Causes",
      Heart,
    ],
    [
      "/add-donation",
      "Add Donation",
      PlusCircle,
    ],
    [
      "/impact",
      "Impact",
      BarChart3,
    ],
    [
      "/profile",
      "Profile",
      User,
    ],
  ];


  const logout = () => {
    localStorage.removeItem(
      "tripti_user"
    );

    navigate("/");

    onClose();
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

        <div className="sidebarLogo">
          <Logo />
        </div>


        <nav className="sideNav">

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
                <Icon size={18} />

                <span>
                  {label}
                </span>
              </Link>
            )
          )}

        </nav>


        <button
          className="sidebarLogout"
          onClick={logout}
        >
          <LogOut size={18} />

          <span>
            Logout
          </span>
        </button>

      </aside>
    </>
  );
}


/* =========================================================
   APP LAYOUT
========================================================= */

function Layout({ children }) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="dashboardApp">

      <Sidebar
        open={open}
        onClose={() =>
          setOpen(false)
        }
      />

      <main className="dashboardMain">

        <button
          className="sideBtn"
          onClick={() =>
            setOpen(true)
          }
        >
          <Menu size={22} />
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
  const list = donations.slice(
    0,
    compact ? 5 : 12
  );


  return (
    <section className="feed">

      <div className="feedHead">

        <div>
          <h3>
            Live Donation Activity
          </h3>

          <p>
            Every contribution creates
            a little more impact.
          </p>
        </div>

        <span className="liveBadge">
          <i />
          LIVE
        </span>

      </div>


      {list.length === 0 ? (
        <div className="emptyState">
          No donations yet.
        </div>
      ) : (
        list.map((d) => (

          <div
            className="feedRow"
            key={d.id}
          >

            <span className="feedAvatar">
              {d.anonymous
                ? "♡"
                : d.donor?.charAt(0)
                  ?.toUpperCase() || "D"}
            </span>


            <div className="feedInfo">

              <b>
                {d.anonymous
                  ? "Anonymous Donor"
                  : d.donor}
              </b>

              <small>
                donated to {d.cause}
              </small>

            </div>


            <div className="feedAmount">

              <b>
                {money(d.amount)}
              </b>

              <small>
                {d.date}
              </small>

            </div>

          </div>

        ))
      )}

    </section>
  );
}


/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  const [ds, setDs] =
    useState(getD());


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
    (a, d) =>
      a + Number(d.amount),
    0
  );


  return (
    <>
      <PublicNav />


      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="heroCopy">

          <span className="eyebrow">
            An Education Trust
          </span>


          <h1>
            Small Donations,
            <br />
            <span>
              Big Impact.
            </span>
          </h1>


          <p>
            Tripti Foundation helps you
            make a difference by supporting
            education, healthcare,
            environment and meaningful
            community initiatives.
          </p>


          <div className="actions">

            <Link
              className="btn primary"
              to="/add-donation"
            >
              Start Donating
              <ArrowRight size={17} />
            </Link>


            <Link
              className="btn outline"
              to="/causes"
            >
              Explore Causes
            </Link>

          </div>


          <div className="heroStats">

            <div className="heroStatItem">

              <Users />

              <div>
                <b>
                  1,250+
                </b>

                <small>
                  Donors
                </small>
              </div>

            </div>


            <div className="heroStatItem">

              <Heart />

              <div>
                <b>
                  50+
                </b>

                <small>
                  Causes Supported
                </small>
              </div>

            </div>


            <div className="heroStatItem">

              <WalletCards />

              <div>
                <b>
                  {money(total)}+
                </b>

                <small>
                  Total Donations
                </small>
              </div>

            </div>

          </div>

        </div>


        {/* RIGHT SIDE LOGO */}

        <div className="heroLogoArea">

          <div className="foundationLogoBox">

            <img
              src="/tripti-logo.jpg"
              alt="Tripti Foundation"
              className="foundationLogo"
            />

          </div>


          <div className="heroLogoText">

            <h3>
              Together, we can create
              <br />
              a better tomorrow.
            </h3>

            <p>
              Education • Empowerment •
              Service
            </p>

          </div>

        </div>

      </section>


      {/* ================= CAUSES ================= */}

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


      {/* ================= LIVE ACTIVITY ================= */}

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
   ICON FOR CAUSE
========================================================= */

function iconFor(name) {

  if (
    name ===
    "Healthcare Support"
  ) {
    return <HeartPulse />;
  }


  if (
    name ===
    "Animal Welfare"
  ) {
    return <PawPrint />;
  }


  if (
    name ===
    "Tree Plantation"
  ) {
    return <TreePine />;
  }


  return <BookOpen />;
}


/* =========================================================
   CAUSE CARD
========================================================= */

function CauseCard({
  c,
  large = false,
}) {

  const percentage = Math.min(
    100,
    Math.round(
      (c[4] / c[3]) * 100
    )
  );


  return (
    <article
      className={`causeCard ${
        large ? "large" : ""
      }`}
    >

      <div className="causeIcon">
        {iconFor(c[0])}
      </div>


      <small>
        Tripti Foundation
      </small>


      <h3>
        {c[0]}
      </h3>


      <p>
        {c[1]}. Support meaningful
        work and help create a
        brighter future.
      </p>


      <div className="progress">
        <i
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>


      <div className="causeMeta">

        <b>
          {money(c[4])}
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

  const [ds, setDs] =
    useState(getD());


  useEffect(() => {

    const update = () =>
      setDs(getD());


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
    (a, d) =>
      a + Number(d.amount),
    0
  );


  const supported = new Set(
    ds.map((x) => x.cause)
  ).size;


  return (
    <Layout>

      <div className="dashboardTop">

        <div>

          <h1>
            Hello, Khushi! 👋
          </h1>

          <p>
            Here's your donation journey
            at a glance.
          </p>

        </div>


        <div className="topUser">

          <Bell size={22} />

          <span className="userCircle">
            K
          </span>

          <span>
            Khushi Singh
          </span>

          <ChevronDown size={15} />

        </div>

      </div>


      {/* STATS */}

      <div className="stats">

        {[
          [
            "Total Donations",
            money(total),
            "Your total contribution",
            WalletCards,
          ],

          [
            "Donations Made",
            ds.length,
            "Total recorded donations",
            Sparkles,
          ],

          [
            "Causes Supported",
            supported,
            "Different causes",
            Heart,
          ],

          [
            "Impact Score",
            "100%",
            "Keep going!",
            Leaf,
          ],

        ].map(
          ([title, value, text, Icon], i) => (

            <div
              className="stat"
              key={title}
            >

              <span
                className={`statIcon stat${i}`}
              >
                <Icon />
              </span>


              <small>
                {title}
              </small>


              <strong>
                {value}
              </strong>


              <em>
                {text}
              </em>

            </div>

          )
        )}

      </div>


      {/* CHARTS */}

      <div className="dashGrid">

        <div className="chart">

          <h3>
            Donation Overview
          </h3>


          <div className="bars">

            {[
              55,
              72,
              82,
              105,
              88,
              115,
              130,
            ].map(
              (height, index) => (

                <div key={index}>

                  <i
                    style={{
                      height,
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
                      ][index]
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
                {supported}

                <small>
                  Causes
                </small>
              </span>

            </div>


            <div className="legend">

              <span>
                ● Education
                <b>35%</b>
              </span>

              <span>
                ● Healthcare
                <b>25%</b>
              </span>

              <span>
                ● Environment
                <b>15%</b>
              </span>

              <span>
                ● Animal Welfare
                <b>15%</b>
              </span>

              <span>
                ● Others
                <b>10%</b>
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* LIVE FEED */}

      <Feed
        donations={ds}
      />


      <div className="dashCta">

        <div>

          <h2>
            Every small act can create
            a bigger change.
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
          <Heart size={18} />
        </Link>

      </div>

    </Layout>
  );
}


/* =========================================================
   LOGIN / SIGNUP
========================================================= */

function Auth({
  signup = false,
}) {

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const navigate =
    useNavigate();


  const updateField = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });

  };


  const submit = (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (!form.email) {
      return setError(
        "Please enter your email address."
      );
    }


    if (!form.password) {
      return setError(
        "Please enter your password."
      );
    }


    if (signup) {

      if (!form.name) {
        return setError(
          "Please enter your name."
        );
      }


      if (
        form.password.length < 6
      ) {
        return setError(
          "Password must contain at least 6 characters."
        );
      }


      if (
        form.password !==
        form.confirm
      ) {
        return setError(
          "Passwords do not match."
        );
      }


      const users =
        JSON.parse(
          localStorage.getItem(
            "tripti_users"
          ) || "[]"
        );


      if (
        users.some(
          (u) =>
            u.email.toLowerCase() ===
            form.email.toLowerCase()
        )
      ) {
        return setError(
          "An account with this email already exists."
        );
      }


      const newUser = {
        name: form.name,
        email: form.email,
        password: form.password,
      };


      users.push(newUser);


      localStorage.setItem(
        "tripti_users",
        JSON.stringify(users)
      );


      localStorage.setItem(
        "tripti_user",
        JSON.stringify({
          name: form.name,
          email: form.email,
        })
      );


      window.dispatchEvent(
        new Event("tripti-user-update")
      );


      setSuccess(
        "Account created successfully!"
      );


      setTimeout(() => {
        navigate("/dashboard");
      }, 700);

    } else {

      const users =
        JSON.parse(
          localStorage.getItem(
            "tripti_users"
          ) || "[]"
        );


      const found =
        users.find(
          (u) =>
            u.email.toLowerCase() ===
              form.email.toLowerCase() &&
            u.password ===
              form.password
        );


      if (!found) {
        return setError(
          "Invalid email or password. Please create an account first."
        );
      }


      localStorage.setItem(
        "tripti_user",
        JSON.stringify({
          name: found.name,
          email: found.email,
        })
      );


      window.dispatchEvent(
        new Event("tripti-user-update")
      );


      navigate("/dashboard");

    }

  };


  return (
    <div className="authPage">

      <div className="authCard">

        <div className="authBrand">

          <img
            src="/tripti-logo.jpg"
            alt="Tripti Foundation"
          />

          <div className="authBrandText">

            <h2>
              Tripti Foundation
            </h2>

            <p>
              Education • Empowerment •
              Service
            </p>

          </div>

        </div>


        <div className="authContent">

          <span className="authEyebrow">
            {signup
              ? "Join our community"
              : "Welcome back"}
          </span>


          <h1>
            {signup
              ? "Create your account"
              : "Welcome Back!"}
          </h1>


          <p className="authSubtitle">
            {signup
              ? "Create an account and start making a difference."
              : "Login to continue your donation journey."}
          </p>


          {error && (
            <div className="authMessage error">
              {error}
            </div>
          )}


          {success && (
            <div className="authMessage success">
              {success}
            </div>
          )}


          <form
            className="authForm"
            onSubmit={submit}
          >

            {signup && (
              <label>

                <span>
                  Full Name
                </span>

                <div className="inputWrap">

                  <User size={18} />

                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="Your full name"
                  />

                </div>

              </label>
            )}


            <label>

              <span>
                Email address
              </span>

              <div className="inputWrap">

                <Mail size={18} />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="Enter your email"
                />

              </div>

            </label>


            <label>

              <span>
                Password
              </span>

              <div className="inputWrap">

                <LockKeyhole size={18} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </label>


            {signup && (
              <label>

                <span>
                  Confirm Password
                </span>

                <div className="inputWrap">

                  <LockKeyhole size={18} />

                  <input
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    name="confirm"
                    value={form.confirm}
                    onChange={updateField}
                    placeholder="Confirm your password"
                  />

                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() =>
                      setShowConfirm(
                        !showConfirm
                      )
                    }
                  >
                    {showConfirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </label>
            )}


            {!signup && (
              <div className="authOptions">

                <label className="remember">

                  <input
                    type="checkbox"
                  />

                  <span>
                    Remember me
                  </span>

                </label>

                <button
                  type="button"
                  className="forgot"
                  onClick={() =>
                    alert(
                      "Password recovery will be connected to the backend later."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>
            )}


            <button
              className="authSubmit"
              type="submit"
            >
              {signup
                ? "Create Account"
                : "Login"}
            </button>

          </form>


          <div className="authDivider">
            <span>or</span>
          </div>


          <button
            className="googleBtn"
            type="button"
            onClick={() =>
              alert(
                "Google login is a frontend demo. Connect it to a backend later."
              )
            }
          >
            <span className="googleG">
              G
            </span>

            Continue with Google
          </button>


          <p className="authBottom">

            {signup
              ? "Already have an account?"
              : "Don't have an account?"}

            {" "}

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
   CAUSES PAGE
========================================================= */

function Causes() {

  return (
    <>
      <PublicNav />

      <div className="pageContainer">

        <div className="pageHeading">

          <span className="eyebrow">
            Make a Difference
          </span>

          <h1>
            Causes that need your support
          </h1>

          <p>
            Choose a cause close to your
            heart and help create a better
            future.
          </p>

        </div>


        <div className="causePageGrid">

          {causes.map((c) => (
            <CauseCard
              key={c[0]}
              c={c}
              large
            />
          ))}

        </div>

      </div>
    </>
  );
}


/* =========================================================
   MY DONATIONS
========================================================= */

function MyDonations() {

  const [donations, setDonations] =
    useState(getD());

  const [search, setSearch] =
    useState("");


  useEffect(() => {

    const update = () =>
      setDonations(getD());

    window.addEventListener(
      "tripti-update",
      update
    );

    return () =>
      window.removeEventListener(
        "tripti-update",
        update
      );

  }, []);


  const filtered =
    donations.filter((d) =>
      `${d.cause} ${d.donor}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  return (
    <Layout>

      <div className="dashboardTop">

        <div>
          <h1>
            My Donations
          </h1>

          <p>
            View and manage your donation
            history.
          </p>
        </div>

      </div>


      <div className="tableCard">

        <div className="tableToolbar">

          <div className="searchBox">

            <Search size={18} />

            <input
              placeholder="Search by cause or donor..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          <button className="filterBtn">
            <SlidersHorizontal size={17} />
            Filter
          </button>

        </div>


        <div className="donationTable">

          <div className="tableHeader">

            <span>Cause</span>
            <span>Amount</span>
            <span>Date</span>
            <span>Status</span>

          </div>


          {filtered.map((d) => (

            <div
              className="tableRow"
              key={d.id}
            >

              <div className="tableCause">

                <span>
                  {iconFor(d.cause)}
                </span>

                <div>

                  <b>
                    {d.cause}
                  </b>

                  <small>
                    {d.anonymous
                      ? "Anonymous donation"
                      : `Donated by ${d.donor}`}
                  </small>

                </div>

              </div>


              <strong>
                {money(d.amount)}
              </strong>


              <span>
                {d.date}
              </span>


              <span className="status">
                {d.status}
              </span>

            </div>

          ))}

        </div>

      </div>

    </Layout>
  );
}


/* =========================================================
   ADD DONATION
========================================================= */

function AddDonation() {

  const currentUser =
    getUser();


  const [form, setForm] =
    useState({
      cause: causes[0][0],
      amount: "",
      email:
        currentUser?.email || "",
      name:
        currentUser?.name || "",
      message: "",
      anonymous: false,
    });


  const [message, setMessage] =
    useState("");


  const update = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });

  };


  const donate = (e) => {

    e.preventDefault();

    setMessage("");


    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      return setMessage(
        "Please enter a valid donation amount."
      );
    }


    if (!form.email) {
      return setMessage(
        "Please enter your email so we can prepare your appreciation message."
      );
    }


    const newDonation = {

      id:
        Date.now().toString(),

      donor:
        form.anonymous
          ? "Anonymous Donor"
          : form.name ||
            "Guest Donor",

      amount:
        Number(form.amount),

      cause:
        form.cause,

      date:
        today(),

      anonymous:
        form.anonymous,

      status:
        "Completed",

      email:
        form.email,

      message:
        form.message,

    };


    const updated = [
      newDonation,
      ...getD(),
    ];


    saveD(updated);


    setMessage(
      form.anonymous
        ? "Donation recorded successfully. Thank you for supporting Tripti Foundation!"
        : `Donation successful! An appreciation email has been prepared for ${form.email}.`
    );


    setForm({
      ...form,
      amount: "",
      message: "",
    });

  };


  return (
    <Layout>

      <div className="dashboardTop">

        <div>

          <h1>
            Add Donation
          </h1>

          <p>
            Your support makes a real
            difference.
          </p>

        </div>

      </div>


      <div className="donationPage">

        <form
          className="donationForm"
          onSubmit={donate}
        >

          <h2>
            Make a Donation
          </h2>


          <label>

            <span>
              Select Cause
            </span>

            <select
              name="cause"
              value={form.cause}
              onChange={update}
            >
              {causes.map(
                (c) => (
                  <option
                    key={c[0]}
                    value={c[0]}
                  >
                    {c[0]}
                  </option>
                )
              )}
            </select>

          </label>


          <div className="twoFields">

            <label>

              <span>
                Amount (₹)
              </span>

              <input
                type="number"
                name="amount"
                min="1"
                value={form.amount}
                onChange={update}
                placeholder="Enter amount"
              />

            </label>


            <label>

              <span>
                Email
              </span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={update}
                placeholder="your@email.com"
              />

            </label>

          </div>


          {!form.anonymous && (
            <label>

              <span>
                Your Name
              </span>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Enter your name"
              />

            </label>
          )}


          <label className="anonymousBox">

            <input
              type="checkbox"
              name="anonymous"
              checked={form.anonymous}
              onChange={update}
            />

            <div>

              <b>
                Donate anonymously
              </b>

              <small>
                Your name will not be shown
                on the public live dashboard.
              </small>

            </div>

          </label>


          <label>

            <span>
              Add a message (optional)
            </span>

            <textarea
              name="message"
              value={form.message}
              onChange={update}
              placeholder="Write a message..."
              rows="4"
            />

          </label>


          {message && (
            <div className="donationSuccess">
              <Mail size={19} />
              {message}
            </div>
          )}


          <button
            type="submit"
            className="donateButton"
          >
            Donate Now
            <Heart size={18} />
          </button>

        </form>


        <div className="donationInfo">

          <div className="plantImage">
            🌱
          </div>


          <h3>
            Every donation matters.
          </h3>

          <p>
            Your contribution helps Tripti
            Foundation support education,
            healthcare, environment and
            community initiatives.
          </p>


          <div className="infoPoint">

            <ShieldCheck />

            <span>
              Transparent donation tracking
            </span>

          </div>


          <div className="infoPoint">

            <Mail />

            <span>
              Appreciation message after
              your donation
            </span>

          </div>


          <div className="infoPoint">

            <Heart />

            <span>
              Make a meaningful impact
            </span>

          </div>

        </div>

      </div>

    </Layout>
  );
}


/* =========================================================
   IMPACT PAGE
========================================================= */

function Impact() {

  const donations = getD();

  const total = donations.reduce(
    (a, d) =>
      a + Number(d.amount),
    0
  );


  return (
    <Layout>

      <div className="dashboardTop">

        <div>

          <h1>
            Your Impact
          </h1>

          <p>
            See how your contributions are
            making a difference.
          </p>

        </div>

      </div>


      <div className="impactStats">

        <div>
          <Leaf />
          <strong>
            {new Set(
              donations.map(
                (d) => d.cause
              )
            ).size}
          </strong>
          <small>
            Causes Supported
          </small>
        </div>


        <div>
          <Users />
          <strong>
            1,250+
          </strong>
          <small>
            Lives Impacted
          </small>
        </div>


        <div>
          <TreePine />
          <strong>
            500+
          </strong>
          <small>
            Trees Planted
          </small>
        </div>


        <div>
          <Heart />
          <strong>
            100%
          </strong>
          <small>
            Impact Score
          </small>
        </div>

      </div>


      <div className="impactContent">

        <div className="recentImpact">

          <h2>
            Recent Impact
          </h2>


          {donations
            .slice(0, 4)
            .map((d) => (

              <div
                className="impactRow"
                key={d.id}
              >

                <span>
                  {iconFor(d.cause)}
                </span>

                <div>

                  <b>
                    Supported{" "}
                    {d.cause}
                  </b>

                  <small>
                    Contribution of{" "}
                    {money(d.amount)}
                  </small>

                </div>

                <small>
                  {d.date}
                </small>

              </div>

            ))}

        </div>


        <div className="impactQuote">

          <Heart />

          <p>
            "A little kindness goes
            a long way."
          </p>

        </div>

      </div>

    </Layout>
  );
}


/* =========================================================
   PROFILE
========================================================= */

function Profile() {

  const user =
    getUser();


  const [name, setName] =
    useState(
      user?.name || ""
    );

  const [email, setEmail] =
    useState(
      user?.email || ""
    );

  const [saved, setSaved] =
    useState(false);


  const saveProfile = (e) => {

    e.preventDefault();


    localStorage.setItem(
      "tripti_user",
      JSON.stringify({
        name,
        email,
      })
    );


    setSaved(true);


    setTimeout(() => {
      setSaved(false);
    }, 2500);

  };


  return (
    <Layout>

      <div className="dashboardTop">

        <div>

          <h1>
            Profile
          </h1>

          <p>
            Manage your account details.
          </p>

        </div>

      </div>


      <div className="profileCard">

        <div className="profileAvatar">
          {name
            ?.charAt(0)
            ?.toUpperCase() || "K"}
        </div>


        <form
          className="profileForm"
          onSubmit={saveProfile}
        >

          <label>

            <span>
              Full Name
            </span>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Your name"
            />

          </label>


          <label>

            <span>
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Your email"
            />

          </label>


          <button
            className="saveProfile"
            type="submit"
          >
            <Save size={17} />
            Save Profile
          </button>


          {saved && (
            <div className="profileSaved">
              Profile saved successfully.
            </div>
          )}

        </form>

      </div>

    </Layout>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {

  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={
          <Auth />
        }
      />

      <Route
        path="/signup"
        element={
          <Auth signup />
        }
      />

      <Route
        path="/dashboard"
        element={
          <Dashboard />
        }
      />

      <Route
        path="/my-donations"
        element={
          <MyDonations />
        }
      />

      <Route
        path="/causes"
        element={
          <Causes />
        }
      />

      <Route
        path="/add-donation"
        element={
          <AddDonation />
        }
      />

      <Route
        path="/impact"
        element={
          <Impact />
        }
      />

      <Route
        path="/profile"
        element={
          <Profile />
        }
      />

      <Route
        path="*"
        element={
          <Home />
        }
      />

    </Routes>
  );
}


/* =========================================================
   RENDER
========================================================= */

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);