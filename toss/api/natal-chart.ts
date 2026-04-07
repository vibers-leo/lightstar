import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────
const pmod = (x: number, y: number) => ((x % y) + y) % y;
const toDeg = (r: number) => pmod(r * 180 / Math.PI, 360);
const toRad = (d: number) => d * Math.PI / 180;

// ─────────────────────────────────────────────────────────────
// VSOP87D 시리즈 합산 (NaN 항목 필터링)
// ─────────────────────────────────────────────────────────────
function vsopSum(tau: number, series: Record<number, number[][]>): number {
  const keys = Object.keys(series)
    .filter(k => !isNaN(Number(k))).map(Number).sort((a, b) => a - b);
  let y = keys.length - 1;
  const coeffs: number[] = [];
  while (y >= 0) {
    const row = series[keys[y]];
    let acc = 0;
    for (let i = row.length - 1; i >= 0; i--) {
      const [A, B, C] = row[i];
      if (!isFinite(A) || !isFinite(B) || !isFinite(C)) continue;
      acc += A * Math.cos(B + C * tau);
    }
    coeffs.unshift(acc);
    y--;
  }
  let result = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) result = result * tau + coeffs[i];
  return result;
}

// ─────────────────────────────────────────────────────────────
// 지구 중심 황도 경도 계산 (VSOP87D helio → geo)
// ─────────────────────────────────────────────────────────────
function getGeocentricLon(planetData: any, earthData: any, tau: number): number {
  const pLon = pmod(vsopSum(tau, planetData.L), 2 * Math.PI);
  const pLat = vsopSum(tau, planetData.B);
  const pR   = vsopSum(tau, planetData.R);
  const eLon = pmod(vsopSum(tau, earthData.L), 2 * Math.PI);
  const eLat = vsopSum(tau, earthData.B);
  const eR   = vsopSum(tau, earthData.R);
  const px = pR * Math.cos(pLat) * Math.cos(pLon);
  const py = pR * Math.cos(pLat) * Math.sin(pLon);
  const ex = eR * Math.cos(eLat) * Math.cos(eLon);
  const ey = eR * Math.cos(eLat) * Math.sin(eLon);
  return toDeg(Math.atan2(py - ey, px - ex));
}

