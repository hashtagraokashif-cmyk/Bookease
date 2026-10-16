import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";
import SlotLock from "../models/SlotLock.js";
import {
  providers,
  demoCustomer,
  PROVIDER_PASSWORD,
  CUSTOMER_PASSWORD,
} from "./data.js";

/**
 * Adds the demo providers, their services and logins. Safe to run repeatedly:
 * anything that already exists is left alone. With { fresh: true } it first
 * deletes all appointments, providers, services and users.
 */
export const seedDatabase = async ({ fresh = false, log = console.log } = {}) => {
  if (fresh) {
    await Promise.all([
      Appointment.deleteMany({}),
      SlotLock.deleteMany({}),
      Service.deleteMany({}),
      Provider.deleteMany({}),
      User.deleteMany({}),
    ]);
    log("  cleared appointments, providers, services and users");
  }

  await Promise.all([User.init(), SlotLock.init()]);

  const providerHash = await bcrypt.hash(PROVIDER_PASSWORD, 10);
  let createdProviders = 0;
  let createdServices = 0;

  for (const { services, ...details } of providers) {
    let provider = await Provider.findOne({ email: details.email });
    if (!provider) {
      provider = await Provider.create(details);
      createdProviders++;
    }

    let user = await User.findOne({ email: details.email });
    if (!user) {
      user = await User.create({
        name: details.name,
        email: details.email,
        phone: details.phone,
        password: providerHash,
        role: "provider",
        provider: provider._id,
      });
    }
    if (!provider.user) {
      provider.user = user._id;
      await provider.save();
    }

    for (const service of services) {
      const exists = await Service.findOne({ provider: provider._id, name: service.name });
      if (!exists) {
        await Service.create({ ...service, provider: provider._id });
        createdServices++;
      }
    }
  }

  if (!(await User.findOne({ email: demoCustomer.email }))) {
    await User.create({
      ...demoCustomer,
      password: await bcrypt.hash(CUSTOMER_PASSWORD, 10),
      role: "customer",
    });
  }

  log(`  providers: ${createdProviders} added (${providers.length} total in demo data)`);
  log(`  services: ${createdServices} added`);

  return {
    providers: await Provider.countDocuments(),
    services: await Service.countDocuments(),
    users: await User.countDocuments(),
  };
};
