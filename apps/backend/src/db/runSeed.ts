import db from './client.js';
import { seedFullDatabase } from './seedFull.js';

async function main() {
  try {
    await seedFullDatabase(db);
    console.log('✅ Database successfully re-seeded with 9 Rajkanwari categories!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

main();
