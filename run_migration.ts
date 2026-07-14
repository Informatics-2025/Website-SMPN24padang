import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log('Connected.');
        const sql = fs.readFileSync('drizzle/manual/0031_sispendik_safe_enhancements.sql', 'utf-8');
        await client.query(sql);
        console.log('Success.');
    } catch (e) { console.error(e); } finally { await client.end(); }
}
run();
