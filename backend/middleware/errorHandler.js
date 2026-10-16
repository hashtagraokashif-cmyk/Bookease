export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

// Express 5 forwards errors thrown in async route handlers to here automatically.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Request body is not valid JSON" });
  }

  // A badly formed id like /api/providers/abc
  if (err.name === "CastError") {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map((e) => e.message).join(", "),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "That record already exists" });
  }

  if (err.message?.startsWith("Origin is not allowed")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
};
