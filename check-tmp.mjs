import { Pool } from 'pg'
process.loadEnvFile(new URL('.env.local', 'file://' + process.cwd() + '/'))
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const { rows } = await pool.query(
  `select group_slug, date, plan is not null as has_plan, arcade_json, booklet_digital_web
   from lesson_content where group_slug in ('fce1','pet1','friday-b2') and plan is not null
   order by date limit 6`
)
for (const r of rows) console.log(r.group_slug, r.date, 'arcade=', (r.arcade_json||'').slice(0,80), 'booklet=', r.booklet_digital_web)
await pool.end()
