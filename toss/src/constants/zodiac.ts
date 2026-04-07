type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface ZodiacData {
  sign: ZodiacSign;
  name: string;
  nameEn: string;
  symbol: string;
  element: '불(火)' | '흙(土)' | '바람(風)' | '물(水)';
  ruling: string; // 수호 행성
  dateRange: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

export const ZODIAC_DATA: Record<ZodiacSign, ZodiacData> = {
  aries: {
    sign: 'aries',
    name: '양자리',
    nameEn: 'Aries',
    symbol: '♈',
    element: '불(火)',
    ruling: '화성 (Mars)',
    dateRange: '3/21 - 4/19',
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19,
  },
  taurus: {
    sign: 'taurus',
    name: '황소자리',
    nameEn: 'Taurus',
    symbol: '♉',
    element: '흙(土)',
    ruling: '금성 (Venus)',
    dateRange: '4/20 - 5/20',
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20,
  },
  gemini: {
    sign: 'gemini',
    name: '쌍둥이자리',
    nameEn: 'Gemini',
    symbol: '♊',
    element: '바람(風)',
    ruling: '수성 (Mercury)',
    dateRange: '5/21 - 6/21',
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 21,
  },
  cancer: {
    sign: 'cancer',
    name: '게자리',
    nameEn: 'Cancer',
    symbol: '♋',
    element: '물(水)',
    ruling: '달 (Moon)',
    dateRange: '6/22 - 7/22',
    startMonth: 6,
    startDay: 22,
    endMonth: 7,
    endDay: 22,
  },
  leo: {
    sign: 'leo',
    name: '사자자리',
    nameEn: 'Leo',
    symbol: '♌',
    element: '불(火)',
    ruling: '태양 (Sun)',
    dateRange: '7/23 - 8/22',
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22,
  },
  virgo: {
    sign: 'virgo',
    name: '처녀자리',
    nameEn: 'Virgo',
    symbol: '♍',
    element: '흙(土)',
    ruling: '수성 (Mercury)',
    dateRange: '8/23 - 9/22',
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22,
  },
  libra: {
    sign: 'libra',
    name: '천칭자리',
    nameEn: 'Libra',
    symbol: '♎',
    element: '바람(風)',
    ruling: '금성 (Venus)',
    dateRange: '9/23 - 10/23',
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 23,
  },
  scorpio: {
    sign: 'scorpio',
    name: '전갈자리',
    nameEn: 'Scorpio',
    symbol: '♏',
    element: '물(水)',
    ruling: '명왕성 (Pluto)',
    dateRange: '10/24 - 11/22',
    startMonth: 10,
    startDay: 24,
    endMonth: 11,
    endDay: 22,
  },
  sagittarius: {
    sign: 'sagittarius',
    name: '사수자리',
    nameEn: 'Sagittarius',
    symbol: '♐',
    element: '불(火)',
    ruling: '목성 (Jupiter)',
    dateRange: '11/23 - 12/21',
    startMonth: 11,
    startDay: 23,
    endMonth: 12,
    endDay: 21,
  },
  capricorn: {
    sign: 'capricorn',
    name: '염소자리',
    nameEn: 'Capricorn',
    symbol: '♑',
    element: '흙(土)',
    ruling: '토성 (Saturn)',
    dateRange: '12/22 - 1/19',
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19,
  },
  aquarius: {
    sign: 'aquarius',
    name: '물병자리',
    nameEn: 'Aquarius',
    symbol: '♒',
    element: '바람(風)',
    ruling: '천왕성 (Uranus)',
    dateRange: '1/20 - 2/18',
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18,
  },
  pisces: {
    sign: 'pisces',
    name: '물고기자리',
    nameEn: 'Pisces',
    symbol: '♓',
    element: '물(水)',
    ruling: '해왕성 (Neptune)',
    dateRange: '2/19 - 3/20',
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20,
  },
};

/**
 * 생년월일(YYYY-MM-DD)에서 별자리 계산
 */
export function getZodiacFromDate(birthDate: string): ZodiacSign | null {
  if (!birthDate) return null;

  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  for (const zodiac of Object.values(ZODIAC_DATA)) {
    // 연말-연초 경계(염소자리) 처리
    if (zodiac.sign === 'capricorn') {
      if ((month === 12 && day >= zodiac.startDay) || (month === 1 && day <= zodiac.endDay)) {
        return zodiac.sign;
      }
      continue;
    }

    // 일반 케이스
    if (month === zodiac.startMonth && day >= zodiac.startDay) {
      return zodiac.sign;
    }
    if (month === zodiac.endMonth && day <= zodiac.endDay) {
      return zodiac.sign;
    }
  }

  return null;
}
