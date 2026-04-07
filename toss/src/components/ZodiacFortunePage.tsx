import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Heart, Coins, Briefcase } from 'lucide-react';
import { IAP } from '@apps-in-toss/web-framework';

// 프리미엄 결제 SKU (앱인토스 콘솔에 등록된 상품 ID)
const PREMIUM_SKU = 'premium_fortune_3300';
import { getZodiacFromDate, ZODIAC_DATA } from '../constants/zodiac';
import CitySearchInput from './inputs/CitySearchInput';
import type { City } from '../constants/worldCities';

const NatalChartView = lazy(() => import('./chart/NatalChartView'));

interface ZodiacFortunePageProps {}

type Step = 'input' | 'zodiac-reveal' | 'loading' | 'result' | 'premium-prompt';

interface FortuneResult {
  oneLiner: string;
  full: string;
  keywords: string[];
  luckyNumber: string;
  luckyColor: string;
}

interface PremiumFortune {
  love?: string;
  money?: string;
  career?: string;
}

// 별자리별 그라데이션 (원소 아님, sign 기준)
const SIGN_GRADIENT: Record<string, string> = {
  aries: 'from-red-400 to-orange-500',
  taurus: 'from-emerald-400 to-teal-500',
  gemini: 'from-yellow-400 to-amber-500',
  cancer: 'from-slate-400 to-blue-500',
  leo: 'from-orange-400 to-yellow-500',
  virgo: 'from-lime-500 to-emerald-500',
  libra: 'from-pink-400 to-rose-500',
  scorpio: 'from-purple-500 to-indigo-600',
  sagittarius: 'from-violet-400 to-purple-500',
  capricorn: 'from-gray-500 to-slate-600',
  aquarius: 'from-cyan-400 to-blue-500',
  pisces: 'from-blue-400 to-indigo-500',
};

async function fetchFortune(params: {
  sign: string;
  signName: string;
  element: string;
  ruling: string;
  birthDate: string;
  birthTime: string;
  birthCity?: string;
  lat?: number;
  lng?: number;
  type: 'today' | 'love' | 'money' | 'career';
}): Promise<string> {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isLocal ? 'http://localhost:3001' : 'https://lightstar-seven.vercel.app';

  const res = await fetch(`${baseUrl}/api/zodiac-fortune`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '운세를 불러오지 못했습니다.');
  }

  const data = await res.json();
  return data.result as string;
}

