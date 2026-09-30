import bcrypt from 'bcryptjs';
import { getDb } from './client.js';

export async function fixDatabaseCredentials() {
  const db = getDb();
  console.log('Fixing owner credentials in DB...');

  const passwordHash = bcrypt.hashSync('123456', 12);

  // Update usr_owner_01 or any owner role to email 'owner@rajkanwari.in' and password '123456'
  await db.prepare(
    "UPDATE users SET email = 'owner@rajkanwari.in', password_hash = ? WHERE id = 'usr_owner_01' OR role = 'owner'"
  ).run(passwordHash);

  // Also update password hash for any test accounts
  await db.prepare(
    "UPDATE users SET password_hash = ? WHERE email IN ('owner@rajkanwari.in', 'owner@shikkis.com', 'owner@shikkis.in', 'priya@example.com')"
  ).run(passwordHash);

  const owner = await db.prepare("SELECT id, email, role, password_hash FROM users WHERE role = 'owner'").get();
  console.log('Owner Account in DB:', owner);

  if (owner) {
    const isMatch = await bcrypt.compare('123456', owner.password_hash);
    console.log(`✅ Password match test for '123456': ${isMatch}`);
  }
}

fixDatabaseCredentials().catch((err) => {
  console.error('Error running fix script:', err);
  process.exit(1);
});
