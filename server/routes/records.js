import { Router } from "express";
import { Beneficiary, Assistance, PendingSupport, Donation } from "../models.js";
import { ASSISTANCE_TYPES, PRIORITIES } from "../causes.js";
import { HttpError, wrap, text, DATE_RE, requireUser, requireAdmin, validId } from "../middleware.js";
import { beneficiaryOut, assistanceOut, pendingOut } from "../serialize.js";

function parseBeneficiary(body) {
  const name = text(body.name, 120);
  const contact = text(body.contact, 40);
  if (!name || !contact) throw new HttpError(400, "Beneficiary name and contact number are required.");
  const age = body.age === "" || body.age == null ? null : Number(body.age);
  if (age !== null && (!Number.isInteger(age) || age < 0 || age > 130)) throw new HttpError(400, "Please enter a valid age.");
  return { name, age, contact, address: text(body.address, 300), support: text(body.support, 200) };
}

function parseAssistance(body) {
  const beneficiary = text(body.beneficiary, 120);
  const type = text(body.type, 60);
  const date = text(body.date, 10);
  if (!beneficiary || !type || !date) throw new HttpError(400, "Beneficiary, assistance type and date are required.");
  if (!ASSISTANCE_TYPES.includes(type)) throw new HttpError(400, "Unknown assistance type.");
  if (!DATE_RE.test(date)) throw new HttpError(400, "Please enter a valid date.");
  return { beneficiary, type, date, description: text(body.description, 500) };
}

function parsePending(body) {
  const beneficiary = text(body.beneficiary, 120);
  const requiredSupport = text(body.requiredSupport, 200);
  const priority = text(body.priority, 10);
  if (!beneficiary || !requiredSupport) throw new HttpError(400, "Beneficiary and required support are needed.");
  if (priority && !PRIORITIES.includes(priority)) throw new HttpError(400, "Priority must be High, Medium or Low.");
  return { beneficiary, requiredSupport, priority, description: text(body.description, 500) };
}

export function recordRoutes() {
  const router = Router();
  const admin = requireAdmin();

  function crud(path, Model, out, parse) {
    router.get(
      path,
      requireUser,
      wrap(async (req, res) => {
        const rows = await Model.find().sort({ createdAt: -1 }).lean();
        res.json({ records: rows.map((r) => out(r, req.user.role === "admin")) });
      }),
    );
    router.post(
      path,
      admin,
      wrap(async (req, res) => {
        const doc = await Model.create({ ...parse(req.body), createdBy: req.user._id });
        res.status(201).json({ record: out(doc.toObject(), true) });
      }),
    );
    router.delete(
      `${path}/:id`,
      admin,
      wrap(async (req, res) => {
        await Model.deleteOne({ _id: validId(req.params.id) });
        res.json({ ok: true });
      }),
    );
  }

  crud("/beneficiaries", Beneficiary, beneficiaryOut, parseBeneficiary);
  crud("/assistance", Assistance, assistanceOut, parseAssistance);
  crud("/pending-support", PendingSupport, pendingOut, parsePending);

  router.get(
    "/dashboard",
    requireUser,
    wrap(async (req, res) => {
      const isAdmin = req.user.role === "admin";
      const [beneficiaries, assistance, pending, typeRows, recentAssistance, recentBeneficiaries, raised, donationCount] = await Promise.all([
        Beneficiary.countDocuments(),
        Assistance.countDocuments(),
        PendingSupport.countDocuments(),
        Assistance.aggregate([{ $group: { _id: "$type", n: { $sum: 1 } } }]),
        Assistance.find().sort({ createdAt: -1 }).limit(5).lean(),
        Beneficiary.find().sort({ createdAt: -1 }).limit(5).lean(),
        Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
        Donation.countDocuments(),
      ]);
      const byType = Object.fromEntries(ASSISTANCE_TYPES.map((t) => [t, 0]));
      for (const row of typeRows) byType[row._id] = row.n;
      res.json({
        beneficiaries,
        assistance,
        pending,
        active: beneficiaries + assistance + pending,
        raised: raised[0]?.total || 0,
        donations: donationCount,
        byType,
        recentAssistance: recentAssistance.map(assistanceOut),
        recentBeneficiaries: recentBeneficiaries.map((r) => beneficiaryOut(r, isAdmin)),
      });
    }),
  );

  return router;
}
