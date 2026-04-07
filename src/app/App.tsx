import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatInterface from '../components/chat/ChatInterface';
import LandingPage from '../components/pages/LandingPage';
import ZodiacFortunePage from '../components/pages/ZodiacFortunePage';
import ConversationalForm from '../components/forms/ConversationalForm';
import ProductFormSidebar from '../components/sidebars/ProductFormSidebar';
import Toast from '../components/ui/Toast';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import KakaoLoginButton from '../components/auth/KakaoLoginButton';

// Lazy loaded components (무거운 컴포넌트들)
const ChartDashboard = lazy(() => import('../components/chart/ChartDashboard'));
const ViewChart = lazy(() => import('../components/pages/ViewChart'));
const SessionRestoreModal = lazy(() => import('../components/modals/SessionRestoreModal'));
const OnboardingModal = lazy(() => import('../components/modals/OnboardingModal'));
const CardCanvas = lazy(() => import('../components/card/CardCanvas'));
const SoulChartView = lazy(() => import('../components/chart/SoulChartView'));
import { useChat } from '../hooks/useChat';
import { useSession } from '../hooks/useSession';
import { useProfile } from '../hooks/useProfile';
import { useChart } from '../hooks/useChart';
import { useRouter } from '../hooks/useRouter';
import { useSessionStartTracking, useModeSwitch, useMessageTracking } from '../hooks/useAnalytics';
import { Sparkles, BrainCircuit, RefreshCcw, Menu, X, Trophy, Home } from 'lucide-react';
import { AnalysisMode, UserProfile } from '../types';
import { CardData } from '../types/card';
import { SoulChartData } from '../types/chart';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { validateProfile } from '../utils/validation';
import { showToast } from '../utils/toast';
import { generateCard } from '../services/api';

