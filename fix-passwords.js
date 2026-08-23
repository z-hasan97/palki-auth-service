const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function fixPasswords() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'palki',
    password: 'palki_dev',
    database: 'palki'
  });
  
  await client.connect();
  
  const hash = await bcrypt.hash('Admin1234', 10);
  console.log('Generated hash:', hash);
  
  const result1 = await client.query('UPDATE users SET "passwordHash" = $1 WHERE email = $2', [hash, 'admin@palki.com']);
  const result2 = await client.query('UPDATE users SET "passwordHash" = $1 WHERE email = $2', [hash, 'user1@palki.com']);
  
  console.log('Updated admin:', result1.rowCount);
  console.log('Updated user1:', result2.rowCount);
  
  await client.end();
}

fixPasswords().catch(console.error);