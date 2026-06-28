import { connectDb, disconnectDb } from "../../../infrastructure/database/mongo.js";
import { createInitialProfile } from "@finboard/contracts";
import { User } from "../models/user.model.js";

const admins = [
  {
    name: process.env.ADMIN_NAME || "KYC Review Admin",
    email: process.env.ADMIN_EMAIL || "admin@finboard.local",
    phone: process.env.ADMIN_PHONE || "+910000000001",
    password: process.env.ADMIN_PASSWORD || "Admin@12345",
    role: "admin"
  },
  {
    name: process.env.ADMIN2_NAME || "Operations Admin",
    email: process.env.ADMIN2_EMAIL || "ops.admin@finboard.local",
    phone: process.env.ADMIN2_PHONE || "+910000000002",
    password: process.env.ADMIN2_PASSWORD || "OpsAdmin@12345",
    role: "admin"
  },
  {
    name: process.env.RTA_ADMIN_NAME || "RTA Investor Records Admin",
    email: process.env.RTA_ADMIN_EMAIL || "rta.admin@finboard.local",
    phone: process.env.RTA_ADMIN_PHONE || "+910000000003",
    password: process.env.RTA_ADMIN_PASSWORD || "RtaAdmin@12345",
    role: "rta_admin"
  },
  {
    name: process.env.AMC_ADMIN_NAME || "AMC Scheme Manager",
    email: process.env.AMC_ADMIN_EMAIL || "amc.admin@finboard.local",
    phone: process.env.AMC_ADMIN_PHONE || "+910000000004",
    password: process.env.AMC_ADMIN_PASSWORD || "AmcAdmin@12345",
    role: "amc_admin"
  }
];

const demoUsers = [
  {
    name: process.env.DEMO_USER_NAME || "Rahul Sharma",
    email: process.env.DEMO_USER_EMAIL || "user@finboard.local",
    phone: process.env.DEMO_USER_PHONE || "+919876543210",
    password: process.env.DEMO_USER_PASSWORD || "User@12345",
    role: "user"
  },
  {
    name: process.env.DEMO_USER2_NAME || "Priya Singh",
    email: process.env.DEMO_USER2_EMAIL || "priya@finboard.local",
    phone: process.env.DEMO_USER2_PHONE || "+919876543211",
    password: process.env.DEMO_USER2_PASSWORD || "User@12345",
    role: "user"
  }
];

async function upsertUser(account) {
  const user = await User.findOne({ email: account.email }).select("+passwordHash");

  if (user) {
    user.name = account.name;
    user.phone = account.phone;
    user.role = account.role;
    user.emailVerified = true;
    await user.setPassword(account.password);
    await user.save();
    console.log(`Updated ${account.role} user: ${account.email}`);
    return user;
  }

  const created = new User({
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role,
    emailVerified: true
  });
  await created.setPassword(account.password);
  await created.save();
  console.log(`Created ${account.role} user: ${account.email}`);
  return created;
}

async function seedAdminUser() {
  await connectDb();

  for (const admin of admins) {
    await upsertUser(admin);
  }

  for (const demoUser of demoUsers) {
    const user = await upsertUser(demoUser);
    await createInitialProfile({
      userId: user._id,
      fullName: demoUser.name,
      mobileNumber: demoUser.phone,
      emailAddress: demoUser.email
    }).catch(() => {});
  }

  console.log("\nAdmin logins:");
  admins.forEach((admin) => {
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${admin.password}`);
    console.log(`Role: ${admin.role}`);
  });

  console.log("\nDemo user logins (sign in at /signin):");
  demoUsers.forEach((user) => {
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Phone: ${user.phone}`);
    console.log(`Role: ${user.role}`);
  });
  await disconnectDb();
}

seedAdminUser().catch(async (error) => {
  console.error(error);
  await disconnectDb();
  process.exit(1);
});
