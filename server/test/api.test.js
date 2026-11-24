import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { loadConfig } from "../config.js";
import { createApp } from "../app.js";
import { disconnectDb } from "../db.js";

const base = process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = `tripti_test_${Date.now()}`;
const sent = [];
const mailer = {
  async send(mail) {
    sent.push(mail);
    return { sent: true };
  },
};

const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

let api;
let admin;
let donor;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

before(async () => {
  const config = loadConfig({
    mongoUri: `${base.replace(/\/$/, "")}/${dbName}`,
    jwtSecret: "test-secret",
    admin: { name: "Test Admin", email: "admin@test.org", password: "AdminPass1" },
  });
  api = request(createApp({ config, mailer }));
  const login = await api.post("/api/auth/login").send({ email: "admin@test.org", password: "AdminPass1" });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  admin = login.body.token;
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDb();
});

test("health reports a connected database", async () => {
  const res = await api.get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.database, "connected");
});

test("bootstrapped admin has the admin role", async () => {
  const res = await api.get("/api/auth/me").set(auth(admin));
  assert.equal(res.body.user.role, "admin");
});

test("signup creates a donor, rejects duplicates and bad input", async () => {
  const ok = await api.post("/api/auth/signup").send({ name: "Dina Donor", email: "Dina@Test.org", password: "secret1" });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.user.role, "donor");
  assert.equal(ok.body.user.email, "dina@test.org");
  donor = ok.body.token;
  const dup = await api.post("/api/auth/signup").send({ name: "Dina", email: "dina@test.org", password: "secret1" });
  assert.equal(dup.status, 409);
  const short = await api.post("/api/auth/signup").send({ name: "X", email: "x@test.org", password: "123" });
  assert.equal(short.status, 400);
  const sneaky = await api.post("/api/auth/signup").send({ name: "Eve", email: "eve@test.org", password: "secret1", role: "admin" });
  assert.equal(sneaky.body.user.role, "donor");
});

test("login works and rejects a wrong password", async () => {
  const good = await api.post("/api/auth/login").send({ email: "dina@test.org", password: "secret1" });
  assert.equal(good.status, 200);
  const bad = await api.post("/api/auth/login").send({ email: "dina@test.org", password: "nope" });
  assert.equal(bad.status, 401);
});

test("profile update and password change", async () => {
  const upd = await api.put("/api/auth/me").set(auth(donor)).send({ name: "Dina D", email: "dina@test.org" });
  assert.equal(upd.body.user.name, "Dina D");
  const wrong = await api.put("/api/auth/password").set(auth(donor)).send({ currentPassword: "bad", newPassword: "newsecret" });
  assert.equal(wrong.status, 400);
  const ok = await api.put("/api/auth/password").set(auth(donor)).send({ currentPassword: "secret1", newPassword: "newsecret" });
  assert.equal(ok.status, 200);
  const login = await api.post("/api/auth/login").send({ email: "dina@test.org", password: "newsecret" });
  assert.equal(login.status, 200);
  donor = login.body.token;
});

test("protected routes need a login", async () => {
  assert.equal((await api.get("/api/beneficiaries")).status, 401);
  assert.equal((await api.get("/api/dashboard")).status, 401);
});

test("donor can view records but cannot add or delete", async () => {
  const add = await api.post("/api/beneficiaries").set(auth(donor)).send({ name: "A", contact: "9876543210" });
  assert.equal(add.status, 403);
  assert.equal(add.body.error, "Only admin can add or change this information");
  const list = await api.get("/api/beneficiaries").set(auth(donor));
  assert.equal(list.status, 200);
});

