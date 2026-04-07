import React, { useState } from 'react';
import { PRODUCTS } from '../../types/product';
import { ProductCard } from '../cards/ProductCard';
import { Sparkles, ArrowRight, X, Scan, Stars, Brain, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onSelectProduct: (productId: string) => void;
  onZodiacFortune?: () => void;
}

// 5가지 분석 영역 아이콘 + 라벨
const ANALYSIS_AREAS = [
  { icon: Scan, label: '관상', color: '#a78bfa' },
  { icon: Stars, label: '별자리', color: '#60a5fa' },
  { icon: Brain, label: 'MBTI', color: '#c4b5fd' },
  { icon: Sparkles, label: '사주', color: '#14b8a6' },
  { icon: Droplet, label: '혈액형', color: '#5eead4' },
];

export default function LandingPage({ onSelectProduct, onZodiacFortune }: LandingPageProps) {
  const [showBanner, setShowBanner] = useState(() => {
    return localStorage.getItem('promoBannerDismissed') !== 'true';
  });

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('promoBannerDismissed', 'true');
  };

  // unified 제외한 개별 상품들
  const individualProducts = PRODUCTS.filter(p => p.id !== 'unified');

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">

      {/* 프로모션 배너 */}
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8 relative"
        >
          <div className="relative overflow-hidden rounded-2xl p-4 md:p-5 text-center"
            style={{
              background: 'linear-gradient(135deg, #f59e0b20, #a78bfa20, #14b8a620)',
              border: '1px solid #f59e0b40',
            }}
          >
            <button
              onClick={dismissBanner}
              className="absolute top-3 right-3 text-starlight-400/50 hover:text-starlight-300 transition-colors"
              aria-label="배너 닫기"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-lg md:text-xl font-bold" style={{ color: '#f59e0b' }}>
              연휴 맞이 첫 상담 무료!
            </p>
            <p className="text-sm text-starlight-300/80 mt-1">
              나의 영혼 차트를 무료로 완성해보세요
            </p>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Sparkles className="w-12 h-12 text-nebula-400 star-twinkle" />
          <h1 className="font-serif text-5xl md:text-7xl font-bold glow-nebula" style={{ color: '#a78bfa' }}>
            My Soul Chart
          </h1>
        </div>

        <p className="text-xl md:text-2xl text-starlight-200 mb-4 font-medium">
          나의 영혼을 탐험하는 여정
        </p>

        <p className="text-base text-starlight-300/80 max-w-2xl mx-auto leading-relaxed mb-8">
          AI 도사가 하나의 연속 상담에서 당신의 내면을 깊이 탐구합니다.
        </p>

        {/* 메인 CTA */}
        <motion.button
          onClick={() => onSelectProduct('unified')}
          className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-xl md:text-2xl transition-all duration-300 hover:scale-[1.03]"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #a78bfa)',
            boxShadow: '0 0 40px #a78bfa40, 0 0 80px #f59e0b20',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-7 h-7" />
          나의 영혼 차트 만들기
          <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </motion.button>

        {/* 5가지 분석 영역 아이콘 */}
        <div className="flex items-center justify-center gap-6 md:gap-8 mt-8">
          {ANALYSIS_AREAS.map((area, i) => (
            <div key={area.label} className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `${area.color}15`,
                  border: `1px solid ${area.color}30`,
                }}
              >
                <area.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: area.color }} />
              </div>
              <span className="text-xs text-starlight-400/70">{area.label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-starlight-400/60 mt-4">
          하나의 상담에서 5가지 영역을 통합 분석
        </p>
      </div>

      {/* 별자리 운세 빠른 진입 카드 */}
      {onZodiacFortune && (
        <div className="max-w-md mx-auto mb-10 px-4">
          <motion.button
            onClick={onZodiacFortune}
            className="w-full rounded-2xl p-5 text-left flex items-center gap-4 hover:scale-[1.02] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #7c3aed20, #2563eb20)',
              border: '1px solid #7c3aed40',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-4xl">⭐</div>
            <div className="flex-1">
              <p className="font-bold text-white text-base">오늘의 별자리 운세</p>
              <p className="text-starlight-400/70 text-sm mt-0.5">생년월일 입력 → 무료 운세 확인</p>
            </div>
            <ArrowRight className="w-5 h-5 text-starlight-400/50" />
          </motion.button>
        </div>
      )}

      {/* 개별 분석 카드 (축소) */}
      <div className="max-w-7xl mx-auto mt-12">
        <p className="text-center text-sm text-starlight-400/50 mb-6">
          또는 개별 분석을 선택할 수도 있어요
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {individualProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onSelectProduct(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <p className="text-sm text-starlight-400/50">
          AI 영혼 안내자가 당신의 이야기에 귀 기울입니다
        </p>
      </div>
    </div>
  );
}
