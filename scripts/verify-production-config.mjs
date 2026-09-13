import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => readFileSync(`${root}${file}`, 'utf8');
const checks = [
  ['backend/Dockerfile exists', existsSync(`${root}backend/Dockerfile`)],
  ['backend/.dockerignore exists', existsSync(`${root}backend/.dockerignore`)],
  ['deprecated backend/railway.toml absent', !existsSync(`${root}backend/railway.toml`)],
  ['Gunicorn is production server', read('backend/Dockerfile').includes('gunicorn config.wsgi:application')],
  ['Railway uses PORT', read('backend/Dockerfile').includes('${PORT:-8000}')],
  ['No production runserver', !read('backend/Dockerfile').includes('runserver')],
  ['No wildcard production hosts', !read('backend/config/settings/production.py').includes('ALLOWED_HOSTS = ["*"]')],
  ['Catalog API variable is server-only', !read('.env.example').includes('NEXT_PUBLIC_AUREVIA_CATALOG_API_BASE_URL')],
  ['No CORS dependency', !read('backend/requirements/production.txt').toLowerCase().includes('cors')],
  ['No Redis/Celery dependency', !/redis|celery/i.test(read('backend/requirements/production.txt'))],
  ['No tracked production env file', !existsSync(`${root}.env.production`) && !existsSync(`${root}backend/.env.production`)],
];
const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (failures.length) { console.error('Production config verification: FAIL'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Production config verification: PASS (${checks.length} checks)`);
