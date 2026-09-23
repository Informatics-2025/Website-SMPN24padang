import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
const u = await db.query.users.findFirst({ where: eq(users.email, "qa-temp@example.com") });
console.log("FOUND:", !!u, "hasPassword:", !!u?.password);
if (u?.password) console.log("BCRYPT_MATCH:", await bcrypt.compare("QaTemp12345!", u.password));
process.exit(0);
