/**
 * Runs the BookEase backend (backend/server.js) as a Netlify function.
 *
 * netlify.toml sends every /api/... request here. The Express app is reused
 * unchanged; this file only connects to MongoDB (once per warm instance) and
 * translates between Netlify's request format and Express.
 */
import serverless from "serverless-http";
import app from "../../backend/server.js";
import connectDB from "../../backend/config/db.js";
import User from "../../backend/models/User.js";
import SlotLock from "../../backend/models/SlotLock.js";

// Connect once and reuse the connection while this instance stays warm.
// If connecting fails, the next request tries again.
let ready = null;
const ensureReady = () => {
  if (!ready) {
    ready = connectDB()
      .then(() => Promise.all([User.init(), SlotLock.init()]))
      .catch((error) => {
        ready = null;
        throw error;
      });
  }
  return ready;
};

// serverless-http hands Express the raw body (as a Buffer) and marks the
// request as already read, so Express 5's JSON reader skips it and the login,
// sign-up and booking forms would arrive empty. The API only accepts JSON, so
// the body is read here instead and given to Express ready to use.
const readJsonBody = (event) => {
  const type = String(event.headers?.["content-type"] || "");
  if (!event.body || !type.includes("application/json")) return { body: undefined };
  const text = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  try {
    return { body: text.trim() ? JSON.parse(text) : {} };
  } catch {
    return { invalid: true };
  }
};

const expressHandler = serverless(app, {
  request(req, event) {
    req.body = event.parsedJsonBody;
  },
});

export const handler = async (event, context) => {
  // Don't wait for the open database connection before replying.
  context.callbackWaitsForEmptyEventLoop = false;

  // Depending on how a request reaches the function, its path can start with
  // the function's own address. Express expects /api/...
  if (event.path && event.path.startsWith("/.netlify/functions/api")) {
    event.path = "/api" + event.path.slice("/.netlify/functions/api".length);
  }

  const { body, invalid } = readJsonBody(event);
  if (invalid) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Request body is not valid JSON" }),
    };
  }
  event.parsedJsonBody = body;

  try {
    await ensureReady();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        message: "The database is unavailable right now. Please try again in a moment.",
      }),
    };
  }

  return expressHandler(event, context);
};