function parseFortuneResult(raw: string): FortuneResult {
  const oneLinerMatch = raw.match(/\[오늘의 한 줄 운세\]\s*([\s\S]*?)(?=\[|$)/);
  const fullMatch = raw.match(/\[오늘의 전체 운세\]\s*([\s\S]*?)(?=\[|$)/);
  const keywordsMatch = raw.match(/\[오늘의 행운 키워드\]\s*([\s\S]*?)(?=\[|$)/);
  const numberMatch = raw.match(/\[행운의 숫자\]\s*([\s\S]*?)(?=\[|$)/);
  const colorMatch = raw.match(/\[행운의 색\]\s*([\s\S]*?)(?=\[|$)/);

  return {
    oneLiner: oneLinerMatch?.[1]?.trim() || '',
    full: fullMatch?.[1]?.trim() || raw,
    keywords: (keywordsMatch?.[1]?.trim() || '').split(',').map(k => k.trim()).filter(Boolean),
    luckyNumber: numberMatch?.[1]?.trim() || '',
    luckyColor: colorMatch?.[1]?.trim() || '',
  };
}

export default function ZodiacFortunePage({}: ZodiacFortunePageProps) {
  const [step, setStep] = useState<Step>('input');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('모름');
  const [birthCity, setBirthCity] = useState<City | null>(null);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [premiumFortune, setPremiumFortune] = useState<PremiumFortune>({});
  const [loadingPremium, setLoadingPremium] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [adCountdown, setAdCountdown] = useState(0);
  const [hasPaid, setHasPaid] = useState(() => localStorage.getItem('lightstar_premium_v1') === '1');
  const [showChart, setShowChart] = useState(false);
  const iapCleanupRef = useRef<(() => void) | null>(null);

  // 미완료 주문 복구 (앱 재진입 시)
  useEffect(() => {
    IAP.getPendingOrders?.().then(result => {
      if (result?.orders?.some(o => o.sku === PREMIUM_SKU)) {
        setHasPaid(true);
        localStorage.setItem('lightstar_premium_v1', '1');
      }
    }).catch(() => {});
    return () => { iapCleanupRef.current?.(); };
  }, []);

  const zodiacSign = birthDate ? getZodiacFromDate(birthDate) : null;
  const zodiacData = zodiacSign ? ZODIAC_DATA[zodiacSign] : null;
  const gradient = zodiacSign ? (SIGN_GRADIENT[zodiacSign] || 'from-violet-500 to-purple-600') : 'from-violet-500 to-purple-600';

  const handleSubmit = () => {
    if (!birthDate) { setError('생년월일을 입력해주세요.'); return; }
    if (!zodiacSign || !zodiacData) { setError('올바른 생년월일을 입력해주세요.'); return; }
    setError('');
    setStep('zodiac-reveal');
  };

  const handleWatchAd = () => {
    setAdCountdown(3);
    const timer = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          loadFortune();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const loadFortune = async () => {
    if (!zodiacSign || !zodiacData) return;
    setStep('loading');
    try {
      const raw = await fetchFortune({
        sign: zodiacSign,
        signName: zodiacData.name,
        element: zodiacData.element,
        ruling: zodiacData.ruling,
        birthDate,
        birthTime: birthTime === '모름' ? '' : birthTime,
        birthCity: birthCity?.label,
        lat: birthCity?.lat,
        lng: birthCity?.lng,
        type: 'today',
      });
      setFortune(parseFortuneResult(raw));
      setStep('result');
    } catch (e: any) {
      setError(e.message || '오류가 발생했습니다.');
      setStep('zodiac-reveal');
    }
  };

  const handlePremiumFortune = async (type: 'love' | 'money' | 'career') => {
    if (!hasPaid) { setStep('premium-prompt'); return; }
    if (!zodiacSign || !zodiacData || premiumFortune[type]) return;
    setLoadingPremium(type);
    try {
      const text = await fetchFortune({
        sign: zodiacSign,
        signName: zodiacData.name,
        element: zodiacData.element,
        ruling: zodiacData.ruling,
        birthDate,
        birthTime: birthTime === '모름' ? '' : birthTime,
        birthCity: birthCity?.label,
        lat: birthCity?.lat,
        lng: birthCity?.lng,
        type,
      });
      setPremiumFortune(prev => ({ ...prev, [type]: text }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingPremium(null);
    }
  };

  const handlePayment = () => {
    // IAP cleanup 이전 리스너 제거
    iapCleanupRef.current?.();

    const cleanup = IAP.createOneTimePurchaseOrder({
      sku: PREMIUM_SKU,
      onSuccess: async (result) => {
        // 결제 완료 — 상품 지급 완료 처리
        await IAP.completeProductGrant?.({ params: { orderId: result.orderId } }).catch(() => {});
        setHasPaid(true);
        localStorage.setItem('lightstar_premium_v1', '1');
        setStep('result');
      },
      onError: (err) => {
        if (err.code !== 'USER_CANCEL') {
          console.error('[IAP]', err.code);
        }
      },
    });
    iapCleanupRef.current = cleanup;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-4 border-b border-gray-100">
        <h1 className="ml-2 text-lg font-bold text-gray-900">오늘의 별자리 운세</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* STEP 1: 입력 */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 max-w-md mx-auto"
            >
              <div className="text-center mb-8 pt-4">
                <div className="text-5xl mb-3">🔮</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">오늘 별이 뭐라고 하는지<br />알아볼게요</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">생년월일</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 text-base bg-gray-50"
                  />
                  {birthDate && zodiacData && (
                    <p className="mt-2 text-sm text-violet-600 font-semibold">
                      {zodiacData.symbol} {zodiacData.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">태어난 도시 <span className="text-gray-400">(선택)</span></label>
                  <CitySearchInput
                    value={birthCity}
                    onChange={setBirthCity}
                    placeholder="도시 이름을 검색해보세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    태어난 시간 <span className="text-gray-400">(모르면 비워도 돼요)</span>
                  </label>
                  <input
                    type="time"
                    value={birthTime === '모름' ? '' : birthTime}
                    onChange={e => setBirthTime(e.target.value || '모름')}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50 text-base"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  onClick={handleSubmit}
                  className="w-full py-4 bg-gray-900 text-white font-bold text-base rounded-2xl active:scale-95 transition-transform"
                >
                  확인
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: 별자리 공개 + 광고 CTA */}
          {step === 'zodiac-reveal' && zodiacData && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 max-w-md mx-auto"
            >
              <div className={`rounded-3xl p-10 text-center mb-6 bg-gradient-to-br ${gradient}`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="text-8xl mb-4"
                >
                  {zodiacData.symbol}
                </motion.div>
                <h2 className="text-3xl font-bold text-white">{zodiacData.name}</h2>
                <p className="text-white/70 text-sm mt-1">{zodiacData.dateRange}</p>
              </div>

              <p className="text-center text-gray-500 text-sm mb-6">
                짧은 광고를 보면 오늘의 운세를 무료로 볼 수 있어요
              </p>

              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

              {adCountdown > 0 ? (
                <div className="w-full py-5 bg-gray-50 rounded-2xl text-center">
                  <p className="text-gray-400 text-sm mb-3">광고 준비 중... {adCountdown}초</p>
                  <div className="mx-6 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 transition-all duration-1000"
                      style={{ width: `${((3 - adCountdown) / 3) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleWatchAd}
                  className="w-full py-4 bg-gray-900 text-white font-bold text-base rounded-2xl active:scale-95 transition-transform"
                >
                  광고 보고 오늘의 운세 보기
                </button>
              )}

              <button onClick={() => setStep('input')} className="w-full mt-3 py-3 text-gray-400 text-sm">
                ← 다시 입력
              </button>
            </motion.div>
          )}

          {/* STEP 3: 로딩 */}
          {step === 'loading' && zodiacData && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] p-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="text-7xl mb-6"
              >
                {zodiacData.symbol}
              </motion.div>
              <p className="text-gray-500 text-sm">오늘의 기운을 읽어오는 중...</p>
            </motion.div>
          )}

          {/* STEP 4: 운세 결과 */}
          {step === 'result' && fortune && zodiacData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 max-w-md mx-auto pb-10"
            >
              {/* 별자리 헤더 */}
              <div className={`rounded-3xl p-6 bg-gradient-to-br ${gradient} text-white text-center mb-5`}>
                <div className="text-5xl mb-2">{zodiacData.symbol}</div>
                <h2 className="text-xl font-bold">{zodiacData.name}</h2>
                {fortune.oneLiner && (
                  <p className="mt-3 text-white/90 text-sm leading-relaxed">"{fortune.oneLiner}"</p>
                )}
              </div>

              {/* 오늘의 운세 */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={15} className="text-gray-400" />
                  <h3 className="font-bold text-gray-900 text-sm">오늘의 운세</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{fortune.full}</p>
              </div>

              {/* 행운 정보 */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {fortune.keywords.length > 0 && (
                  <div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 font-medium mb-2">오늘의 키워드</p>
                    <div className="flex flex-wrap gap-2">
                      {fortune.keywords.map(k => (
                        <span key={k} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
                {fortune.luckyNumber && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400 font-medium mb-1">행운의 숫자</p>
                    <p className="text-3xl font-bold text-gray-900">{fortune.luckyNumber}</p>
                  </div>
                )}
                {fortune.luckyColor && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400 font-medium mb-1">행운의 색</p>
                    <p className="text-base font-bold text-gray-900">{fortune.luckyColor}</p>
                  </div>
                )}
              </div>

              {/* 구분선 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-100" />
                <p className="text-xs text-gray-400 font-medium">더 자세히 보기</p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* 프리미엄 운세 */}
              <div className="space-y-3 mb-5">
                <PremiumCard
                  icon={<Heart size={15} className="text-rose-400" />}
                  title="연애운"
                  content={premiumFortune.love}
                  isLoading={loadingPremium === 'love'}
                  isPaid={hasPaid}
                  onTap={() => handlePremiumFortune('love')}
                />
                <PremiumCard
                  icon={<Coins size={15} className="text-amber-400" />}
                  title="재물운"
                  content={premiumFortune.money}
                  isLoading={loadingPremium === 'money'}
                  isPaid={hasPaid}
                  onTap={() => handlePremiumFortune('money')}
                />
                <PremiumCard
                  icon={<Briefcase size={15} className="text-blue-400" />}
                  title="사업운"
                  content={premiumFortune.career}
                  isLoading={loadingPremium === 'career'}
                  isPaid={hasPaid}
                  onTap={() => handlePremiumFortune('career')}
                />
              </div>

              {!hasPaid && (
                <button
                  onClick={handlePayment}
                  className={`w-full py-4 bg-gradient-to-r ${gradient} text-white font-bold text-base rounded-2xl active:scale-95 transition-transform`}
                >
                  연애운 · 재물운 · 사업운 모두 보기 · 3,300원
                </button>
              )}

              {/* 네이탈 차트 버튼 */}
              <button
                onClick={() => setShowChart(true)}
                className="w-full mt-3 py-3 bg-[#0f0a1e] border border-purple-800/50 text-purple-300 text-sm font-medium rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span>✦</span> 내 네이탈 차트 보기
              </button>
            </motion.div>
          )}

          {/* STEP 5: 결제 유도 */}
          {step === 'premium-prompt' && zodiacData && (
            <motion.div
              key="premium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 max-w-md mx-auto"
            >
              <div className={`rounded-3xl p-8 bg-gradient-to-br ${gradient} text-white text-center mb-6`}>
                <div className="text-6xl mb-3">{zodiacData.symbol}</div>
                <h2 className="text-xl font-bold">{zodiacData.name}의 오늘</h2>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { icon: '💕', title: '연애운', desc: '오늘의 인연과 감정 흐름' },
                  { icon: '💰', title: '재물운', desc: '금전 흐름과 지출 타이밍' },
                  { icon: '💼', title: '사업운', desc: '직장과 일에서의 기운' },
                ].map(item => (
                  <div key={item.title} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-400 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePayment}
                className={`w-full py-4 bg-gradient-to-r ${gradient} text-white font-bold text-base rounded-2xl active:scale-95 transition-transform mb-3`}
              >
                3,300원으로 모두 보기
              </button>
              <button onClick={() => setStep('result')} className="w-full py-3 text-gray-400 text-sm">
                괜찮아요
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 네이탈 차트 모달 */}
      {showChart && (
        <Suspense fallback={null}>
          <NatalChartView
            birthDate={birthDate}
            birthTime={birthTime}
            cityLabel={birthCity?.label}
            lat={birthCity?.lat}
            lng={birthCity?.lng}
            onClose={() => setShowChart(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

// 프리미엄 카드
interface PremiumCardProps {
  icon: React.ReactNode;
  title: string;
  content?: string;
  isLoading: boolean;
  isPaid: boolean;
  onTap: () => void;
}

function PremiumCard({ icon, title, content, isLoading, onTap }: PremiumCardProps) {
  if (content) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="font-bold text-gray-900 text-sm">{title}</span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
      </div>
    );
  }

  return (
    <button
      onClick={onTap}
      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left relative overflow-hidden"
    >
      <div className="blur-[2px] select-none pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="font-bold text-gray-400 text-sm">{title}</span>
        </div>
        <p className="text-gray-300 text-sm">오늘의 {title}을 확인해보세요...</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <Lock size={11} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">잠금 해제</span>
          </div>
        )}
      </div>
    </button>
  );
}
