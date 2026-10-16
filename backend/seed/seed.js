import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { seedDatabase } from "./seedDatabase.js";
import {
  providers,
  demoCustomer,
  PROVIDER_PASSWORD,
  CUSTOMER_PASSWORD,
} from "./data.js";

dotenv.config({ quiet: true });

const fresh = process.argv.includes("--fresh");

try {
  console.log("\nSeeding BookEase...\n");
  await connectDB();
  const totals = await seedDatabase({ fresh });

  console.log(`\nDone. ${totals.providers} providers, ${totals.services} services, ${totals.users} users.\n`);
  console.log("Demo logins:");
  console.log(`  Customer  ${demoCustomer.email.padEnd(28)} ${CUSTOMER_PASSWORD}`);
  for (const p of providers) {
    console.log(`  Provider  ${p.email.padEnd(28)} ${PROVIDER_PASSWORD}   (${p.name})`);
  }
  console.log("");
} catch (error) {
  console.error("\nSeeding failed:", error.message);
  console.error("Is MongoDB running? Check MONGO_URI in backend/.env\n");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
