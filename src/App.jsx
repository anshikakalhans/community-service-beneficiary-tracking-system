import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth";
import { ToastProvider } from "./ui";
import { PortalLayout, PublicLayout } from "./layouts";
import Home from "./pages/Home";
import Causes from "./pages/Causes";
import Donate from "./pages/Donate";
import Live from "./pages/Live";
import ProofGallery from "./pages/ProofGallery";
import Auth from "./pages/Auth";
import Dashboard from "./portal/Dashboard";
import MyDonations from "./portal/MyDonations";
import { Beneficiaries, Assistance, PendingSupport } from "./portal/Records";
import ProofsAdmin from "./portal/ProofsAdmin";
import Profile from "./portal/Profile";

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/causes" element={<Causes />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/add-donation" element={<Navigate to="/donate" replace />} />
              <Route path="/live" element={<Live />} />
              <Route path="/delivery-proof" element={<ProofGallery />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth signup />} />
            </Route>
            <Route element={<PortalLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-donations" element={<MyDonations />} />
              <Route path="/beneficiaries" element={<Beneficiaries />} />
              <Route path="/assistance" element={<Assistance />} />
              <Route path="/pending-support" element={<PendingSupport />} />
              <Route path="/delivery-proof/manage" element={<ProofsAdmin />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}