test("admin manages beneficiaries, with contact masked for donors", async () => {
  const bad = await api.post("/api/beneficiaries").set(auth(admin)).send({ name: "", contact: "" });
  assert.equal(bad.status, 400);
  const add = await api
    .post("/api/beneficiaries")
    .set(auth(admin))
    .send({ name: "Asha", age: 11, contact: "9876543210", address: "Delhi", support: "Books" });
  assert.equal(add.status, 201);
  assert.equal(add.body.record.contact, "9876543210");
  const asAdmin = await api.get("/api/beneficiaries").set(auth(admin));
  assert.equal(asAdmin.body.records[0].address, "Delhi");
  const asDonor = await api.get("/api/beneficiaries").set(auth(donor));
  assert.equal(asDonor.body.records[0].contact, "••••••3210");
  assert.equal(asDonor.body.records[0].address, "Hidden for privacy");
  const del = await api.delete(`/api/beneficiaries/${add.body.record.id}`).set(auth(admin));
  assert.equal(del.status, 200);
  assert.equal((await api.get("/api/beneficiaries").set(auth(admin))).body.records.length, 0);
  assert.equal((await api.delete("/api/beneficiaries/not-an-id").set(auth(admin))).status, 404);
});

test("admin manages assistance and pending support with validation", async () => {
  const badType = await api.post("/api/assistance").set(auth(admin)).send({ beneficiary: "Asha", type: "Nope", date: "2026-01-01" });
  assert.equal(badType.status, 400);
  const badDate = await api.post("/api/assistance").set(auth(admin)).send({ beneficiary: "Asha", type: "Food Support", date: "01/01/2026" });
  assert.equal(badDate.status, 400);
  const a = await api.post("/api/assistance").set(auth(admin)).send({ beneficiary: "Asha", type: "Food Support", date: "2026-01-01", description: "Ration" });
  assert.equal(a.status, 201);
  assert.equal((await api.get("/api/assistance").set(auth(donor))).body.records.length, 1);
  assert.equal((await api.post("/api/assistance").set(auth(donor)).send({})).status, 403);

  const badPriority = await api.post("/api/pending-support").set(auth(admin)).send({ beneficiary: "Asha", requiredSupport: "Bag", priority: "Urgent" });
  assert.equal(badPriority.status, 400);
  const p = await api.post("/api/pending-support").set(auth(admin)).send({ beneficiary: "Asha", requiredSupport: "Bag", priority: "High" });
  assert.equal(p.status, 201);
  assert.equal((await api.delete(`/api/pending-support/${p.body.record.id}`).set(auth(admin))).status, 200);
});

test("dashboard counts records", async () => {
  const res = await api.get("/api/dashboard").set(auth(donor));
  assert.equal(res.status, 200);
  assert.equal(res.body.assistance, 1);
  assert.equal(res.body.byType["Food Support"], 1);
  assert.equal(res.body.recentAssistance.length, 1);
});

let donationId;
let anonId;

test("anyone can donate, the thank-you email is sent and anonymous donors are hidden", async () => {
  const bad = await api.post("/api/donations").send({ amount: 0, cause: "Education for All", email: "a@b.co" });
  assert.equal(bad.status, 400);
  const badCause = await api.post("/api/donations").send({ amount: 100, cause: "Made Up", email: "a@b.co" });
  assert.equal(badCause.status, 400);
  const badMail = await api.post("/api/donations").send({ amount: 100, cause: "Education for All", email: "nope" });
  assert.equal(badMail.status, 400);

  const before = sent.length;
  const ok = await api
    .post("/api/donations")
    .set(auth(donor))
    .send({ amount: 1500, cause: "Education for All", email: "dina@test.org", name: "Dina D", message: "Keep going" });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.email.sent, true);
  assert.equal(sent.length, before + 1);
  assert.match(sent.at(-1).subject, /Thank you/);
  assert.match(sent.at(-1).html, /#\/delivery-proof/);
  donationId = ok.body.donation.id;

  const anon = await api.post("/api/donations").send({ amount: 500, cause: "Tree Plantation", email: "anon@test.org", name: "Secret Person", anonymous: true });
  assert.equal(anon.status, 201);
  anonId = anon.body.donation.id;
  assert.equal(anon.body.donation.donor, "Anonymous Donor");

  const feed = await api.get("/api/donations");
  assert.equal(feed.body.donations.length, 2);
  assert.ok(!JSON.stringify(feed.body).includes("Secret Person"));
  assert.ok(!JSON.stringify(feed.body).includes("anon@test.org"));
});

test("summary totals come from the database", async () => {
  const res = await api.get("/api/summary");
  assert.equal(res.body.totals.raised, 2000);
  assert.equal(res.body.totals.donations, 2);
  assert.equal(res.body.totals.donors, 2);
  const edu = res.body.causes.find((c) => c.key === "education");
  assert.equal(edu.raised, 1500);
  assert.equal(edu.donations, 1);
});

