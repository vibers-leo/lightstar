import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../hooks/useProfile';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: '✦',
    title: 'My Soul Chart',
    description: 'AI가 읽어주는 당신의 영혼\n사주, 관상, MBTI, 혈액형, 별자리를\n하나의 차트로 통합합니다.',
  },
  {
    id: '2',
    icon: '🔮',
    title: '6가지 분석',
    description: '관상 · 사주 · 별자리 · MBTI\n혈액형 · 커플 궁합까지\n깊이 있는 AI 상담을 경험하세요.',
  },
  {
    id: '3',
    icon: '📊',
    title: '영혼 차트 완성',
    description: '5개 분석을 완료하면\n세상에 단 하나뿐인\n당신만의 영혼 차트가 탄생합니다.',
  },
  {
    id: '4',
    icon: '📸',
    title: '카메라로 관상 분석',
    description: '셀카 한 장으로\nAI가 관상을 읽어드립니다.\n얼굴에 새겨진 운명을 확인하세요.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useProfile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const finishOnboarding = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <Text style={styles.slideIcon}>{item.icon}</Text>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!isLast && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>건너뛰기</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 100);
        }}
      />

      {/* 페이지 인디케이터 */}
      <View style={styles.pagination}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* 다음/시작 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {isLast ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  skipText: { fontSize: 15, color: '#9da3ff80' },
  slide: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40,
  },
  slideIcon: { fontSize: 72, marginBottom: 32 },
  slideTitle: {
    fontSize: 28, fontWeight: 'bold', color: '#e8eaff',
    marginBottom: 16, textAlign: 'center',
  },
  slideDescription: {
    fontSize: 16, color: '#9da3ff', lineHeight: 26,
    textAlign: 'center', opacity: 0.8,
  },
  pagination: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 8, marginBottom: 32,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: '#9333ea', width: 24 },
  dotInactive: { backgroundColor: '#1a1a42' },
  footer: { paddingHorizontal: 20, paddingBottom: 20 },
  nextBtn: {
    padding: 16, borderRadius: 14, alignItems: 'center',
    backgroundColor: '#9333ea',
  },
  nextBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
