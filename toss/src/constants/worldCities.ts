export interface City {
  name: string;
  nameKo?: string;   // 한국어 이름
  region: string;    // 지역/국가
  label: string;     // 검색 결과 표시용
  lat: number;
  lng: number;
}

// ─── 한국 ─────────────────────────────────────────────────────────────────
const KR: City[] = [
  { name: '서울', region: '서울특별시', label: '서울', lat: 37.5665, lng: 126.9780 },
  { name: '부산', region: '부산광역시', label: '부산', lat: 35.1796, lng: 129.0756 },
  { name: '대구', region: '대구광역시', label: '대구', lat: 35.8714, lng: 128.6014 },
  { name: '인천', region: '인천광역시', label: '인천', lat: 37.4563, lng: 126.7052 },
  { name: '광주', region: '전라남도', label: '광주 (전라남도)', lat: 35.1595, lng: 126.8526 },
  { name: '대전', region: '대전광역시', label: '대전', lat: 36.3504, lng: 127.3845 },
  { name: '울산', region: '울산광역시', label: '울산', lat: 35.5384, lng: 129.3114 },
  { name: '세종', region: '세종특별자치시', label: '세종', lat: 36.4800, lng: 127.2890 },
  { name: '수원', region: '경기도', label: '수원 (경기도)', lat: 37.2636, lng: 127.0286 },
  { name: '성남', region: '경기도', label: '성남 (경기도)', lat: 37.4449, lng: 127.1388 },
  { name: '고양', region: '경기도', label: '고양 (경기도)', lat: 37.6584, lng: 126.8320 },
  { name: '용인', region: '경기도', label: '용인 (경기도)', lat: 37.2410, lng: 127.1775 },
  { name: '부천', region: '경기도', label: '부천 (경기도)', lat: 37.5034, lng: 126.7660 },
  { name: '안산', region: '경기도', label: '안산 (경기도)', lat: 37.3219, lng: 126.8309 },
  { name: '안양', region: '경기도', label: '안양 (경기도)', lat: 37.3943, lng: 126.9568 },
  { name: '남양주', region: '경기도', label: '남양주 (경기도)', lat: 37.6360, lng: 127.2165 },
  { name: '화성', region: '경기도', label: '화성 (경기도)', lat: 37.1996, lng: 126.8312 },
  { name: '평택', region: '경기도', label: '평택 (경기도)', lat: 36.9921, lng: 127.1127 },
  { name: '의정부', region: '경기도', label: '의정부 (경기도)', lat: 37.7381, lng: 127.0337 },
  { name: '광명', region: '경기도', label: '광명 (경기도)', lat: 37.4784, lng: 126.8644 },
  { name: '광주', region: '경기도', label: '광주 (경기도)', lat: 37.4296, lng: 127.2553 },
  { name: '파주', region: '경기도', label: '파주 (경기도)', lat: 37.7601, lng: 126.7800 },
  { name: '김포', region: '경기도', label: '김포 (경기도)', lat: 37.6155, lng: 126.7157 },
  { name: '하남', region: '경기도', label: '하남 (경기도)', lat: 37.5392, lng: 127.2148 },
  { name: '춘천', region: '강원도', label: '춘천 (강원도)', lat: 37.8813, lng: 127.7298 },
  { name: '원주', region: '강원도', label: '원주 (강원도)', lat: 37.3422, lng: 127.9202 },
  { name: '강릉', region: '강원도', label: '강릉 (강원도)', lat: 37.7519, lng: 128.8760 },
  { name: '청주', region: '충청북도', label: '청주 (충청북도)', lat: 36.6424, lng: 127.4890 },
  { name: '충주', region: '충청북도', label: '충주 (충청북도)', lat: 36.9910, lng: 127.9259 },
  { name: '천안', region: '충청남도', label: '천안 (충청남도)', lat: 36.8151, lng: 127.1139 },
  { name: '아산', region: '충청남도', label: '아산 (충청남도)', lat: 36.7897, lng: 127.0021 },
  { name: '전주', region: '전라북도', label: '전주 (전라북도)', lat: 35.8242, lng: 127.1480 },
  { name: '군산', region: '전라북도', label: '군산 (전라북도)', lat: 35.9676, lng: 126.7368 },
  { name: '여수', region: '전라남도', label: '여수 (전라남도)', lat: 34.7604, lng: 127.6622 },
  { name: '순천', region: '전라남도', label: '순천 (전라남도)', lat: 34.9506, lng: 127.4875 },
  { name: '목포', region: '전라남도', label: '목포 (전라남도)', lat: 34.8118, lng: 126.3922 },
  { name: '포항', region: '경상북도', label: '포항 (경상북도)', lat: 36.0190, lng: 129.3435 },
  { name: '경주', region: '경상북도', label: '경주 (경상북도)', lat: 35.8562, lng: 129.2247 },
  { name: '안동', region: '경상북도', label: '안동 (경상북도)', lat: 36.5684, lng: 128.7294 },
  { name: '구미', region: '경상북도', label: '구미 (경상북도)', lat: 36.1196, lng: 128.3441 },
  { name: '창원', region: '경상남도', label: '창원 (경상남도)', lat: 35.2281, lng: 128.6811 },
  { name: '진주', region: '경상남도', label: '진주 (경상남도)', lat: 35.1800, lng: 128.1076 },
  { name: '김해', region: '경상남도', label: '김해 (경상남도)', lat: 35.2281, lng: 128.8891 },
  { name: '제주', region: '제주특별자치도', label: '제주 (제주도)', lat: 33.4996, lng: 126.5312 },
  { name: '서귀포', region: '제주특별자치도', label: '서귀포 (제주도)', lat: 33.2541, lng: 126.5600 },
];