const App: React.FC = () => {
  // Custom Hooks
  const { profile, mode, setProfile, setMode, updateMainProfile } = useProfile();
  const { messages, isLoading, depthScore, sendUserMessage, startSession, switchMode, resetChat, setMessages, setDepthScore } = useChat();
  const { isSessionActive, setIsSessionActive, showRestoreModal, savedSessionData, handleRestoreSession, handleNewSession, autoSaveSession, resetSession } = useSession();
  const { currentRoute, navigate } = useRouter();
  const { chart, isLoading: isChartLoading, isGeneratingSoulChart, loadChart, completeAnalysis, generateAndSaveSoulChart, isAnalysisCompleted } = useChart();

  // Analytics Hooks
  useSessionStartTracking(mode, !!profile.name);
  useModeSwitch(mode);
  const trackMessage = useMessageTracking();

  // UI State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 결과 카드 상태
  const [completionCardData, setCompletionCardData] = useState<CardData | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const cardGeneratedRef = useRef(false); // 중복 생성 방지

  // Unified 모드 영혼 차트 (Firebase 없이 로컬 저장)
  const [unifiedSoulChart, setUnifiedSoulChart] = useState<SoulChartData | null>(null);

  // Track previous mode to detect changes
  const prevModeRef = useRef<AnalysisMode>('integrated');
  const menuRef = useRef<HTMLDivElement>(null);

  // 세션 활성 중 자동 저장
  useEffect(() => {
    autoSaveSession(profile, messages, depthScore, mode);
  }, [messages, mode, depthScore, profile, autoSaveSession]);

  // 모바일 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // 로그인 상태 추적 및 차트 로드
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        loadChart();
      }
    });
    return () => unsubscribe();
  }, [loadChart]);

  // 심도 95%+ 도달 시 자동 카드/영혼차트 생성
  useEffect(() => {
    if (
      depthScore >= 95 &&
      isSessionActive &&
      !isGeneratingCard &&
      !completionCardData &&
      !cardGeneratedRef.current &&
      messages.length >= 6 // 최소 3턴 이상 대화
    ) {
      cardGeneratedRef.current = true;

      // unified 모드: 대화에서 바로 영혼 차트 생성
      if (mode === 'unified') {
        setIsGeneratingCard(true);
        const conversationHistory = messages.map((msg) => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          text: msg.text,
        }));

        import('../services/api').then(({ generateSoulChartFromConversation }) => {
          generateSoulChartFromConversation(profile, conversationHistory)
            .then((soulChart) => {
              // 영혼 차트 로컬 상태에 저장 후 뷰 전환
              setUnifiedSoulChart(soulChart);
              setIsSessionActive(false);
              resetChat();
              navigate({ path: 'chart' });
              showToast('success', '영혼 차트가 완성되었습니다!');
            })
            .catch((error) => {
              console.error('영혼 차트 생성 실패:', error);
              showToast('error', '영혼 차트 생성에 실패했습니다. 다시 시도해주세요.');
              cardGeneratedRef.current = false;
            })
            .finally(() => {
              setIsGeneratingCard(false);
            });
        });
        return;
      }

      // 개별 분석 모드: 결과 카드 생성
      setIsGeneratingCard(true);
      const conversationHistory = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        text: msg.text,
      }));

      generateCard(mode, profile, conversationHistory, depthScore)
        .then((cardData) => {
          setCompletionCardData(cardData);
          showToast('success', '영혼의 문이 활짝 열렸습니다! 결과 카드가 생성되었습니다.');
        })
        .catch((error) => {
          console.error('카드 생성 실패:', error);
          showToast('error', '결과 카드 생성에 실패했습니다. 다시 시도해주세요.');
          cardGeneratedRef.current = false; // 재시도 가능하도록
        })
        .finally(() => {
          setIsGeneratingCard(false);
        });
    }
  }, [depthScore, isSessionActive, isGeneratingCard, completionCardData, messages, mode, profile]);

  // 첫 방문 감지 (온보딩 모달)
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding && currentRoute.path === 'home') {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentRoute]);

  // 세션 복원 핸들러
  const onRestoreSession = () => {
    handleRestoreSession(
      setProfile,
      setMessages,
      setDepthScore,
      setMode,
      (m) => { prevModeRef.current = m; }
    );
  };

  // 세션 시작 핸들러
  const handleStartSession = async () => {
    setIsSessionActive(true);
    await startSession(mode, profile);
  };

  // 모드 변경 핸들러
  const handleModeSelect = (newMode: AnalysisMode) => {
    if (newMode === mode) return;
    setMode(newMode);
  };

  // 모드 변경 Effect
  useEffect(() => {
    if (!isSessionActive) return;
    if (prevModeRef.current === mode) return;

    switchMode(mode, profile);
    prevModeRef.current = mode;
  }, [mode, isSessionActive, switchMode, profile]);

  // 리셋 핸들러
  const handleReset = () => {
    resetSession();
    resetChat();
    setCompletionCardData(null);
    setUnifiedSoulChart(null);
    cardGeneratedRef.current = false;
    prevModeRef.current = 'integrated';
    setIsMenuOpen(false);
  };

  // 메시지 전송 핸들러
  const handleSendMessage = async (text: string) => {
    if (!isSessionActive) {
      setIsSessionActive(true);
    }
    trackMessage(mode, text.length, Math.floor(messages.length / 2) + 1);
    // Q&A 모드(integrated + soulChart)일 때 soulChart 데이터 전달
    const soulChartForQnA = mode === 'integrated' && chart?.soulChart ? chart.soulChart : undefined;
    await sendUserMessage(text, mode, profile, soulChartForQnA);
  };

  // 상품 선택 핸들러 (LandingPage에서 호출)
  const handleSelectProduct = (productId: string) => {
    const modeMap: Record<string, AnalysisMode> = {
      'face': 'face',
      'saju': 'saju',
      'zodiac': 'zodiac',
      'mbti': 'mbti',
      'bloodtype': 'blood',
      'couple': 'couple',
      'integrated': 'integrated',
      'unified': 'unified',
    };

    const analysisMode = modeMap[productId] || 'integrated';
    setMode(analysisMode);
    navigate({ path: 'chat', mode: analysisMode });
    setIsSessionActive(false);
    resetChat();
    setCompletionCardData(null);
    cardGeneratedRef.current = false;
  };

  // 상품 입력 폼 제출 핸들러
  const handleProductFormSubmit = async (formData: Partial<UserProfile>) => {
    const mergedProfile = { ...profile, ...formData };

    // unified 모드는 별도 검증 (최소 이름, 혈액형, MBTI)
    if (mode === 'unified') {
      if (!mergedProfile.name || !mergedProfile.bloodType || !mergedProfile.mbti) {
        showToast('warning', '이름, 혈액형, MBTI는 필수입니다.');
        return;
      }
    } else {
      const validation = validateProfile(mode, mergedProfile);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join('\n');
        showToast('warning', `필수 정보를 입력해주세요:\n${errorMessages}`);
        return;
      }
    }

    setProfile(mergedProfile as UserProfile);
    // localStorage에도 저장
    import('../utils/storage').then(({ saveProfile }) => {
      saveProfile(mergedProfile as UserProfile);
    });
    setIsSessionActive(true);
    await startSession(mode, mergedProfile as UserProfile);
  };

  // 상품 입력 폼 취소 핸들러
  const handleProductFormCancel = () => {
    navigate({ path: 'home' });
  };

  // 분석 시작 핸들러 (ChartDashboard에서 호출)
  const handleStartAnalysisFromChart = (analysisMode: AnalysisMode) => {
    setMode(analysisMode);
    navigate({ path: 'chat', mode: analysisMode });
    setIsSessionActive(false);
    resetChat();
    setCompletionCardData(null);
    cardGeneratedRef.current = false;
  };

  // 분석 완료 → 차트 대시보드로 이동
  const handleAnalysisComplete = async () => {
    // 차트에 결과 저장 (로그인 시)
    if (chart && auth.currentUser && !isAnalysisCompleted(mode) && completionCardData) {
      const analysisResult = {
        mode,
        completedAt: new Date(),
        cardData: completionCardData,
        summary: completionCardData.headline,
        depthScore,
      };
      await completeAnalysis(mode, analysisResult);
    }

    // 상태 초기화 + 차트 대시보드 이동 (로그인 시) / 홈 (비로그인)
    if (isLoggedIn) {
      navigate({ path: 'chart' });
    } else {
      navigate({ path: 'home' });
    }
    setIsSessionActive(false);
    resetChat();
    setCompletionCardData(null);
    cardGeneratedRef.current = false;
  };

  // 종합 차트 생성 핸들러
  const handleGenerateSoulChart = () => {
    generateAndSaveSoulChart(profile);
  };

  // Q&A 모드 시작 핸들러
  const handleStartQnA = () => {
    setMode('integrated');
    navigate({ path: 'chat', mode: 'integrated' });
    setIsSessionActive(true);
    startSession('integrated', profile);
  };

  // 모드 한글 이름
  const getModeName = (m: AnalysisMode) => {
    const names: Record<AnalysisMode, string> = {
      face: '관상 분석', saju: '사주명리', zodiac: '별자리',
      mbti: 'MBTI', blood: '혈액형', couple: '커플 궁합', integrated: '심층 분석',
      unified: '영혼 차트 상담',
    };
    return names[m] || '분석';
  };

  return (
    <>
      <Toast />

      <AnimatePresence>
        {isLoading && !isSessionActive && (
          <LoadingOverlay message="영혼의 문을 여는 중..." />
        )}
      </AnimatePresence>

      {showRestoreModal && savedSessionData && (
        <Suspense fallback={null}>
          <SessionRestoreModal
            timestamp={savedSessionData.timestamp}
            messageCount={savedSessionData.messages.length}
            depthScore={savedSessionData.depthScore}
            onRestore={onRestoreSession}
            onNew={handleNewSession}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      </Suspense>

      <div className="flex h-screen w-full bg-cosmic-950 text-gray-100 overflow-hidden font-sans relative">
        {/* Global Background Ambience */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nebula-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-indigo-900/10 rounded-full blur-[80px]"></div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Route: View Chart */}
            {currentRoute.path === 'view' && (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <Suspense fallback={<LoadingOverlay message="차트를 불러오는 중..." />}>
                  <ViewChart permissionId={currentRoute.permissionId} />
                </Suspense>
              </motion.div>
            )}

            {/* Route: Chat */}
            {currentRoute.path === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col"
              >
                {/* 통합 헤더 - chat 라우트에서 항상 표시 */}
                <header className="flex-shrink-0 h-14 bg-cosmic-950/90 backdrop-blur-xl border-b border-cosmic-800/50 flex items-center justify-between px-4 md:px-6 z-30 relative">
                  {/* 좌측: 로고 (클릭 → 홈) */}
                  <button
                    onClick={() => {
                      if (isSessionActive) {
                        navigate({ path: 'home' });
                        setIsSessionActive(false);
                        resetChat();
                      } else {
                        navigate({ path: 'home' });
                      }
                    }}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-7 h-7 rounded-full bg-nebula-500/10 flex items-center justify-center border border-nebula-500/20">
                      <BrainCircuit className="w-3.5 h-3.5 text-nebula-400" />
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="font-serif font-bold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-starlight-200 to-nebula-400">My Soul Chart</h1>
                    </div>
                  </button>

                  {/* 중앙: 모드 표시 + Depth (세션 활성 시) */}
                  {isSessionActive && (
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                      <div className="hidden md:flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full">
                        <Sparkles size={12} className={depthScore >= 90 ? "text-emerald-400 animate-pulse" : "text-nebula-400"} />
                        <span className="text-[11px] text-gray-300 font-medium">
                          {getModeName(mode)}
                          <span className="mx-1.5 text-gray-600">|</span>
                          <span className={depthScore >= 90 ? "text-emerald-400 font-bold" : "text-nebula-200"}>{depthScore}%</span>
                        </span>
                      </div>
                      <div className="flex md:hidden items-center gap-1.5 text-[11px] text-gray-400">
                        <Sparkles size={10} className="text-nebula-400" />
                        <span className="text-nebula-200 font-medium">{depthScore}%</span>
                      </div>
                    </div>
                  )}

                  {/* 우측: 햄버거 메뉴 */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="w-8 h-8 rounded-lg bg-cosmic-800/80 flex items-center justify-center border border-cosmic-700 text-gray-400 hover:text-white transition-colors"
                      aria-label="메뉴"
                    >
                      {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>

                    {/* 드롭다운 메뉴 */}
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-cosmic-900 border border-cosmic-700 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                          {/* 카카오 로그인 */}
                          <div className="p-4 border-b border-cosmic-800">
                            <KakaoLoginButton />
                          </div>

                          {/* 메뉴 항목들 */}
                          <div className="p-2">
                            {isSessionActive && (
                              <button
                                onClick={handleReset}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-cosmic-800 transition-colors"
                              >
                                <RefreshCcw size={14} />
                                상담 초기화
                              </button>
                            )}
                            <button
                              onClick={() => {
                                navigate({ path: 'home' });
                                setIsMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-cosmic-800 transition-colors"
                            >
                              <BrainCircuit size={14} />
                              다른 분석 선택
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </header>

                {/* 콘텐츠 영역 */}
                <div className="flex-1 flex overflow-hidden">
                  {/* 메인 콘텐츠 */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {!isSessionActive ? (
                      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto scrollbar-hide px-4 py-8">
                        <ConversationalForm
                          mode={mode}
                          profile={profile}
                          onSubmit={handleProductFormSubmit}
                          onCancel={handleProductFormCancel}
                          onChange={updateMainProfile}
                        />
                      </div>
                    ) : completionCardData ? (
                      /* 분석 완료 → 결과 카드 화면 */
                      <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="flex flex-col items-center px-4 py-8 md:py-12"
                        >
                          {/* 축하 헤더 */}
                          <div className="text-center mb-8">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-nebula-500/20 to-aurora-500/20 border border-nebula-500/30 mb-4"
                            >
                              <Trophy className="w-8 h-8 text-nebula-400" />
                            </motion.div>
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-starlight-200 to-nebula-400 mb-2">
                              분석 완료!
                            </h2>
                            <p className="text-sm text-gray-400">
                              {getModeName(mode)} 상담이 완료되었습니다. 결과 카드를 확인해보세요.
                            </p>
                          </div>

                          {/* 결과 카드 */}
                          <Suspense fallback={
                            <div className="flex items-center justify-center gap-2 text-nebula-300 py-20">
                              <Sparkles className="w-5 h-5 animate-pulse" />
                              <span>카드를 불러오는 중...</span>
                            </div>
                          }>
                            <CardCanvas cardData={completionCardData} />
                          </Suspense>

                          {/* 홈으로 돌아가기 버튼 */}
                          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                            <button
                              onClick={handleAnalysisComplete}
                              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-nebula-500/30 to-aurora-500/30 hover:from-nebula-500/40 hover:to-aurora-500/40 text-white rounded-xl font-medium transition-all border border-nebula-500/30 shadow-lg shadow-nebula-500/10"
                            >
                              <Home className="w-5 h-5" />
                              다른 분석 하러 가기
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      /* 채팅 인터페이스 */
                      <>
                        <ChatInterface
                          messages={messages}
                          isLoading={isLoading}
                          onSendMessage={handleSendMessage}
                        />
                        {/* 카드 생성 중 오버레이 */}
                        <AnimatePresence>
                          {isGeneratingCard && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 z-20 bg-cosmic-950/80 backdrop-blur-sm flex items-center justify-center"
                            >
                              <div className="text-center">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nebula-500/20 border border-nebula-500/30 mb-4"
                                >
                                  <Sparkles className="w-8 h-8 text-nebula-400" />
                                </motion.div>
                                <p className="text-lg font-serif text-nebula-200">영혼의 결과를 정리하고 있습니다...</p>
                                <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>

                  {/* 사이드바 (PC만, 항상 표시) */}
                  <aside className="hidden lg:block w-96 flex-shrink-0 overflow-y-auto scrollbar-hide bg-cosmic-900/50 border-l border-cosmic-800">
                    <ProductFormSidebar
                      mode={mode}
                      profile={profile}
                      onChange={updateMainProfile}
                      completedAnalyses={chart?.completedCount || 0}
                    />
                  </aside>
                </div>
              </motion.div>
            )}

            {/* Route: Chart Dashboard (또는 Unified SoulChart) */}
            {currentRoute.path === 'chart' && (unifiedSoulChart || chart) && (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full overflow-y-auto"
              >
                <Suspense fallback={<LoadingOverlay message="차트를 불러오는 중..." />}>
                  {unifiedSoulChart ? (
                    <SoulChartView
                      soulChart={unifiedSoulChart}
                      userName={profile.name}
                      onStartQnA={() => {
                        // Q&A 모드: unified soulChart 데이터로 대화
                        setMode('integrated');
                        navigate({ path: 'chat', mode: 'integrated' });
                        setIsSessionActive(true);
                        startSession('integrated', profile);
                      }}
                      onGoBack={() => {
                        setUnifiedSoulChart(null);
                        navigate({ path: 'home' });
                      }}
                    />
                  ) : chart ? (
                    <ChartDashboard
                      chart={chart}
                      profile={profile}
                      onStartAnalysis={handleStartAnalysisFromChart}
                      onStartQnA={handleStartQnA}
                      isGeneratingSoulChart={isGeneratingSoulChart}
                      onGenerateSoulChart={handleGenerateSoulChart}
                    />
                  ) : null}
                </Suspense>
              </motion.div>
            )}

            {/* Route: Zodiac Fortune */}
            {currentRoute.path === 'zodiac-fortune' && (
              <motion.div
                key="zodiac-fortune"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full overflow-y-auto bg-white"
              >
                <ZodiacFortunePage onBack={() => navigate({ path: 'home' })} />
              </motion.div>
            )}

            {/* Route: Home (랜딩페이지) */}
            {currentRoute.path === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full overflow-y-auto"
              >
                <LandingPage
                  onSelectProduct={handleSelectProduct}
                  onZodiacFortune={() => navigate({ path: 'zodiac-fortune' })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
};

export default App;
