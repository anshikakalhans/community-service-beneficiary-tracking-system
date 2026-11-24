# Tripti Foundation

React + Vite website with an Express API on **MongoDB Atlas**, ready to deploy on **Vercel**.

Features: public site with live donation feed and real totals, donations with thank-you email, donor and NGO-admin logins, beneficiaries, assistance, pending support, delivery proof photos (stored in MongoDB) with donor email, profile and password change.

## 1. MongoDB Atlas

1. Create a free cluster, then **Database Access > Add user** (username and password).
2. **Network Access > Add IP address > Allow access from anywhere (0.0.0.0/0)**. Vercel has no fixed IP, so this is required.
3. **Connect > Drivers**, copy the connection string and add the database name `tripti` before the `?`:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/tripti?retryWrites=true&w=majority
```

If the password has symbols such as `@` or `#`, URL-encode them (`@` becomes `%40`).

Collections and indexes are created automatically on first use.

## 2. Run locally

```powershell
npm install
Copy-Item .env.example .env
```

Fill in `.env` (at least `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`), then:

```powershell
npm run dev
```

Site: http://localhost:5173, API: http://localhost:5000. The admin account from `.env` is created automatically on first start.

Optional demo data (fake records, delete before going live): `npm run seed`

More NGO admins: `npm run create-admin -- "Member Name" member@ngo.org "Password"`

Tests (need a MongoDB; set `TEST_MONGODB_URI` or run a local one on 27017): `npm test`

## 3. Deploy on Vercel

1. Push the project to GitHub and import it in Vercel (framework: Vite, defaults are fine; `vercel.json` is included).
2. Add these **Environment Variables**:

| Name | Value |
|---|---|
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | a long random string (required on Vercel) |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first NGO admin, created on the first request |
| `NGO_NAME` | Tripti Foundation |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | for thank-you and delivery emails (Gmail: smtp.gmail.com, 465, app password) |

3. Deploy. Open `https://YOUR-SITE.vercel.app/api/health`. It should return `{"ok":true,"database":"connected"}`. If it says it cannot connect, re-check the Atlas Network Access list and the password in `MONGODB_URI`.

`FRONTEND_URL` is optional on Vercel (the production URL is detected). Set it if you use a custom domain.

## Notes

- Routing uses `HashRouter`, so links look like `/#/donate` and refreshing a page never 404s on Vercel.
- Delivery photos are resized in the browser and stored in MongoDB, so no extra file storage is needed.
- Donations are **recorded**, not charged. There is no payment gateway; add one (for example Razorpay) if you want real payments.
- Emails are sent only if SMTP is configured; otherwise the donation still saves and the page says the email could not be sent.
