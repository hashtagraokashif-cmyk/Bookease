/**
 * End-to-end API tests. Needs a running MongoDB.
 * Uses a separate database (appointment_booking_test) that is wiped before and
 * after, so your real data is never touched.
 *
 *   npm test
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import mongoose from "mongoose";

process.env.MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/appointment_booking_test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-automated-tests-only";

const { default: app } = await import("../server.js");
const { default: connectDB } = await import("../config/db.js");
const { seedDatabase } = await import("../seed/seedDatabase.js");
const { default: Provider } = await import("../models/Provider.js");
const { nowInTimezone, addDays, dayOfWeek } = await import("../utils/time.js");
const { PROVIDER_PASSWORD } = await import("../seed/data.js");

let server;
let base;

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
};

// The next date after today that the provider works.
const nextWorkingDay = (provider, offset = 1) => {
  let d = addDays(nowInTimezone().date, offset);
  while (!provider.workingDays.includes(dayOfWeek(d))) d = addDays(d, 1);
  return d;
};
const nextClosedDay = (provider) => {
  let d = addDays(nowInTimezone().date, 1);
  while (provider.workingDays.includes(dayOfWeek(d))) d = addDays(d, 1);
  return d;
};

let ali, legalConsult, docReview, day;
let customerA, customerB, aliToken, ahmedToken;
let firstBookingId;

before(async () => {
  await connectDB();
  await mongoose.connection.dropDatabase();
  await seedDatabase({ log: () => {} });
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("API health check", async () => {
  const r = await call("GET", "/api/health");
  assert.equal(r.status, 200);
  assert.equal(r.data.success, true);
});

test("services list comes from the database, with providers attached", async () => {
  const r = await call("GET", "/api/services");
  assert.equal(r.status, 200);
  assert.equal(r.data.count, 8);
  const legal = r.data.services.find((s) => s.name === "Legal Consultation");
  assert.equal(legal.provider.name, "Ali Legal Consultants");
  assert.equal(legal.provider.location, "Rawalpindi");
});

test("provider page data: each provider has its own profile and services", async () => {
  const dbAli = await Provider.findOne({ name: "Ali Legal Consultants" }).lean();
  const r = await call("GET", `/api/providers/${dbAli._id}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.provider.name, "Ali Legal Consultants"); // not "Dr. Ahmed Khan"
  assert.equal(r.data.provider.services.length, 2);
  ali = r.data.provider;
  legalConsult = ali.services.find((s) => s.name === "Legal Consultation"); // 45 min
  docReview = ali.services.find((s) => s.name === "Document Review"); // 30 min
  day = nextWorkingDay(ali);
});

test("unknown or malformed provider ids return 404, not a server error", async () => {
  assert.equal((await call("GET", "/api/providers/not-an-id")).status, 404);
  assert.equal((await call("GET", `/api/providers/${new mongoose.Types.ObjectId()}`)).status, 404);
});

test("availability: real slots, lunch break skipped", async () => {
  const r = await call("GET", `/api/providers/${ali.id}/availability?date=${day}&serviceId=${legalConsult.id}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.open, true);
  const times = r.data.slots.map((s) => s.time);
  assert.equal(times[0], "09:00");
  assert.equal(r.data.slots[0].label, "09:00 AM");
  assert.ok(!times.includes("12:30"), "a 45-min slot at 12:30 would run into the 13:00 lunch break");
  assert.ok(!times.includes("13:00") && !times.includes("13:30"), "lunch break is skipped");
  assert.ok(times.includes("14:00"));
  assert.ok(r.data.slots.every((s) => s.available));
});

test("availability: closed days are reported clearly", async () => {
  const sunday = nextClosedDay(ali);
  const r = await call("GET", `/api/providers/${ali.id}/availability?date=${sunday}&serviceId=${legalConsult.id}`);
  assert.equal(r.data.open, false);
  assert.match(r.data.message, /closed on Sundays/);
});

test("sign-up returns a token and always creates a customer", async () => {
  const r = await call("POST", "/api/auth/register", {
    body: { name: "Ayesha", email: "ayesha@test.pk", phone: "03111111111", password: "password123", role: "provider" },
  });
  assert.equal(r.status, 201);
  assert.ok(r.data.token);
  assert.equal(r.data.user.role, "customer", "role=provider in the request must be ignored");
  customerA = r.data.token;

  const b = await call("POST", "/api/auth/register", {
    body: { name: "Bilal", email: "bilal@test.pk", phone: "03222222222", password: "password123" },
  });
  customerB = b.data.token;

  const dup = await call("POST", "/api/auth/register", {
    body: { name: "X", email: "AYESHA@test.pk", phone: "0300", password: "password123" },
  });
  assert.equal(dup.status, 409);
});

test("booking requires login", async () => {
  const r = await call("POST", "/api/appointments", { body: { serviceId: legalConsult.id, date: day, time: "09:00" } });
  assert.equal(r.status, 401);
});

test("booking is saved, and the price comes from the database, not the browser", async () => {
  const r = await call("POST", "/api/appointments", {
    token: customerA,
    body: { serviceId: legalConsult.id, date: day, time: "09:00", price: 1, duration: 5, notes: "Property papers" },
  });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.equal(r.data.appointment.price, 3000);
  assert.equal(r.data.appointment.duration, 45);
  assert.equal(r.data.appointment.status, "Pending");
  assert.equal(r.data.appointment.providerName, "Ali Legal Consultants");
  assert.equal(r.data.appointment.notes, "Property papers");
  firstBookingId = r.data.appointment.id;
});

test("the same time cannot be booked twice", async () => {
  const r = await call("POST", "/api/appointments", {
    token: customerB,
    body: { serviceId: legalConsult.id, date: day, time: "09:00" },
  });
  assert.equal(r.status, 409);
  assert.match(r.data.message, /just booked/);
});

test("overlapping times are blocked too (45-min booking at 9:00 covers 9:30)", async () => {
  const r = await call("POST", "/api/appointments", {
    token: customerB,
    body: { serviceId: docReview.id, date: day, time: "09:30" },
  });
  assert.equal(r.status, 409);
});

test("the next free time can be booked", async () => {
  const r = await call("POST", "/api/appointments", {
    token: customerB,
    body: { serviceId: docReview.id, date: day, time: "10:00" },
  });
  assert.equal(r.status, 201);
});

test("availability now shows the booked times as unavailable", async () => {
  const r = await call("GET", `/api/providers/${ali.id}/availability?date=${day}&serviceId=${docReview.id}`);
  const byTime = Object.fromEntries(r.data.slots.map((s) => [s.time, s.available]));
  assert.equal(byTime["09:00"], false);
  assert.equal(byTime["09:30"], false);
  assert.equal(byTime["10:00"], false);
  assert.equal(byTime["10:30"], true);
});

test("a customer cannot double-book themselves with another provider", async () => {
  const ahmed = await Provider.findOne({ name: "Dr. Ahmed Khan" }).lean();
  const services = (await call("GET", `/api/providers/${ahmed._id}`)).data.provider.services;
  const general = services.find((s) => s.name === "General Consultation");
  const ahmedDay = nextWorkingDay(ahmed);
  // Only meaningful if both providers work that day; both work Mon-Sat.
  if (ahmedDay === day) {
    const r = await call("POST", "/api/appointments", {
      token: customerA,
      body: { serviceId: general.id, date: day, time: "09:30" },
    });
    assert.equal(r.status, 409);
    assert.match(r.data.message, /already have Legal Consultation/);
  }
});

test("invalid bookings are rejected with clear reasons", async () => {
  const past = addDays(nowInTimezone().date, -1);
  const far = addDays(nowInTimezone().date, 90);
  const cases = [
    [{ date: past, time: "10:30" }, /already passed/],
    [{ date: far, time: "10:30" }, /60 days ahead/],
    [{ date: nextClosedDay(ali), time: "10:30" }, /closed on/],
    [{ date: day, time: "10:10" }, /not available/],
    [{ date: day, time: "13:00" }, /not available/],
    [{ date: day, time: "16:30" }, /not available/], // 45 min would run past 17:00
    [{ date: "2026-02-30", time: "10:30" }, /valid date/],
  ];
  for (const [fields, reason] of cases) {
    const r = await call("POST", "/api/appointments", {
      token: customerA,
      body: { serviceId: legalConsult.id, ...fields },
    });
    assert.equal(r.status, 400, `${JSON.stringify(fields)} -> ${JSON.stringify(r.data)}`);
    assert.match(r.data.message, reason);
  }
});

test("customers only see their own appointments", async () => {
  const a = await call("GET", "/api/appointments/my", { token: customerA });
  const b = await call("GET", "/api/appointments/my", { token: customerB });
  assert.equal(a.data.count, 1);
  assert.equal(b.data.count, 1);
  assert.equal(a.data.appointments[0].serviceName, "Legal Consultation");
  assert.equal(a.data.appointments[0].timeLabel, "09:00 AM");
  assert.equal((await call("GET", `/api/appointments/${firstBookingId}`, { token: customerB })).status, 404);
});

test("role rules: customers can't open the provider list, providers can't book", async () => {
  aliToken = (await call("POST", "/api/auth/login", { body: { email: "ali@bookease.test", password: PROVIDER_PASSWORD } })).data.token;
  ahmedToken = (await call("POST", "/api/auth/login", { body: { email: "ahmed@bookease.test", password: PROVIDER_PASSWORD } })).data.token;
  assert.ok(aliToken && ahmedToken);

  assert.equal((await call("GET", "/api/appointments/provider", { token: customerA })).status, 403);
  const book = await call("POST", "/api/appointments", { token: aliToken, body: { serviceId: docReview.id, date: day, time: "15:00" } });
  assert.equal(book.status, 403);
});

test("providers see the appointments booked with them, with customer contact details", async () => {
  const r = await call("GET", "/api/appointments/provider", { token: aliToken });
  assert.equal(r.status, 200);
  assert.equal(r.data.count, 2);
  assert.equal(r.data.appointments[0].customer.name, "Ayesha");
  assert.equal(r.data.appointments[0].customer.phone, "03111111111");

  const other = await call("GET", "/api/appointments/provider", { token: ahmedToken });
  assert.equal(other.data.count, 0, "Dr. Ahmed must not see Ali Legal's bookings");
});

test("provider confirms; another provider and the customer cannot", async () => {
  assert.equal((await call("PATCH", `/api/appointments/${firstBookingId}/status`, { token: ahmedToken, body: { status: "Confirmed" } })).status, 404);
  assert.equal((await call("PATCH", `/api/appointments/${firstBookingId}/status`, { token: customerA, body: { status: "Confirmed" } })).status, 403);

  const r = await call("PATCH", `/api/appointments/${firstBookingId}/status`, { token: aliToken, body: { status: "Confirmed" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.appointment.status, "Confirmed");
  assert.equal(r.data.appointment.customer.name, "Ayesha");

  const mine = await call("GET", "/api/appointments/my", { token: customerA });
  assert.equal(mine.data.appointments[0].status, "Confirmed", "the customer sees the confirmation");
});

test("an appointment can't be marked completed before it happens", async () => {
  const r = await call("PATCH", `/api/appointments/${firstBookingId}/status`, { token: aliToken, body: { status: "Completed" } });
  assert.equal(r.status, 400);
  assert.match(r.data.message, /once its start time has passed/);
});

test("customer cancels, and the time becomes free again", async () => {
  const r = await call("PATCH", `/api/appointments/${firstBookingId}/status`, { token: customerA, body: { status: "Cancelled" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.appointment.status, "Cancelled");
  assert.equal(r.data.appointment.cancelledBy, "customer");

  const again = await call("PATCH", `/api/appointments/${firstBookingId}/status`, { token: customerA, body: { status: "Cancelled" } });
  assert.equal(again.status, 400);

  const avail = await call("GET", `/api/providers/${ali.id}/availability?date=${day}&serviceId=${legalConsult.id}`);
  assert.equal(avail.data.slots.find((s) => s.time === "09:00").available, true);

  const rebook = await call("POST", "/api/appointments", { token: customerB, body: { serviceId: docReview.id, date: day, time: "09:00" } });
  assert.equal(rebook.status, 201, "someone else can now book the freed time");
});

test("five people pressing Confirm at the same moment: exactly one gets the slot", async () => {
  const tokens = [];
  for (let i = 0; i < 5; i++) {
    tokens.push((await call("POST", "/api/auth/register", {
      body: { name: `Racer ${i}`, email: `racer${i}@test.pk`, phone: "03000000000", password: "password123" },
    })).data.token);
  }
  const results = await Promise.all(
    tokens.map((token) => call("POST", "/api/appointments", { token, body: { serviceId: legalConsult.id, date: day, time: "15:00" } }))
  );
  const statuses = results.map((r) => r.status).sort();
  assert.deepEqual(statuses, [201, 409, 409, 409, 409], JSON.stringify(results.map((r) => r.data.message)));
});

test("profile update and password change", async () => {
  const bad = await call("PUT", "/api/auth/me", { token: customerA, body: { name: "", phone: "1" } });
  assert.equal(bad.status, 400);

  const r = await call("PUT", "/api/auth/me", { token: customerA, body: { name: "Ayesha Khan", phone: "+92 311 1111111" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.user.name, "Ayesha Khan");

  const wrong = await call("PUT", "/api/auth/me/password", { token: customerA, body: { currentPassword: "nope", newPassword: "newpassword1" } });
  assert.equal(wrong.status, 400);
  const ok = await call("PUT", "/api/auth/me/password", { token: customerA, body: { currentPassword: "password123", newPassword: "newpassword1" } });
  assert.equal(ok.status, 200);

  assert.equal((await call("POST", "/api/auth/login", { body: { email: "ayesha@test.pk", password: "password123" } })).status, 401);
  assert.equal((await call("POST", "/api/auth/login", { body: { email: "ayesha@test.pk", password: "newpassword1" } })).status, 200);
});

test("broken JSON gets a clear 400", async () => {
  const res = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{oops" });
  assert.equal(res.status, 400);
});

test("requests from the site's own address are allowed; other websites are not", async () => {
  const own = new URL(base).host;
  const send = (origin) =>
    fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ email: "customer@bookease.test", password: "Customer@123" }),
    });

  // One-service setup: the page and the API share an address.
  assert.equal((await send(`https://${own}`)).status, 200);
  // Phones on the same Wi-Fi and local development still work.
  assert.equal((await send("http://192.168.1.20:5173")).status, 200);
  assert.equal((await send("http://localhost:5173")).status, 200);
  // Anyone else is refused.
  assert.equal((await send("https://evil.example.com")).status, 403);
  assert.equal((await send(`https://${own}.evil.example.com`)).status, 403);
});

// These run when the frontend has been built (npm run build), which is what
// happens on Render. Without a build they are skipped.
const DIST = new URL("../../frontend/dist/", import.meta.url);
const hasBuild = fs.existsSync(new URL("index.html", DIST));

test("serves the website: home page and every page address load the app", { skip: !hasBuild && "frontend not built" }, async () => {
  for (const page of ["/", "/services", "/providers/abc123", "/appointments", "/login"]) {
    const res = await fetch(base + page);
    assert.equal(res.status, 200, page);
    assert.match(res.headers.get("content-type"), /text\/html/, page);
    assert.match(await res.text(), /<div id="root">/, page);
    assert.equal(res.headers.get("cache-control"), "no-cache", page);
  }
});

test("serves built files with long caching, and missing files get a real 404", { skip: !hasBuild && "frontend not built" }, async () => {
  const asset = fs.readdirSync(new URL("assets/", DIST)).find((f) => f.endsWith(".js"));
  const res = await fetch(`${base}/assets/${asset}`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /javascript/);
  assert.match(res.headers.get("cache-control"), /immutable/);

  const missing = await fetch(`${base}/assets/does-not-exist.js`);
  assert.equal(missing.status, 404, "a missing file must not return the web page");

  const apiMissing = await fetch(`${base}/api/does-not-exist`);
  assert.equal(apiMissing.status, 404);
  assert.equal((await apiMissing.json()).message, "Route not found");
});
