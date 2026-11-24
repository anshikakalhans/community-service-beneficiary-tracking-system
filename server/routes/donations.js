import { Router } from "express";
import { Donation, Beneficiary, DeliveryProof } from "../models.js";
import { CAUSES, CAUSE_NAMES } from "../causes.js";
import { HttpError, wrap, text, EMAIL_RE, limitParam, requireUser } from "../middleware.js";
import { donationOut, prettyDate } from "../serialize.js";
import { thankYouEmail } from "../emails.js";

export function donationRoutes({ config, mailer }) {
  const router = Router();

  router.get(
    "/summary",
    wrap(async (req, res) => {
      const [raisedByCause, countByCause, raisedTotal, donationCount, donors, beneficiaries, deliveries] = await Promise.all([
        Donation.aggregate([{ $group: { _id: "$cause", raised: { $sum: "$amount" } } }]),
        Donation.aggregate([{ $group: { _id: "$cause", donations: { $sum: 1 } } }]),
        Donation.aggregate([{ $group: { _id: null, raised: { $sum: "$amount" } } }]),
        Donation.countDocuments(),
        Donation.distinct("email"),
        Beneficiary.countDocuments(),
        DeliveryProof.countDocuments(),
      ]);
      const raisedMap = new Map(raisedByCause.map((r) => [r._id, r.raised]));
      const countMap = new Map(countByCause.map((r) => [r._id, r.donations]));
      res.json({
        totals: {
          raised: raisedTotal[0]?.raised || 0,
          donations: donationCount,
          donors: donors.length,
          beneficiaries,
          deliveries,
        },
        causes: CAUSES.map((c) => ({
          ...c,
          raised: raisedMap.get(c.name) || 0,
          donations: countMap.get(c.name) || 0,
        })),
      });
    }),
  );

  router.get(
    "/donations",
    wrap(async (req, res) => {
      const rows = await Donation.find().sort({ createdAt: -1 }).limit(limitParam(req.query.limit)).lean();
      res.json({ donations: rows.map((d) => donationOut(d)) });
    }),
  );

  router.get(
    "/donations/mine",
    requireUser,
    wrap(async (req, res) => {
      const admin = req.user.role === "admin";
      const filter = admin ? {} : { $or: [{ user: req.user._id }, { email: req.user.email }] };
      const [rows, proofIds] = await Promise.all([
        Donation.find(filter).sort({ createdAt: -1 }).limit(500).lean(),
        DeliveryProof.distinct("donation"),
      ]);
      const proved = new Set(proofIds.map(String));
      res.json({
        scope: admin ? "all" : "mine",
        donations: rows.map((d) => ({ ...donationOut(d, true), hasProof: proved.has(String(d._id)) })),
      });
    }),
  );

  router.post(
    "/donations",
    wrap(async (req, res) => {
      const body = req.body;
      const amount = Number(body.amount);
      const cause = text(body.cause, 80);
      const email = text(body.email, 120).toLowerCase();
      const anonymous = body.anonymous === true;
      const name = text(body.name, 80) || req.user?.name || "Guest Donor";
      if (!Number.isFinite(amount) || amount < 1 || amount > 100000000) {
        throw new HttpError(400, "Please enter a valid donation amount.");
      }
      if (!CAUSE_NAMES.includes(cause)) throw new HttpError(400, "Please select a cause.");
      if (!EMAIL_RE.test(email)) {
        throw new HttpError(400, "Please enter a valid email address to receive your thank-you email.");
      }

      const donation = await Donation.create({
        user: req.user?._id ?? null,
        donorName: name,
        email,
        amount,
        cause,
        message: text(body.message, 1000),
        anonymous,
      });

      const mail = thankYouEmail({
        ngoName: config.ngoName,
        frontendUrl: config.frontendUrl,
        donorName: anonymous ? "Donor" : name,
        amount,
        cause,
        date: prettyDate(donation.createdAt),
      });
      const result = await mailer.send({ to: email, ...mail });
      donation.emailStatus = result.sent ? "sent" : "failed";
      await donation.save();

      res.status(201).json({ donation: donationOut(donation), email: { sent: result.sent, to: email } });
    }),
  );

  return router;
}
