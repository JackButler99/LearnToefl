import {readdirSync} from 'node:fs';
import {spawn} from 'node:child_process';
// Unit fixtures must never pick up a shell/CI production database connection.
const files=readdirSync('tests').filter(name=>name.endsWith('.test.ts')).sort().map(name=>'tests/'+name);
const child=spawn(process.execPath,['--conditions=react-server','--import=tsx','--test','--test-concurrency=1',...files,...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,PORTFOLIO_DEMO:'',DATABASE_URL:'',MIGRATION_DATABASE_URL:'',TEST_DATABASE_URL:'',VERCEL:'',PG_SCHEMA:'public',RESEND_API_KEY:'',GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',AUTH_EMAIL_FROM:'',CRON_SECRET:''}});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