// ─── 아시아 ───────────────────────────────────────────────────────────────
const ASIA: City[] = [
  // 일본
  { name: '도쿄', nameKo: '도쿄', region: '일본', label: '도쿄 (일본)', lat: 35.6762, lng: 139.6503 },
  { name: '오사카', nameKo: '오사카', region: '일본', label: '오사카 (일본)', lat: 34.6937, lng: 135.5023 },
  { name: '교토', nameKo: '교토', region: '일본', label: '교토 (일본)', lat: 35.0116, lng: 135.7681 },
  { name: '후쿠오카', nameKo: '후쿠오카', region: '일본', label: '후쿠오카 (일본)', lat: 33.5904, lng: 130.4017 },
  { name: '삿포로', nameKo: '삿포로', region: '일본', label: '삿포로 (일본)', lat: 43.0618, lng: 141.3545 },
  { name: 'Tokyo', region: 'Japan', label: 'Tokyo (Japan)', lat: 35.6762, lng: 139.6503 },
  { name: 'Osaka', region: 'Japan', label: 'Osaka (Japan)', lat: 34.6937, lng: 135.5023 },
  // 중국
  { name: '베이징', nameKo: '베이징', region: '중국', label: '베이징 (중국)', lat: 39.9042, lng: 116.4074 },
  { name: '상하이', nameKo: '상하이', region: '중국', label: '상하이 (중국)', lat: 31.2304, lng: 121.4737 },
  { name: '광저우', nameKo: '광저우', region: '중국', label: '광저우 (중국)', lat: 23.1291, lng: 113.2644 },
  { name: 'Beijing', region: 'China', label: 'Beijing (China)', lat: 39.9042, lng: 116.4074 },
  { name: 'Shanghai', region: 'China', label: 'Shanghai (China)', lat: 31.2304, lng: 121.4737 },
  { name: 'Guangzhou', region: 'China', label: 'Guangzhou (China)', lat: 23.1291, lng: 113.2644 },
  { name: 'Shenzhen', region: 'China', label: 'Shenzhen (China)', lat: 22.5431, lng: 114.0579 },
  { name: 'Chengdu', region: 'China', label: 'Chengdu (China)', lat: 30.5728, lng: 104.0668 },
  // 대만
  { name: '타이베이', nameKo: '타이베이', region: '대만', label: '타이베이 (대만)', lat: 25.0330, lng: 121.5654 },
  { name: 'Taipei', region: 'Taiwan', label: 'Taipei (Taiwan)', lat: 25.0330, lng: 121.5654 },
  // 홍콩
  { name: '홍콩', nameKo: '홍콩', region: '홍콩', label: '홍콩', lat: 22.3193, lng: 114.1694 },
  { name: 'Hong Kong', region: 'Hong Kong', label: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  // 싱가포르
  { name: '싱가포르', nameKo: '싱가포르', region: '싱가포르', label: '싱가포르', lat: 1.3521, lng: 103.8198 },
  { name: 'Singapore', region: 'Singapore', label: 'Singapore', lat: 1.3521, lng: 103.8198 },
  // 태국
  { name: '방콕', nameKo: '방콕', region: '태국', label: '방콕 (태국)', lat: 13.7563, lng: 100.5018 },
  { name: 'Bangkok', region: 'Thailand', label: 'Bangkok (Thailand)', lat: 13.7563, lng: 100.5018 },
  // 베트남
  { name: '하노이', nameKo: '하노이', region: '베트남', label: '하노이 (베트남)', lat: 21.0285, lng: 105.8542 },
  { name: '호치민', nameKo: '호치민', region: '베트남', label: '호치민 (베트남)', lat: 10.8231, lng: 106.6297 },
  { name: 'Hanoi', region: 'Vietnam', label: 'Hanoi (Vietnam)', lat: 21.0285, lng: 105.8542 },
  { name: 'Ho Chi Minh', region: 'Vietnam', label: 'Ho Chi Minh City (Vietnam)', lat: 10.8231, lng: 106.6297 },
  // 인도네시아
  { name: '자카르타', nameKo: '자카르타', region: '인도네시아', label: '자카르타 (인도네시아)', lat: -6.2088, lng: 106.8456 },
  { name: 'Jakarta', region: 'Indonesia', label: 'Jakarta (Indonesia)', lat: -6.2088, lng: 106.8456 },
  { name: 'Bali', region: 'Indonesia', label: 'Bali (Indonesia)', lat: -8.4095, lng: 115.1889 },
  // 필리핀
  { name: '마닐라', nameKo: '마닐라', region: '필리핀', label: '마닐라 (필리핀)', lat: 14.5995, lng: 120.9842 },
  { name: 'Manila', region: 'Philippines', label: 'Manila (Philippines)', lat: 14.5995, lng: 120.9842 },
  // 인도
  { name: '뭄바이', nameKo: '뭄바이', region: '인도', label: '뭄바이 (인도)', lat: 19.0760, lng: 72.8777 },
  { name: '뉴델리', nameKo: '뉴델리', region: '인도', label: '뉴델리 (인도)', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', region: 'India', label: 'Mumbai (India)', lat: 19.0760, lng: 72.8777 },
  { name: 'New Delhi', region: 'India', label: 'New Delhi (India)', lat: 28.6139, lng: 77.2090 },
  { name: 'Bangalore', region: 'India', label: 'Bangalore (India)', lat: 12.9716, lng: 77.5946 },
  // 터키
  { name: '이스탄불', nameKo: '이스탄불', region: '터키', label: '이스탄불 (터키)', lat: 41.0082, lng: 28.9784 },
  { name: 'Istanbul', region: 'Turkey', label: 'Istanbul (Turkey)', lat: 41.0082, lng: 28.9784 },
  // 이스라엘
  { name: '텔아비브', nameKo: '텔아비브', region: '이스라엘', label: '텔아비브 (이스라엘)', lat: 32.0853, lng: 34.7818 },
  { name: 'Tel Aviv', region: 'Israel', label: 'Tel Aviv (Israel)', lat: 32.0853, lng: 34.7818 },
  // UAE
  { name: '두바이', nameKo: '두바이', region: 'UAE', label: '두바이 (UAE)', lat: 25.2048, lng: 55.2708 },
  { name: 'Dubai', region: 'UAE', label: 'Dubai (UAE)', lat: 25.2048, lng: 55.2708 },
];

// ─── 북미 ─────────────────────────────────────────────────────────────────
const NORTH_AMERICA: City[] = [
  { name: '뉴욕', nameKo: '뉴욕', region: '미국', label: '뉴욕 (미국)', lat: 40.7128, lng: -74.0060 },
  { name: '로스앤젤레스', nameKo: '로스앤젤레스', region: '미국', label: '로스앤젤레스 (미국)', lat: 34.0522, lng: -118.2437 },
  { name: '샌프란시스코', nameKo: '샌프란시스코', region: '미국', label: '샌프란시스코 (미국)', lat: 37.7749, lng: -122.4194 },
  { name: '시카고', nameKo: '시카고', region: '미국', label: '시카고 (미국)', lat: 41.8781, lng: -87.6298 },
  { name: '워싱턴', nameKo: '워싱턴', region: '미국', label: '워싱턴 DC (미국)', lat: 38.9072, lng: -77.0369 },
  { name: 'New York', region: 'USA', label: 'New York (USA)', lat: 40.7128, lng: -74.0060 },
  { name: 'Los Angeles', region: 'USA', label: 'Los Angeles (USA)', lat: 34.0522, lng: -118.2437 },
  { name: 'San Francisco', region: 'USA', label: 'San Francisco (USA)', lat: 37.7749, lng: -122.4194 },
  { name: 'Chicago', region: 'USA', label: 'Chicago (USA)', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston', region: 'USA', label: 'Houston (USA)', lat: 29.7604, lng: -95.3698 },
  { name: 'Seattle', region: 'USA', label: 'Seattle (USA)', lat: 47.6062, lng: -122.3321 },
  { name: 'Miami', region: 'USA', label: 'Miami (USA)', lat: 25.7617, lng: -80.1918 },
  { name: 'Boston', region: 'USA', label: 'Boston (USA)', lat: 42.3601, lng: -71.0589 },
  { name: 'Las Vegas', region: 'USA', label: 'Las Vegas (USA)', lat: 36.1699, lng: -115.1398 },
  { name: '토론토', nameKo: '토론토', region: '캐나다', label: '토론토 (캐나다)', lat: 43.6532, lng: -79.3832 },
  { name: '밴쿠버', nameKo: '밴쿠버', region: '캐나다', label: '밴쿠버 (캐나다)', lat: 49.2827, lng: -123.1207 },
  { name: 'Toronto', region: 'Canada', label: 'Toronto (Canada)', lat: 43.6532, lng: -79.3832 },
  { name: 'Vancouver', region: 'Canada', label: 'Vancouver (Canada)', lat: 49.2827, lng: -123.1207 },
  { name: 'Montreal', region: 'Canada', label: 'Montreal (Canada)', lat: 45.5017, lng: -73.5673 },
  { name: '멕시코시티', nameKo: '멕시코시티', region: '멕시코', label: '멕시코시티 (멕시코)', lat: 19.4326, lng: -99.1332 },
  { name: 'Mexico City', region: 'Mexico', label: 'Mexico City (Mexico)', lat: 19.4326, lng: -99.1332 },
];

// ─── 유럽 ─────────────────────────────────────────────────────────────────
const EUROPE: City[] = [
  { name: '런던', nameKo: '런던', region: '영국', label: '런던 (영국)', lat: 51.5074, lng: -0.1278 },
  { name: '파리', nameKo: '파리', region: '프랑스', label: '파리 (프랑스)', lat: 48.8566, lng: 2.3522 },
  { name: '베를린', nameKo: '베를린', region: '독일', label: '베를린 (독일)', lat: 52.5200, lng: 13.4050 },
  { name: '로마', nameKo: '로마', region: '이탈리아', label: '로마 (이탈리아)', lat: 41.9028, lng: 12.4964 },
  { name: '마드리드', nameKo: '마드리드', region: '스페인', label: '마드리드 (스페인)', lat: 40.4168, lng: -3.7038 },
  { name: '바르셀로나', nameKo: '바르셀로나', region: '스페인', label: '바르셀로나 (스페인)', lat: 41.3851, lng: 2.1734 },
  { name: '암스테르담', nameKo: '암스테르담', region: '네덜란드', label: '암스테르담 (네덜란드)', lat: 52.3676, lng: 4.9041 },
  { name: '빈', nameKo: '빈', region: '오스트리아', label: '빈 (오스트리아)', lat: 48.2082, lng: 16.3738 },
  { name: '취리히', nameKo: '취리히', region: '스위스', label: '취리히 (스위스)', lat: 47.3769, lng: 8.5417 },
  { name: '프라하', nameKo: '프라하', region: '체코', label: '프라하 (체코)', lat: 50.0755, lng: 14.4378 },
  { name: '바르샤바', nameKo: '바르샤바', region: '폴란드', label: '바르샤바 (폴란드)', lat: 52.2297, lng: 21.0122 },
  { name: '모스크바', nameKo: '모스크바', region: '러시아', label: '모스크바 (러시아)', lat: 55.7558, lng: 37.6173 },
  { name: 'London', region: 'UK', label: 'London (UK)', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', region: 'France', label: 'Paris (France)', lat: 48.8566, lng: 2.3522 },
  { name: 'Berlin', region: 'Germany', label: 'Berlin (Germany)', lat: 52.5200, lng: 13.4050 },
  { name: 'Rome', region: 'Italy', label: 'Rome (Italy)', lat: 41.9028, lng: 12.4964 },
  { name: 'Madrid', region: 'Spain', label: 'Madrid (Spain)', lat: 40.4168, lng: -3.7038 },
  { name: 'Barcelona', region: 'Spain', label: 'Barcelona (Spain)', lat: 41.3851, lng: 2.1734 },
  { name: 'Amsterdam', region: 'Netherlands', label: 'Amsterdam (Netherlands)', lat: 52.3676, lng: 4.9041 },
  { name: 'Vienna', region: 'Austria', label: 'Vienna (Austria)', lat: 48.2082, lng: 16.3738 },
  { name: 'Zurich', region: 'Switzerland', label: 'Zurich (Switzerland)', lat: 47.3769, lng: 8.5417 },
  { name: 'Stockholm', region: 'Sweden', label: 'Stockholm (Sweden)', lat: 59.3293, lng: 18.0686 },
  { name: 'Oslo', region: 'Norway', label: 'Oslo (Norway)', lat: 59.9139, lng: 10.7522 },
  { name: 'Copenhagen', region: 'Denmark', label: 'Copenhagen (Denmark)', lat: 55.6761, lng: 12.5683 },
  { name: 'Helsinki', region: 'Finland', label: 'Helsinki (Finland)', lat: 60.1699, lng: 24.9384 },
  { name: 'Athens', region: 'Greece', label: 'Athens (Greece)', lat: 37.9838, lng: 23.7275 },
  { name: 'Lisbon', region: 'Portugal', label: 'Lisbon (Portugal)', lat: 38.7223, lng: -9.1393 },
  { name: 'Brussels', region: 'Belgium', label: 'Brussels (Belgium)', lat: 50.8503, lng: 4.3517 },
  { name: 'Budapest', region: 'Hungary', label: 'Budapest (Hungary)', lat: 47.4979, lng: 19.0402 },
  { name: 'Moscow', region: 'Russia', label: 'Moscow (Russia)', lat: 55.7558, lng: 37.6173 },
];

// ─── 오세아니아 / 남미 / 아프리카 ────────────────────────────────────────
const OTHER: City[] = [
  { name: '시드니', nameKo: '시드니', region: '호주', label: '시드니 (호주)', lat: -33.8688, lng: 151.2093 },
  { name: '멜버른', nameKo: '멜버른', region: '호주', label: '멜버른 (호주)', lat: -37.8136, lng: 144.9631 },
  { name: 'Sydney', region: 'Australia', label: 'Sydney (Australia)', lat: -33.8688, lng: 151.2093 },
  { name: 'Melbourne', region: 'Australia', label: 'Melbourne (Australia)', lat: -37.8136, lng: 144.9631 },
  { name: 'Auckland', region: 'New Zealand', label: 'Auckland (New Zealand)', lat: -36.8509, lng: 174.7645 },
  { name: '상파울루', nameKo: '상파울루', region: '브라질', label: '상파울루 (브라질)', lat: -23.5505, lng: -46.6333 },
  { name: 'São Paulo', region: 'Brazil', label: 'São Paulo (Brazil)', lat: -23.5505, lng: -46.6333 },
  { name: 'Buenos Aires', region: 'Argentina', label: 'Buenos Aires (Argentina)', lat: -34.6037, lng: -58.3816 },
  { name: 'Cairo', region: 'Egypt', label: 'Cairo (Egypt)', lat: 30.0444, lng: 31.2357 },
  { name: '카이로', nameKo: '카이로', region: '이집트', label: '카이로 (이집트)', lat: 30.0444, lng: 31.2357 },
  { name: 'Cape Town', region: 'South Africa', label: 'Cape Town (South Africa)', lat: -33.9249, lng: 18.4241 },
  { name: 'Nairobi', region: 'Kenya', label: 'Nairobi (Kenya)', lat: -1.2921, lng: 36.8219 },
];

export const ALL_CITIES: City[] = [...KR, ...ASIA, ...NORTH_AMERICA, ...EUROPE, ...OTHER];

export function searchCities(query: string): City[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();

  return ALL_CITIES.filter(city => {
    const name = city.name.toLowerCase();
    const nameKo = (city.nameKo || '').toLowerCase();
    const region = city.region.toLowerCase();
    const label = city.label.toLowerCase();
    return name.startsWith(q) || nameKo.startsWith(q) || label.includes(q) || region.includes(q);
  }).slice(0, 8);
}
