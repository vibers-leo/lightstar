# 바이브 철학관 (Lightstar) 디자인 가이드

## 테마 개요

**Cosmic / 우주 신비 테마** — 깊은 보라색 우주 배경 위에 빛나는 별빛, 오로라, 성운 효과를 활용한 몰입형 디자인.

---

## 색상 시스템

### 배경 (Cosmic)
| 토큰 | 값 | 용도 |
|------|------|------|
| `cosmic-950` | `#0a0118` | 메인 배경 (가장 어두운) |
| `cosmic-900` | `#13011f` | 보조 배경 |
| `cosmic-800` | `#1d0533` | 카드/패널 배경 |
| `cosmic-700` | `#2b0a4a` | 호버 배경 |
| `cosmic-600` | `#3d1061` | 액티브 배경 |

### 성운 (Nebula — 보라/핑크 계열)
| 토큰 | 값 | 용도 |
|------|------|------|
| `nebula-500` | `#8b5cf6` | 주요 강조 색상 |
| `nebula-400` | `#a78bfa` | 보조 강조 |
| `nebula-300` | `#c4b5fd` | 텍스트 포인트 |
| `nebula-200` | `#ddd6fe` | 약한 강조 |
| `nebula-100` | `#f3f0ff` | 배지/태그 배경 |

### 별빛 (Starlight — 흰색/파랑 계열)
| 토큰 | 값 | 용도 |
|------|------|------|
| `starlight-500` | `#60a5fa` | 링크, 인터랙티브 요소 |
| `starlight-400` | `#93c5fd` | 보조 링크 |
| `starlight-300` | `#dbeafe` | 밝은 텍스트 |
| `starlight-200` | `#f0f9ff` | 기본 텍스트 (body) |
| `starlight-100` | `#ffffff` | 강조 텍스트 |

### 오로라 (Aurora — 틸/시안 계열)
| 토큰 | 값 | 용도 |
|------|------|------|
| `aurora-500` | `#14b8a6` | 성공 상태, 양의 지표 |
| `aurora-400` | `#2dd4bf` | 보조 성공 |
| `aurora-300` | `#5eead4` | 밝은 성공 |

### 골드 (Gold — 도사 테마)
| 토큰 | 값 | 용도 |
|------|------|------|
| `gold-600` | `#ca8a04` | 진한 골드 |
| `gold-500` | `#eab308` | 경고, 도사 포인트 |
| `gold-400` | `#facc15` | 밝은 골드 |
| `gold-300` | `#fde047` | 하이라이트 |

### 시맨틱 색상
| 이름 | 값 | 용도 |
|------|------|------|
| `success` | `aurora-500` (#14b8a6) | 성공 |
| `error` | `#ef4444` | 오류 |
| `warning` | `gold-500` (#eab308) | 경고 |

---

## 타이포그래피

### 폰트 패밀리
| 용도 | 폰트 | CSS 변수 |
|------|------|----------|
| 본문 | Pretendard, Inter | `--font-sans` |
| 제목 | Noto Serif KR | `--font-serif` |
| AI 응답 | Gowun Batang | `--font-book` |

### 제목 크기
| 클래스 | 모바일 | 데스크톱 (md+) | 용도 |
|--------|--------|---------------|------|
| `.text-heading-1` | 48px / bold | 72px / bold | 메인 히어로 |
| `.text-heading-2` | 30px / bold | 36px / bold | 섹션 제목 |
| `.text-heading-3` | 24px / semibold | 30px / semibold | 서브 섹션 |

### 본문 크기
| 클래스 | 크기 | line-height | 용도 |
|--------|------|-------------|------|
| `.text-body` | 16px | 1.75 | 일반 본문 |
| `.text-mystical` | 16px (md: 18px) | 2.0 | AI 도사 응답 |

---

## 글래스모피즘 (Glassmorphism)

### `.glass-panel`
```css
background: rgba(29, 5, 51, 0.4);
backdrop-filter: blur(20px);
border: 1px solid rgba(139, 92, 246, 0.2);
box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
```

### `.glass-input`
```css
background: rgba(139, 92, 246, 0.05);
border: 1px solid rgba(167, 139, 250, 0.3);
/* focus 시 */
background: rgba(139, 92, 246, 0.1);
border-color: #60a5fa;
box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
```

---

## 특수 효과

### 글로우 (Glow)
| 클래스 | 색상 | 용도 |
|--------|------|------|
| `.glow-nebula` | 보라 (#8b5cf6) | 제목, 주요 텍스트 |
| `.glow-starlight` | 파랑 (#60a5fa) | 링크, 버튼 |
| `.glow-aurora` | 틸 (#14b8a6) | 성공 메시지 |

### 그라데이션
| 클래스 | 설명 |
|--------|------|
| `.nebula-gradient` | 보라 → 연보라 → 파랑 (135deg) |
| `.aurora-gradient` | 틸 → 밝은 틸 (90deg) |
| `.soul-type-gradient` | 보라/틸/골드 애니메이션 그라데이션 |

### 애니메이션
| 클래스 | 설명 | 속도 |
|--------|------|------|
| `.animate-pulse-slow` | 느린 맥박 | 4초 |
| `.animate-float` | 떠오르는 효과 | 6초 |
| `.star-twinkle` | 별 반짝임 | 3초 |
| `.animate-fade-in` | 페이드인 | 0.5초 |
| `.astro-rotate` | 천체 회전 | 120초 |
| `.astro-border-spin` | 코닉 그라데이션 보더 회전 | 6초 |

---

## 컴포넌트 패턴

### 특성 칩 (`.trait-chip`)
```css
padding: 6px 14px;
border-radius: 9999px;
font-size: 0.875rem;
background: rgba(139, 92, 246, 0.1);
color: #c4b5fd;
border: 1px solid rgba(139, 92, 246, 0.2);
```

### 배경 그라데이션 (body)
```css
background: linear-gradient(135deg, #0a0118 0%, #1d0533 50%, #13011f 100%);
background-attachment: fixed;
```

---

## 반응형 브레이크포인트

| 이름 | 너비 | 주요 변화 |
|------|------|----------|
| 모바일 | < 768px | 단일 컬럼, MobileDrawer 사용 |
| 데스크톱 | >= 768px (md:) | 사이드바 레이아웃 |

---

## 체크리스트

새 컴포넌트/페이지 작성 시 반드시 확인:

- [ ] 배경: cosmic 계열 색상 또는 glass-panel 사용
- [ ] 텍스트: starlight-200 (기본) / nebula-300 (포인트)
- [ ] 인풋: glass-input 클래스 적용
- [ ] AI 응답: font-book (Gowun Batang) + text-mystical 사용
- [ ] 제목: font-serif (Noto Serif KR) 사용
- [ ] 인터랙션: 글로우 효과 적절히 활용
- [ ] word-break: keep-all 유지 (한글 줄바꿈)
