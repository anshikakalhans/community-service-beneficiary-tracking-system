import { Router } from "express";
import { Donation, DeliveryProof } from "../models.js";
import { HttpError, wrap, text, DATE_RE, limitParam, requireAdmin, validId } from "../middleware.js";
import { proofOut } from "../serialize.js";
import { proofUploadedEmail } from "../emails.js";

const MAX_IMAGE = 3 * 1024 * 1024;
const POPULATE = ["donation", "donorName anonymous cause amount"];

function decodeImage(value) {
  const image = String(value || "");
  const comma = image.indexOf(",");
  const header = comma > 0 ? image.slice(0, comma) : "";
  if (!/^data:image\/(jpeg|png|webp);base64$/.test(header)) {
    throw new HttpError(400, "Please upload a delivery photo (JPG, PNG or WebP).");
  }
  const buffer = Buffer.from(image.slice(comma + 1), "base64");
  if (buffer.length === 0 || buffer.length > MAX_IMAGE) throw new HttpError(400, "The photo is too large. Try a smaller photo.");
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isPng = buffer.subarray(0, 4).toString("hex") === "89504e47";
  const isWebp = buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  if (!isJpeg && !isPng && !isWebp) throw new HttpError(400, "That file is not a valid image.");
  return { data: buffer, contentType: isJpeg ? "image/jpeg" : isPng ? "image/png" : "image/webp" };
}

export function proofRoutes({ config, mailer }) {
  const router = Router();

  router.get(
    "/proofs",
    wrap(async (req, res) => {
      const rows = await DeliveryProof.find()
        .select("-image.data")
        .populate(...POPULATE)
        .sort({ createdAt: -1 })
        .limit(limitParam(req.query.limit))
        .lean();
      res.json({ proofs: rows.map(proofOut) });
    }),
  );

  router.get(
    "/proofs/:id/image",
    wrap(async (req, res) => {
      const proof = await DeliveryProof.findById(validId(req.params.id)).select("image").lean();
      if (!proof?.image?.data) throw new HttpError(404, "Not found.");
      const bytes = Buffer.from(proof.image.data.buffer ?? proof.image.data);
      res.set({
        "Content-Type": proof.image.contentType || "image/jpeg",
        "Content-Length": bytes.length,
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      res.end(bytes);
    }),
  );

  router.post(
    "/proofs",
    requireAdmin("Only admin can add the proof"),
    wrap(async (req, res) => {
      const body = req.body;
      const beneficiary = text(body.beneficiary, 160);
      const deliveredDate = text(body.deliveredDate, 10);
      if (!beneficiary) throw new HttpError(400, "Please enter the beneficiary or receiving organisation.");
      if (!DATE_RE.test(deliveredDate)) throw new HttpError(400, "Please select the delivery date.");
      const donation = validIdOrNull(body.donationId) ? await Donation.findById(body.donationId) : null;
      if (!donation) throw new HttpError(404, "The selected donation was not found. Please refresh and try again.");
      const image = decodeImage(body.image);

      const proof = await DeliveryProof.create({
        donation: donation._id,
        beneficiary,
        deliveredDate,
        description: text(body.description, 500),
        image,
        uploadedBy: req.user._id,
      });

      const mail = proofUploadedEmail({
        ngoName: config.ngoName,
        frontendUrl: config.frontendUrl,
        donorName: donation.anonymous ? "Donor" : donation.donorName,
        amount: donation.amount,
        cause: donation.cause,
        beneficiary,
      });
      const result = await mailer.send({ to: donation.email, ...mail });
      if (result.sent) {
        proof.donorNotified = true;
        await proof.save();
      }

      const row = await DeliveryProof.findById(proof._id)
        .select("-image.data")
        .populate(...POPULATE)
        .lean();
      res.status(201).json({ proof: proofOut(row), donorNotified: result.sent });
    }),
  );

  router.delete(
    "/proofs/:id",
    requireAdmin(),
    wrap(async (req, res) => {
      await DeliveryProof.deleteOne({ _id: validId(req.params.id) });
      res.json({ ok: true });
    }),
  );

  return router;
}

function validIdOrNull(id) {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}
