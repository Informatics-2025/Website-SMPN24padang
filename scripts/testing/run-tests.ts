import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { colors } from './helpers/test-utils';
import { TEST_CONFIG } from './helpers/env';

interface SuiteOption {
  name: string;
  category: 'unit' | 'integration' | 'e2e' | 'security';
  dir: string;
}

const SUITES: SuiteOption[] = [
  { name: 'Unit Tests', category: 'unit', dir: path.join(__dirname, 'unit') },
  { name: 'Integration Tests', category: 'integration', dir: path.join(__dirname, 'integration') },
  { name: 'End-to-End Tests', category: 'e2e', dir: path.join(__dirname, 'e2e') },
  { name: 'OWASP Web Security Tests', category: 'security', dir: path.join(__dirname, 'security') },
];

function getTestFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.test.ts'))
    .map((file) => path.join(dir, file));
}

function printHelp() {
  console.log(`
${colors.bright}Automation Testing CLI (TypeScript)${colors.reset}
${colors.dim}Website SMP 24 Padang Test Suite${colors.reset}

${colors.yellow}Penggunaan:${colors.reset}
  npx tsx scripts/testing/run-tests.ts [opsi]

${colors.yellow}Opsi Kategori:${colors.reset}
  --all               Jalankan seluruh test (Unit, Integration, E2E, Security) [Default]
  --unit              Hanya jalankan Unit Tests
  --integration       Hanya jalankan Integration Tests
  --e2e               Hanya jalankan End-to-End Tests
  --security          Hanya jalankan OWASP Web Security Tests (A01-A07)
  --auth              Hanya jalankan pengujian otentikasi & kontrol akses
  -h, --help          Tampilkan panduan ini

${colors.yellow}Contoh Eksekusi:${colors.reset}
  npm run test
  npm run test:security
  npm run test:auth
  npm run test:unit
  npm run test:integration
  npm run test:e2e
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  const isOnlyUnit = args.includes('--unit');
  const isOnlyIntegration = args.includes('--integration');
  const isOnlyE2E = args.includes('--e2e');
  const isOnlySecurity = args.includes('--security');
  const isOnlyAuth = args.includes('--auth');

  let allFilesToRun: string[] = [];
  let suiteNames: string[] = [];

  if (isOnlyAuth) {
    // Mode khusus Auth: jalankan auth unit test dan access control security test
    const authUnitFile = path.join(__dirname, 'unit', 'auth.test.ts');
    const authSecFile = path.join(__dirname, 'security', 'owasp-access-control.test.ts');
    if (fs.existsSync(authUnitFile)) allFilesToRun.push(authUnitFile);
    if (fs.existsSync(authSecFile)) allFilesToRun.push(authSecFile);
    suiteNames = ['Authentication & Authorization Tests'];
  } else {
    const selectedSuites = SUITES.filter((suite) => {
      if (isOnlyUnit) return suite.category === 'unit';
      if (isOnlyIntegration) return suite.category === 'integration';
      if (isOnlyE2E) return suite.category === 'e2e';
      if (isOnlySecurity) return suite.category === 'security';
      return true; // default jalankan semua
    });

    selectedSuites.forEach((s) => {
      allFilesToRun.push(...getTestFiles(s.dir));
    });
    suiteNames = selectedSuites.map((s) => s.name);
  }

  if (allFilesToRun.length === 0) {
    console.log(`${colors.yellow}Tidak ada file test ditemukan untuk dieksekusi.${colors.reset}`);
    process.exit(0);
  }

  const baseUrl = TEST_CONFIG.baseUrl;
  const hasDb = TEST_CONFIG.hasDatabaseConfigured;

  console.log(`\n${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║      🚀 AUTOMATION & SECURITY TESTING SUITE - SMP 24 PADANG  ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(` ${colors.dim}Target Server :${colors.reset} ${colors.green}${baseUrl}${colors.reset}`);
  console.log(` ${colors.dim}Database Env  :${colors.reset} ${hasDb ? `${colors.green}Configured (Neon PostgreSQL)${colors.reset}` : `${colors.yellow}Not Configured${colors.reset}`}`);
  console.log(` ${colors.dim}Target Suites :${colors.reset} ${colors.yellow}${suiteNames.join(', ')}${colors.reset}`);
  console.log(` ${colors.dim}Total Files   :${colors.reset} ${allFilesToRun.length} berkas (.test.ts)`);
  console.log(`${colors.cyan}──────────────────────────────────────────────────────────────${colors.reset}\n`);

  const startTime = Date.now();

  // Jalankan test menggunakan built-in test runner via tsx
  const runnerProcess = spawn(
    process.execPath,
    ['--import=tsx', '--test', '--test-reporter=spec', ...allFilesToRun],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        FORCE_COLOR: '1',
      },
    },
  );

  runnerProcess.on('close', (code) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n${colors.cyan}──────────────────────────────────────────────────────────────${colors.reset}`);
    if (code === 0) {
      console.log(`${colors.green}${colors.bright}✔ SELURUH SUITE PENGUJIAN SELESAI DENGAN SUKSES!${colors.reset}`);
      console.log(`  ${colors.dim}Total Waktu  :${colors.reset} ${colors.bright}${elapsed} detik${colors.reset}`);
      console.log(`  ${colors.dim}Status Akhir :${colors.reset} ${colors.green}ALL PASSED (0 Errors)${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bright}✖ TERDAPAT PENGUJIAN YANG GAGAL ATAU MENGALAMI ERROR.${colors.reset}`);
      console.log(`  ${colors.dim}Total Waktu  :${colors.reset} ${elapsed} detik`);
      console.log(`  ${colors.dim}Status Akhir :${colors.reset} ${colors.red}FAILED (Exit Code: ${code})${colors.reset}`);
    }
    console.log(`${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}\n`);
    process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});
