#!/usr/bin/env node
/**
 * Sync barber services from the online booking system (vCita / localsearch).
 *
 *   npm run fetch:barber-prices          # preview (dry-run)
 *   npm run fetch:barber-prices -- --write # update src/content/barbers/*.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'barber-price-sources.json');
const barbersDir = path.join(root, 'src/content/barbers');

const write = process.argv.includes('--write');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function formatDuration(minutes) {
  const m = Number(minutes);
  if (!m) return '';
  if (m < 60) return `${m} min`;
  const hours = Math.floor(m / 60);
  const rest = m % 60;
  if (rest === 0) return hours === 1 ? '1 Stunde' : `${hours} Stunden`;
  if (hours === 1) return `1 Stunde ${rest} min`;
  return `${hours} Stunden ${rest} min`;
}

function formatPrice(amount, currency = 'CHF') {
  return `${Math.round(Number(amount))} ${currency}`;
}

async function vcitaGet(pathname, params) {
  const q = new URLSearchParams({
    business_id: config.businessId,
    locale: 'de',
    only_active_services: 'true',
    ...params,
  });
  const res = await fetch(`https://api2.vcita.com/platform/v1/${pathname}?${q}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`vCita ${pathname}: HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'OK') throw new Error(`vCita ${pathname}: ${JSON.stringify(json)}`);
  return json.data;
}

async function fetchStaffServices(staffId) {
  const { categories = [] } = await vcitaGet('categories', { staff_id: staffId });
  const services = [];

  for (const category of categories) {
    const { services: list = [] } = await vcitaGet(`categories/${category.id}/services`, {
      staff_id: staffId,
    });
    for (const svc of list) {
      if (!svc.display || !svc.business_enabled) continue;
      if (!svc.providers_staff?.includes(staffId)) continue;
      services.push({
        name: svc.name.trim(),
        duration: formatDuration(svc.duration),
        price: formatPrice(svc.price, svc.currency),
        _position: category.position ?? 0,
        _category: category.name.trim(),
      });
    }
  }

  services.sort((a, b) => a._position - b._position || a.name.localeCompare(b.name, 'de'));
  return services.map(({ name, duration, price }) => ({ name, duration, price }));
}

function mergeServices(existing, fetched) {
  const featuredName = existing.find((s) => s.featured)?.name?.trim();
  return fetched.map((svc, index) => {
    const prev = existing.find((e) => e.name.trim() === svc.name);
    const featured = featuredName
      ? svc.name === featuredName
      : index === 0;
    return {
      name: svc.name,
      duration: svc.duration,
      price: svc.price,
      ...(featured ? { featured: true } : {}),
      ...(prev?.featured && !featuredName ? {} : {}),
    };
  });
}

async function main() {
  console.log(`Booking source: vCita business ${config.businessId}`);
  console.log(write ? 'Mode: write\n' : 'Mode: dry-run (pass --write to apply)\n');

  for (const { file, staffId } of config.barbers) {
    const jsonPath = path.join(barbersDir, `${file}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.warn(`Skip ${file}: ${jsonPath} not found`);
      continue;
    }

    const current = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const fetched = await fetchStaffServices(staffId);
    const services = mergeServices(current.services || [], fetched);
    const next = { ...current, services };

    console.log(`## ${current.name} (${file}.json) — ${services.length} services`);
    for (const s of services) {
      const star = s.featured ? ' ★' : '';
      console.log(`   ${s.name} — ${s.duration} — ${s.price}${star}`);
    }

    const changed = JSON.stringify(current.services) !== JSON.stringify(services);
    if (!changed) {
      console.log('   (unchanged)\n');
      continue;
    }

    if (write) {
      fs.writeFileSync(jsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
      console.log('   → updated\n');
    } else {
      console.log('   → would update\n');
    }
  }

  if (!write) {
    console.log('Dry-run complete. Run with --write to save.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});