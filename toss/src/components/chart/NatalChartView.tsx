import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface NatalChartData {
  planets: Record<string, [number, boolean]>; // [degree, retrograde]
  cusps: number[];
  ascendant: number | null;
}

interface NatalChartViewProps {
  birthDate: string;
  birthTime: string;
  cityLabel?: string;
  lat?: number;
  lng?: number;
  onClose: () => void;
}

// 황도 12궁 라벨
const SIGN_LABELS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];


// 행성 심볼
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#f59e0b', Moon: '#94a3b8', Mercury: '#a78bfa', Venus: '#ec4899',
  Mars: '#ef4444', Jupiter: '#f97316', Saturn: '#84cc16', Uranus: '#22d3ee', Neptune: '#6366f1',
};

function degToName(deg: number): string {
  const idx = Math.floor(((deg % 360) + 360) % 360 / 30);
  const within = ((deg % 30) + 30) % 30;
  return `${SIGN_LABELS[idx]} ${within.toFixed(1)}°`;
}

export default function NatalChartView({ birthDate, birthTime, cityLabel, lat, lng, onClose }: NatalChartViewProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<NatalChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? 'http://localhost:3001' : 'https://lightstar-seven.vercel.app';

    fetch(`${baseUrl}/api/natal-chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate, birthTime, lat, lng }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [birthDate, birthTime, lat, lng]);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // @astrodraw/astrochart 동적 로드 (클라이언트 전용)
    import('@astrodraw/astrochart').then(({ Chart }) => {
      svgRef.current!.innerHTML = '';
      const size = Math.min(svgRef.current!.clientWidth, 360);
      const chart = new Chart('natal-chart-svg', size, size, {
        SYMBOL_SCALE: 1.1,
        COLOR_BACKGROUND: '#fafaf9',
        POINTS_COLOR: '#1c1c1e',
        SIGNS_COLOR: '#44403c',
        CIRCLE_COLOR: '#d6d3d1',
        LINE_COLOR: '#a8a29e',
        CUSPS_FONT_COLOR: '#78716c',
        SYMBOL_AXIS_FONT_COLOR: '#1c1c1e',
      });

      // astrochart Points 타입: Record<string, number[]>
      const points: Record<string, number[]> = {};
      for (const [name, [deg, retro]] of Object.entries(data.planets)) {
        points[name] = retro ? [deg, 1] : [deg];
      }
      chart.radix({ planets: points, cusps: data.cusps }).aspects();
    }).catch(() => {
      setError('차트 렌더링 실패');
    });
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
        <div>
          <h2 className="text-stone-900 font-bold text-lg">네이탈 차트</h2>
          <p className="text-stone-400 text-xs mt-0.5">
            {birthDate} {birthTime !== '모름' ? birthTime : ''} {cityLabel ? `· ${cityLabel}` : ''}
          </p>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-900 text-2xl leading-none px-2">×</button>
      </div>

      <div className="flex-1 bg-stone-50 px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="text-5xl mb-4"
            >
              ✦
            </motion.div>
            <p className="text-stone-400 text-sm">행성 위치를 계산하는 중...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={onClose} className="mt-4 text-purple-300 text-sm underline">닫기</button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* SVG 차트 */}
            <div className="flex justify-center mb-6">
              <div
                id="natal-chart-svg"
                ref={svgRef}
                className="w-full max-w-[360px] aspect-square"
              />
            </div>

            {/* 행성 위치 테이블 */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200">
              <h3 className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-3">행성 위치</h3>
              <div className="space-y-2">
                {Object.entries(data.planets).map(([name, [deg, retro]]) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ color: PLANET_COLORS[name] || '#1c1c1e' }} className="text-lg w-6 text-center">
                        {PLANET_SYMBOLS[name] || name[0]}
                      </span>
                      <span className="text-stone-600 text-sm">{name}</span>
                      {retro && <span className="text-red-400 text-xs">℞</span>}
                    </div>
                    <span className="text-stone-900 text-sm font-medium">{degToName(deg)}</span>
                  </div>
                ))}
              </div>

              {data.ascendant != null && (
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-stone-900 text-sm font-semibold">상승궁 (ASC)</span>
                  <span className="text-stone-900 text-sm font-medium">{degToName(data.ascendant)}</span>
                </div>
              )}
            </div>

            {!cityLabel && (
              <p className="text-center text-stone-400 text-xs mt-4">
                태어난 도시를 입력하면 상승궁(Ascendant)도 계산됩니다
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
