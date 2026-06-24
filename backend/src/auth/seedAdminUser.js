import { connectDb, disconnectDb } from "../config/db.js";
import { User } from "../models/User.js";

const admins = [
  {
    name: process.env.ADMIN_NAME || "KYC Review Admin",
    email: process.env.ADMIN_EMAIL || "admin@finboard.local",
    phone: process.env.ADMIN_PHONE || "+910000000001",
    password: process.env.ADMIN_PASSWORD || "Admin@12345"
  },
  {
    name: process.env.ADMIN2_NAME || "Operations Admin",
    email: process.env.ADMIN2_EMAIL || "ops.admin@finboard.local",
    phone: process.env.ADMIN2_PHONE || "+910000000002",
    password: process.env.ADMIN2_PASSWORD || "OpsAdmin@12345"
  }
];

async function seedAdminUser() {
  await connectDb();

  for (const admin of admins) {
    const user = await User.findOne({ email: admin.email }).select("+passwordHash");

    if (user) {
      user.name = admin.name;
      user.phone = admin.phone;
      user.role = "admin";
      user.phoneVerified = true;
      await user.setPassword(admin.password);
      await user.save();
      console.log(`Updated admin user: ${admin.email}`);
    } else {
      const created = new User({
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: "admin",
        phoneVerified: true
      });
      await created.setPassword(admin.password);
      await created.save();
      console.log(`Created admin user: ${admin.email}`);
    }
  }

  console.log("Admin logins:");
  admins.forEach((admin) => {
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${admin.password}`);
  });
  await disconnectDb();
}

seedAdminUser().catch(async (error) => {
  console.error(error);
  await disconnectDb();
  process.exit(1);
});
