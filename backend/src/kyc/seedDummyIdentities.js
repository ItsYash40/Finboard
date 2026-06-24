import { connectDb, disconnectDb } from "../config/db.js";
import { DummyIdentity } from "../models/DummyIdentity.js";

const identities = [
  ["Rahul Sharma", "ABCDE1234F", "123456789012"],
  ["Priya Singh", "PQRSX6789K", "234567890123"],
  ["Aarav Mehta", "LMNOP4321Q", "345678901234"],
  ["Neha Kapoor", "NEHAK9021P", "456789012345"],
  ["Vikram Rao", "VIKRA1234M", "567890123456"],
  ["Ananya Das", "ANANY8765D", "678901234567"],
  ["Kabir Khan", "KABIR2468K", "789012345678"],
  ["Meera Iyer", "MEERA1357I", "890123456789"],
  ["Rohan Verma", "ROHAN9753V", "901234567890"],
  ["Pritam Prayash Behera", "BNZPM2501F", "444433336666"]
];

async function main() {
  await connectDb();
  for (const [name, panNumber, aadhaarNumber] of identities) {
    await DummyIdentity.findOneAndUpdate(
      { panNumber },
      { name, panNumber, aadhaarNumber, address: "Demo India Address" },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${identities.length} dummy KYC identities`);
  await disconnectDb();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectDb();
  process.exit(1);
});

