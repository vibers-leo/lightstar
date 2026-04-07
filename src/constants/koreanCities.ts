export interface KoreanCity {
  name: string;      // 도시명
  region: string;    // 지역 (구분용)
  label: string;     // 표시용 (예: "광주 (전라남도)")
  lat: number;
  lng: number;
}

// 주요 한국 도시 - 위도/경도 포함
export const KOREAN_CITIES: KoreanCity[] = [
  // 특별시/광역시
  { name: '서울', region: '서울특별시', label: '서울', lat: 37.5665, lng: 126.9780 },
  { name: '부산', region: '부산광역시', label: '부산', lat: 35.1796, lng: 129.0756 },
  { name: '대구', region: '대구광역시', label: '대구', lat: 35.8714, lng: 128.6014 },
  { name: '인천', region: '인천광역시', label: '인천', lat: 37.4563, lng: 126.7052 },
  { name: '광주', region: '전라남도', label: '광주 (전라남도)', lat: 35.1595, lng: 126.8526 },
  { name: '대전', region: '대전광역시', label: '대전', lat: 36.3504, lng: 127.3845 },
  { name: '울산', region: '울산광역시', label: '울산', lat: 35.5384, lng: 129.3114 },
  { name: '세종', region: '세종특별자치시', label: '세종', lat: 36.4800, lng: 127.2890 },

  // 경기도
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
  { name: '시흥', region: '경기도', label: '시흥 (경기도)', lat: 37.3800, lng: 126.8030 },
  { name: '파주', region: '경기도', label: '파주 (경기도)', lat: 37.7601, lng: 126.7800 },
  { name: '김포', region: '경기도', label: '김포 (경기도)', lat: 37.6155, lng: 126.7157 },
  { name: '광명', region: '경기도', label: '광명 (경기도)', lat: 37.4784, lng: 126.8644 },
  { name: '광주', region: '경기도', label: '광주 (경기도)', lat: 37.4296, lng: 127.2553 },
  { name: '군포', region: '경기도', label: '군포 (경기도)', lat: 37.3614, lng: 126.9351 },
  { name: '하남', region: '경기도', label: '하남 (경기도)', lat: 37.5392, lng: 127.2148 },
  { name: '오산', region: '경기도', label: '오산 (경기도)', lat: 37.1499, lng: 127.0777 },
  { name: '이천', region: '경기도', label: '이천 (경기도)', lat: 37.2720, lng: 127.4345 },
  { name: '양주', region: '경기도', label: '양주 (경기도)', lat: 37.7854, lng: 127.0457 },
  { name: '구리', region: '경기도', label: '구리 (경기도)', lat: 37.5943, lng: 127.1296 },
  { name: '포천', region: '경기도', label: '포천 (경기도)', lat: 37.8948, lng: 127.2003 },

  // 강원도
  { name: '춘천', region: '강원도', label: '춘천 (강원도)', lat: 37.8813, lng: 127.7298 },
  { name: '원주', region: '강원도', label: '원주 (강원도)', lat: 37.3422, lng: 127.9202 },
  { name: '강릉', region: '강원도', label: '강릉 (강원도)', lat: 37.7519, lng: 128.8760 },
  { name: '동해', region: '강원도', label: '동해 (강원도)', lat: 37.5247, lng: 129.1144 },
  { name: '속초', region: '강원도', label: '속초 (강원도)', lat: 38.2070, lng: 128.5918 },

  // 충청북도
  { name: '청주', region: '충청북도', label: '청주 (충청북도)', lat: 36.6424, lng: 127.4890 },
  { name: '충주', region: '충청북도', label: '충주 (충청북도)', lat: 36.9910, lng: 127.9259 },
  { name: '제천', region: '충청북도', label: '제천 (충청북도)', lat: 37.1326, lng: 128.1908 },

  // 충청남도
  { name: '천안', region: '충청남도', label: '천안 (충청남도)', lat: 36.8151, lng: 127.1139 },
  { name: '아산', region: '충청남도', label: '아산 (충청남도)', lat: 36.7897, lng: 127.0021 },
  { name: '공주', region: '충청남도', label: '공주 (충청남도)', lat: 36.4468, lng: 127.1189 },
  { name: '보령', region: '충청남도', label: '보령 (충청남도)', lat: 36.3332, lng: 126.6128 },
  { name: '서산', region: '충청남도', label: '서산 (충청남도)', lat: 36.7848, lng: 126.4503 },
  { name: '논산', region: '충청남도', label: '논산 (충청남도)', lat: 36.1870, lng: 127.0987 },

  // 전라북도
  { name: '전주', region: '전라북도', label: '전주 (전라북도)', lat: 35.8242, lng: 127.1480 },
  { name: '익산', region: '전라북도', label: '익산 (전라북도)', lat: 35.9483, lng: 126.9576 },
  { name: '군산', region: '전라북도', label: '군산 (전라북도)', lat: 35.9676, lng: 126.7368 },
  { name: '정읍', region: '전라북도', label: '정읍 (전라북도)', lat: 35.5700, lng: 126.8557 },

  // 전라남도
  { name: '여수', region: '전라남도', label: '여수 (전라남도)', lat: 34.7604, lng: 127.6622 },
  { name: '순천', region: '전라남도', label: '순천 (전라남도)', lat: 34.9506, lng: 127.4875 },
  { name: '목포', region: '전라남도', label: '목포 (전라남도)', lat: 34.8118, lng: 126.3922 },
  { name: '나주', region: '전라남도', label: '나주 (전라남도)', lat: 35.0160, lng: 126.7109 },

  // 경상북도
  { name: '포항', region: '경상북도', label: '포항 (경상북도)', lat: 36.0190, lng: 129.3435 },
  { name: '경주', region: '경상북도', label: '경주 (경상북도)', lat: 35.8562, lng: 129.2247 },
  { name: '김천', region: '경상북도', label: '김천 (경상북도)', lat: 36.1398, lng: 128.1135 },
  { name: '안동', region: '경상북도', label: '안동 (경상북도)', lat: 36.5684, lng: 128.7294 },
  { name: '구미', region: '경상북도', label: '구미 (경상북도)', lat: 36.1196, lng: 128.3441 },
  { name: '영주', region: '경상북도', label: '영주 (경상북도)', lat: 36.8057, lng: 128.6236 },

  // 경상남도
  { name: '창원', region: '경상남도', label: '창원 (경상남도)', lat: 35.2281, lng: 128.6811 },
  { name: '진주', region: '경상남도', label: '진주 (경상남도)', lat: 35.1800, lng: 128.1076 },
  { name: '통영', region: '경상남도', label: '통영 (경상남도)', lat: 34.8545, lng: 128.4336 },
  { name: '사천', region: '경상남도', label: '사천 (경상남도)', lat: 35.0036, lng: 128.0649 },
  { name: '김해', region: '경상남도', label: '김해 (경상남도)', lat: 35.2281, lng: 128.8891 },
  { name: '밀양', region: '경상남도', label: '밀양 (경상남도)', lat: 35.4958, lng: 128.7462 },
  { name: '거제', region: '경상남도', label: '거제 (경상남도)', lat: 34.8800, lng: 128.6211 },
  { name: '양산', region: '경상남도', label: '양산 (경상남도)', lat: 35.3350, lng: 129.0379 },

  // 제주도
  { name: '제주', region: '제주특별자치도', label: '제주 (제주도)', lat: 33.4996, lng: 126.5312 },
  { name: '서귀포', region: '제주특별자치도', label: '서귀포 (제주도)', lat: 33.2541, lng: 126.5600 },
];

export function searchCities(query: string): KoreanCity[] {
  if (!query.trim()) return [];
  const q = query.trim();
  return KOREAN_CITIES.filter(city =>
    city.name.startsWith(q) || city.label.includes(q) || city.region.includes(q)
  ).slice(0, 8); // 최대 8개
}
