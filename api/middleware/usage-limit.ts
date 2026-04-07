// Freemium 사용량 제한 시스템 (Phase 2H-3)
import { db } from '../lib/firebase-admin';

interface UsageData {
  messageCount: number;
  monthlyLimit: number;
  resetDate: any; // Firestore Timestamp or Date
}

/**
 * 사용자의 메시지 사용량 체크 및 카운트 증가
 * @param uid Firebase UID (카카오 로그인: kakao_{id})
 * @returns true: 사용 가능, false: 사용량 초과
 */
export async function checkUsageLimit(uid: string): Promise<boolean> {
  if (!uid) return false; // 인증되지 않은 사용자는 거부

  const usageRef = db.collection('users').doc(uid).collection('usage').doc('current');

  try {
    const snapshot = await usageRef.get();

    // 신규 사용자: 무료 할당량 생성
    if (!snapshot.exists) {
      const newUsage: UsageData = {
        messageCount: 1, // 첫 메시지
        monthlyLimit: 50, // 무료 사용자는 월 50 메시지
        resetDate: getNextMonthStart(),
      };

      await usageRef.set(newUsage);
      return true;
    }

    const data = snapshot.data() as UsageData;
    const now = new Date();

    // 월 초기화 체크 (다음 달로 넘어갔으면 카운트 리셋)
    if (now >= data.resetDate.toDate()) {
      const resetUsage: UsageData = {
        messageCount: 1, // 새 달의 첫 메시지
        monthlyLimit: data.monthlyLimit, // 한도는 유지
        resetDate: getNextMonthStart(),
      };

      await usageRef.update(resetUsage);
      return true;
    }

    // 제한 초과 체크
    if (data.messageCount >= data.monthlyLimit) {
      return false; // 사용량 초과
    }

    // 카운트 증가
    await usageRef.update({
      messageCount: data.messageCount + 1,
    });

    return true;
  } catch (error) {
    console.error('Usage limit check error:', error);
    // 에러 발생 시 일단 허용 (서비스 중단 방지)
    return true;
  }
}

/**
 * 다음 달 1일 00:00:00 반환
 */
function getNextMonthStart(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}

/**
 * 사용자의 현재 사용량 조회 (대시보드용)
 */
export async function getUserUsage(uid: string): Promise<UsageData | null> {
  if (!uid) return null;

  const usageRef = db.collection('users').doc(uid).collection('usage').doc('current');

  try {
    const snapshot = await usageRef.get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as UsageData;
  } catch (error) {
    console.error('Get usage error:', error);
    return null;
  }
}