// ─────────────────────────────────────────────────────────────
// 역행 판단 (오늘 vs 내일 경도)
// ─────────────────────────────────────────────────────────────
function isRetrograde(lon0: number, lon1: number): boolean {
  let diff = lon1 - lon0;
  if (diff > 180)  diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

// ─────────────────────────────────────────────────────────────
// 율리우스 날짜
// ─────────────────────────────────────────────────────────────
function dateToJD(date: Date): number {
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;
  let y = Y, m = M;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + D + B - 1524.5;
}

// ─────────────────────────────────────────────────────────────
// 좌표 변환 (황도 ↔ 적도, β=0 가정)
// ─────────────────────────────────────────────────────────────
function eclToEq(lambda: number, eps: number): { ra: number; dec: number } {
  const ra  = pmod(Math.atan2(Math.sin(lambda) * Math.cos(eps), Math.cos(lambda)), 2 * Math.PI);
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
  return { ra, dec };
}

function eqToEcl(ra: number, dec: number, eps: number): number {
  return pmod(
    Math.atan2(Math.sin(ra) * Math.cos(eps) + Math.tan(dec) * Math.sin(eps), Math.cos(ra)),
    2 * Math.PI
  );
}

// ─────────────────────────────────────────────────────────────
// 그리니치 항성시 (초 단위 → 도)
// 공식: IAU 1982 (astronomia sidereal 없이 직접 계산)
// ─────────────────────────────────────────────────────────────
function getGMST(jd: number): number {
  const D = jd - 2451545.0;
  const T = D / 36525;
  // IAU 1982 공식
  const gmst_sec = 24110.54841 + 8640184.812866 * T + 0.093104 * T * T - 0.0000062 * T * T * T;
  const gmst_deg = pmod(gmst_sec / 240, 360); // 240초 = 1도
  // UT 당일의 시간 추가 (자정 기준 JD → 당일 UTC 시간)
  const ut_frac = (jd + 0.5) % 1; // 0~1 사이 소수부분
  return pmod(gmst_deg + ut_frac * 360.98564724, 360);
}

// ─────────────────────────────────────────────────────────────
// MC & ASC
// ─────────────────────────────────────────────────────────────
function getMC(RAMC: number, eps: number): number {
  // atan2로 사분면 자동 처리
  return pmod(toDeg(Math.atan2(Math.sin(RAMC), Math.cos(RAMC) * Math.cos(eps))), 360);
}

function getASC(RAMC: number, eps: number, lat: number): number {
  return pmod(toDeg(Math.atan2(
    Math.cos(RAMC),
    -(Math.sin(eps) * Math.tan(lat) + Math.cos(eps) * Math.sin(RAMC))
  )), 360);
}

// ─────────────────────────────────────────────────────────────
// Placidus 중간 하우스 (반복 수렴)
// fraction: H11=1/3, H12=2/3, H2=2/3(야간), H3=1/3(야간)
// ─────────────────────────────────────────────────────────────
function placidusIntermediate(RAMC: number, eps: number, lat: number, fraction: number): number {
  let lambda = pmod(RAMC + fraction * 2 * Math.PI / 3, 2 * Math.PI);
  for (let i = 0; i < 50; i++) {
    const { ra, dec } = eclToEq(lambda, eps);
    const tld = Math.tan(lat) * Math.tan(dec);
    if (Math.abs(tld) >= 1) break; // 극지방 → 수렴 불가
    const sda = Math.acos(-tld); // 반주호(semi-diurnal arc)
    const newRA = pmod(RAMC + sda * fraction, 2 * Math.PI);
    const next = eqToEcl(newRA, dec, eps);
    if (Math.abs(next - lambda) < 1e-9) break;
    lambda = next;
  }
  return pmod(toDeg(lambda), 360);
}

// ─────────────────────────────────────────────────────────────
// Placidus 12하우스 커스프 배열 (0=H1, 1=H2, ... 11=H12)
// ─────────────────────────────────────────────────────────────
function getPlacidusHouses(jd: number, lat: number, lng: number): { cusps: number[]; asc: number; mc: number } {
  const GMST = getGMST(jd);
  const LST  = pmod(GMST + lng, 360);
  const RAMC = toRad(LST);
  const T    = (jd - 2451545.0) / 36525;
  const eps  = toRad(23.439291111 - 0.013004167 * T);
  const latR = toRad(lat);

  const MC  = getMC(RAMC, eps);
  const ASC = getASC(RAMC, eps, latR);
  const IC  = pmod(MC + 180, 360);
  const DSC = pmod(ASC + 180, 360);

  // 중간 하우스 (주간 = RAMC 기준, 야간 = RAMC+π 기준)
  const H11 = placidusIntermediate(RAMC, eps, latR, 1 / 3);
  const H12 = placidusIntermediate(RAMC, eps, latR, 2 / 3);
  const H2  = pmod(placidusIntermediate(RAMC + Math.PI, eps, latR, 2 / 3) + 180, 360);
  const H3  = pmod(placidusIntermediate(RAMC + Math.PI, eps, latR, 1 / 3) + 180, 360);

  // H5, H6, H8, H9는 대응 하우스 + 180°
  const H5 = pmod(H11 + 180, 360);
  const H6 = pmod(H12 + 180, 360);
  const H8 = pmod(H2 + 180, 360);
  const H9 = pmod(H3 + 180, 360);

  return {
    asc: ASC,
    mc: MC,
    cusps: [ASC, H2, H3, IC, H5, H6, DSC, H8, H9, MC, H11, H12],
  };
}

// ─────────────────────────────────────────────────────────────
// 메인 핸들러
// ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { birthDate, birthTime, lat, lng } = req.body;
  if (!birthDate) return res.status(400).json({ error: 'birthDate required' });

  try {
    // ── 날짜/시간 파싱 ────────────────────────────────────────
    const [year, month, day] = (birthDate as string).split('-').map(Number);
    let hour = 12, minute = 0;
    if (birthTime && birthTime !== '모름') {
      // "HH:MM" 형식 (분 단위 직접 입력)
      const hhmmMatch = (birthTime as string).match(/^(\d{1,2}):(\d{2})$/);
      // "오전 9~11시" 형식 (구 형식 호환)
      const amMatch = (birthTime as string).match(/오전\s*(\d+)~(\d+)/);
      const pmMatch = (birthTime as string).match(/오후\s*(\d+)~(\d+)/);
      if (hhmmMatch) {
        hour = parseInt(hhmmMatch[1]);
        minute = parseInt(hhmmMatch[2]);
      } else if (amMatch) {
        hour = (parseInt(amMatch[1]) + parseInt(amMatch[2])) / 2;
      } else if (pmMatch) {
        hour = (parseInt(pmMatch[1]) + parseInt(pmMatch[2])) / 2 + 12;
        if (hour >= 24) hour -= 12;
      }
    }

    // UTC 변환 (한국 UTC+9, 출생지 보정은 lng로)
    const tzOffset = lat != null && lng != null ? Number(lng) / 15 : 9;
    const utcHour = hour + minute / 60 - tzOffset;
    const birthDateTime = new Date(Date.UTC(year, month - 1, day, Math.floor(utcHour), Math.round((utcHour % 1) * 60)));
    const jd  = dateToJD(birthDateTime);
    const T   = (jd - 2451545.0) / 36525;
    const tau = T / 10;
    // 내일 tau (역행 계산용)
    const tau1 = ((jd + 1) - 2451545.0) / (36525 * 10);
    const T1   = ((jd + 1) - 2451545.0) / 36525;

    // ── VSOP87 + ELP2000 데이터 로드 ─────────────────────────
    // @ts-ignore
    const [
      { default: earthD   },
      { default: mercuryD },
      { default: venusD   },
      { default: marsD    },
      { default: jupiterD },
      { default: saturnD  },
      { default: uranusD  },
      { default: neptuneD },
      { Moon },
      { default: elpFull  },
    ] = await Promise.all([
      // @ts-ignore
      import('astronomia/data/vsop87Dearth'),
      // @ts-ignore
      import('astronomia/data/vsop87Dmercury'),
      // @ts-ignore
      import('astronomia/data/vsop87Dvenus'),
      // @ts-ignore
      import('astronomia/data/vsop87Dmars'),
      // @ts-ignore
      import('astronomia/data/vsop87Djupiter'),
      // @ts-ignore
      import('astronomia/data/vsop87Dsaturn'),
      // @ts-ignore
      import('astronomia/data/vsop87Duranus'),
      // @ts-ignore
      import('astronomia/data/vsop87Dneptune'),
      // @ts-ignore
      import('astronomia/elp'),
      // @ts-ignore
      import('astronomia/data/elpMppDeFull'),
    ]);

    // ── 태양 (VSOP87D Earth + 180°) ──────────────────────────
    const eLon  = pmod(vsopSum(tau,  earthD.L), 2 * Math.PI);
    const eLon1 = pmod(vsopSum(tau1, earthD.L), 2 * Math.PI);
    const sunLon  = toDeg(eLon  + Math.PI);
    const sunLon1 = toDeg(eLon1 + Math.PI);

    // ── 달 (ELP2000 MppDeFull) ────────────────────────────────
    const moonModel = new Moon(elpFull);
    const moonLon  = toDeg(moonModel.position(jd)._ra);
    const moonLon1 = toDeg(moonModel.position(jd + 1)._ra);

    // ── 외행성 (오늘 + 내일) ─────────────────────────────────
    const bodies = { Mercury: mercuryD, Venus: venusD, Mars: marsD,
                     Jupiter: jupiterD, Saturn: saturnD, Uranus: uranusD, Neptune: neptuneD };
    const positions: Record<string, [number, boolean]> = {};

    for (const [name, data] of Object.entries(bodies)) {
      const lon0 = getGeocentricLon(data, earthD, tau);
      const lon1 = getGeocentricLon(data, earthD, tau1);
      positions[name] = [lon0, isRetrograde(lon0, lon1)];
    }

    // ── 하우스 ───────────────────────────────────────────────
    let ascendant: number | null = null;
    let mc:        number | null = null;
    let cusps: number[] = Array.from({ length: 12 }, (_, i) => i * 30);

    if (lat != null && lng != null) {
      const houses = getPlacidusHouses(jd, Number(lat), Number(lng));
      ascendant = houses.asc;
      mc        = houses.mc;
      cusps     = houses.cusps;
    }

    return res.status(200).json({
      planets: {
        Sun:     [sunLon,  isRetrograde(sunLon, sunLon1)],  // 태양은 항상 false
        Moon:    [moonLon, isRetrograde(moonLon, moonLon1)], // 달도 역행 없지만 계산
        ...positions,
      },
      cusps,
      ascendant,
      mc,
      meta: { jd, T, birthDateTime: birthDateTime.toISOString(), houseSystem: 'Placidus' },
    });

  } catch (err: any) {
    console.error('natal-chart error:', err);
    return res.status(500).json({ error: err.message || '차트 계산 오류' });
  }
}
