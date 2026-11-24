const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export const prettyDate = (value) => dateFmt.format(new Date(value));

export const userOut = (u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role });

export const donationOut = (d, reveal = false) => ({
  id: String(d._id),
  donor: d.anonymous && !reveal ? "Anonymous Donor" : d.donorName,
  amount: d.amount,
  cause: d.cause,
  date: prettyDate(d.createdAt),
  anonymous: Boolean(d.anonymous),
  status: d.status,
  createdAt: d.createdAt,
  ...(reveal ? { email: d.email, emailStatus: d.emailStatus, message: d.message || "" } : {}),
});

const maskContact = (c) => (c.length > 4 ? "•".repeat(c.length - 4) + c.slice(-4) : "••••");

export const beneficiaryOut = (r, admin) => ({
  id: String(r._id),
  name: r.name,
  age: r.age ?? "",
  contact: admin ? r.contact : maskContact(r.contact),
  address: admin ? r.address : r.address ? "Hidden for privacy" : "",
  support: r.support,
  createdAt: r.createdAt,
});

export const assistanceOut = (r) => ({
  id: String(r._id),
  beneficiary: r.beneficiary,
  type: r.type,
  date: r.date,
  description: r.description,
  createdAt: r.createdAt,
});

export const pendingOut = (r) => ({
  id: String(r._id),
  beneficiary: r.beneficiary,
  requiredSupport: r.requiredSupport,
  priority: r.priority,
  description: r.description,
  createdAt: r.createdAt,
});

export const proofOut = (p) => {
  const d = p.donation && p.donation._id ? p.donation : null;
  return {
    id: String(p._id),
    donationId: String(d ? d._id : p.donation),
    donor: !d ? "Donor" : d.anonymous ? "Anonymous Donor" : d.donorName,
    cause: d ? d.cause : "",
    amount: d ? d.amount : 0,
    beneficiary: p.beneficiary,
    deliveredDate: p.deliveredDate,
    description: p.description,
    image: `/api/proofs/${p._id}/image`,
    createdAt: p.createdAt,
  };
};
