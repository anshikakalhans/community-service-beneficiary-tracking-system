import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Camera,
  HandHeart,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Clock,
  UserRound,
  Users,
  X,
  Home as HomeIcon,
} from "lucide-react";
import { useAuth } from "./auth";
import { Logo, Loading } from "./ui";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function PublicLayout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    ["/", "Home", true],
    ["/causes", "Causes"],
    ["/live", "Live Activity"],
    ["/delivery-proof", "Delivery Proof"],
  ];

  return (
    <div className="site">
      <ScrollToTop />
      <header className="nav">
        <div className="navInner">
          <Logo />
          <nav className={`navLinks ${open ? "open" : ""}`}>
            {links.map(([to, label, end]) => (
              <NavLink key={to} to={to} end={end}>
                {label}
              </NavLink>
            ))}
            <div className="navActions">
              {user ? (
                <>
                  <NavLink to="/dashboard" className="btn ghost sm">
                    <LayoutDashboard size={16} /> Dashboard
                  </NavLink>
                  <button
                    className="btn ghost sm"
                    onClick={() => {
                      signOut();
                      navigate("/");
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="btn ghost sm">
                    Login
                  </NavLink>
                  <NavLink to="/signup" className="btn ghost sm">
                    Sign up
                  </NavLink>
                </>
              )}
              <Link to="/donate" className="btn accent sm">
                <Heart size={16} /> Donate
              </Link>
            </div>
          </nav>
          <button className="menuBtn" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footerInner">
          <div className="footerBrand">
            <div className="footerLogo">
              <img src="/tripti-logo.jpg" alt="Tripti Foundation" />
            </div>
            <p>Every rupee is recorded, and every delivery is shown with a photo.</p>
          </div>
          <div className="footerCols">
            <div>
              <b>Explore</b>
              <Link to="/causes">Causes</Link>
              <Link to="/live">Live Activity</Link>
              <Link to="/delivery-proof">Delivery Proof</Link>
            </div>
            <div>
              <b>Get involved</b>
              <Link to="/donate">Donate</Link>
              <Link to="/signup">Create an account</Link>
              <Link to="/login">NGO / Donor login</Link>
            </div>
          </div>
        </div>
        <div className="footerBar">
          © {new Date().getFullYear()} Tripti Foundation · An Education Trust · Registration under govt of NCT of Delhi
        </div>
      </footer>
    </div>
  );
}

const portalLinks = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/my-donations", "Donations", Receipt],
  ["/beneficiaries", "Beneficiaries", Users],
  ["/assistance", "Assistance", HandHeart],
  ["/pending-support", "Pending Support", Clock],
  ["/delivery-proof/manage", "Delivery Proof", Camera],
  ["/profile", "Profile", UserRound],
];

export function PortalLayout() {
  const { user, ready, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!ready) return <Loading label="Checking your login..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="portal">
      <ScrollToTop />
      <div className={`scrim ${open ? "show" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sideLogo">
          <Logo />
        </div>
        <nav className="sideNav">
          {portalLinks.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === "/dashboard"}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sideFoot">
          <Link to="/" className="sideLink">
            <HomeIcon size={17} /> Back to website
          </Link>
          <button
            className="sideLink"
            onClick={() => {
              signOut();
              navigate("/");
            }}
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>
      <div className="portalMain">
        <div className="topbar">
          <button className="menuBtn" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="topbarSpacer" />
          <Link to="/donate" className="btn accent sm">
            <Heart size={15} /> Donate
          </Link>
          <div className="whoami">
            <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <b>{user.name}</b>
              <small className={isAdmin ? "role admin" : "role"}>{isAdmin ? "NGO Admin" : "Donor"}</small>
            </div>
          </div>
        </div>
        <div className="portalContent">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