test("my donations: donors see their own, admin sees everyone with real details", async () => {
  const mine = await api.get("/api/donations/mine").set(auth(donor));
  assert.equal(mine.body.scope, "mine");
  assert.equal(mine.body.donations.length, 1);
  const all = await api.get("/api/donations/mine").set(auth(admin));
  assert.equal(all.body.scope, "all");
  assert.equal(all.body.donations.length, 2);
  assert.ok(all.body.donations.some((d) => d.donor === "Secret Person" && d.email === "anon@test.org"));
  assert.equal((await api.get("/api/donations/mine")).status, 401);
});

let proofId;

test("only admin can add delivery proof, and bad images are rejected", async () => {
  const body = { donationId, beneficiary: "Asha Primary School", deliveredDate: "2026-02-01", description: "Books handed over", image: PNG };
  const denied = await api.post("/api/proofs").set(auth(donor)).send(body);
  assert.equal(denied.status, 403);
  assert.equal(denied.body.error, "Only admin can add the proof");
  assert.equal((await api.post("/api/proofs").send(body)).status, 401);

  const noImage = await api.post("/api/proofs").set(auth(admin)).send({ ...body, image: "" });
  assert.equal(noImage.status, 400);
  const fake = await api.post("/api/proofs").set(auth(admin)).send({ ...body, image: "data:image/png;base64,aGVsbG8gd29ybGQ=" });
  assert.equal(fake.status, 400);
  const missing = await api.post("/api/proofs").set(auth(admin)).send({ ...body, donationId: "64b7f0c2a1b2c3d4e5f60718" });
  assert.equal(missing.status, 404);

  const before = sent.length;
  const ok = await api.post("/api/proofs").set(auth(admin)).send(body);
  assert.equal(ok.status, 201, JSON.stringify(ok.body));
  assert.equal(ok.body.donorNotified, true);
  assert.equal(sent.length, before + 1);
  assert.match(sent.at(-1).subject, /reached its destination/);
  assert.equal(ok.body.proof.cause, "Education for All");
  proofId = ok.body.proof.id;
});

test("proofs are public, anonymous donors stay hidden, and the photo is served", async () => {
  await api.post("/api/proofs").set(auth(admin)).send({ donationId: anonId, beneficiary: "Park Committee", deliveredDate: "2026-02-02", image: PNG });
  const list = await api.get("/api/proofs");
  assert.equal(list.body.proofs.length, 2);
  assert.ok(list.body.proofs.some((p) => p.donor === "Anonymous Donor"));
  assert.ok(!JSON.stringify(list.body).includes("Secret Person"));
  assert.ok(!JSON.stringify(list.body).includes("base64"));

  const img = await api.get(`/api/proofs/${proofId}/image`).buffer(true).parse((res, cb) => {
    const chunks = [];
    res.on("data", (c) => chunks.push(c));
    res.on("end", () => cb(null, Buffer.concat(chunks)));
  });
  assert.equal(img.status, 200);
  assert.equal(img.headers["content-type"], "image/png");
  assert.equal(img.body.subarray(0, 4).toString("hex"), "89504e47");

  const summary = await api.get("/api/summary");
  assert.equal(summary.body.totals.deliveries, 2);
});

test("my donations flags donations that have proof", async () => {
  const all = await api.get("/api/donations/mine").set(auth(admin));
  assert.ok(all.body.donations.every((d) => d.hasProof));
});

test("admin can delete a proof, donors cannot", async () => {
  assert.equal((await api.delete(`/api/proofs/${proofId}`).set(auth(donor))).status, 403);
  assert.equal((await api.delete(`/api/proofs/${proofId}`).set(auth(admin))).status, 200);
  assert.equal((await api.get(`/api/proofs/${proofId}/image`)).status, 404);
  assert.equal((await api.get("/api/proofs")).body.proofs.length, 1);
});

test("unknown API routes return 404 JSON", async () => {
  const res = await api.get("/api/nothing-here");
  assert.equal(res.status, 404);
  assert.equal(res.body.error, "Not found.");
});
