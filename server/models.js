import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "donor"], default: "donor" },
  },
  { timestamps: true },
);

const donationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    donorName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 120, index: true },
    amount: { type: Number, required: true, min: 1 },
    cause: { type: String, required: true },
    message: { type: String, default: "", maxlength: 1000 },
    anonymous: { type: Boolean, default: false },
    status: { type: String, default: "Completed" },
    emailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  },
  { timestamps: true },
);
donationSchema.index({ createdAt: -1 });

const beneficiarySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    age: { type: Number, default: null, min: 0, max: 130 },
    contact: { type: String, required: true, trim: true, maxlength: 40 },
    address: { type: String, default: "", maxlength: 300 },
    support: { type: String, default: "", maxlength: 200 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

const assistanceSchema = new Schema(
  {
    beneficiary: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, default: "", maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

const pendingSchema = new Schema(
  {
    beneficiary: { type: String, required: true, trim: true, maxlength: 120 },
    requiredSupport: { type: String, required: true, trim: true, maxlength: 200 },
    priority: { type: String, default: "" },
    description: { type: String, default: "", maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

const proofSchema = new Schema(
  {
    donation: { type: Schema.Types.ObjectId, ref: "Donation", required: true, index: true },
    beneficiary: { type: String, required: true, trim: true, maxlength: 160 },
    deliveredDate: { type: String, required: true },
    description: { type: String, default: "", maxlength: 500 },
    image: {
      data: { type: Buffer, select: false },
      contentType: { type: String, default: "image/jpeg" },
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    donorNotified: { type: Boolean, default: false },
  },
  { timestamps: true },
);
proofSchema.index({ createdAt: -1 });

export const User = models.User || model("User", userSchema);
export const Donation = models.Donation || model("Donation", donationSchema);
export const Beneficiary = models.Beneficiary || model("Beneficiary", beneficiarySchema);
export const Assistance = models.Assistance || model("Assistance", assistanceSchema, "assistance");
export const PendingSupport = models.PendingSupport || model("PendingSupport", pendingSchema);
export const DeliveryProof = models.DeliveryProof || model("DeliveryProof", proofSchema);
