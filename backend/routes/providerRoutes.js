import express from "express";
import { listProviders, getProvider, getAvailability } from "../controllers/providerController.js";

const router = express.Router();

router.get("/", listProviders);
router.get("/:id", getProvider);
router.get("/:id/availability", getAvailability);

export default router;
