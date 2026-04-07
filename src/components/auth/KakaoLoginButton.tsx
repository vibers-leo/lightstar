import { useEffect, useState } from 'react';
import { initKakaoSDK, loginWithKakao, logoutKakao } from '../../services/kakao';
import { showToast } from '../../utils/toast';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function KakaoLoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    nickname?: string;
    profileImage?: string;
  } | null>(null);

  useEffect(() => {
    // Kakao SDK 초기화
    initKakaoSDK();

    // Firebase Auth 상태 변화 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        // Firebase Auth의 customClaims에서 사용자 정보 가져오기
        user.getIdTokenResult().then((idTokenResult) => {
          setUserInfo({
            nickname: idTokenResult.claims.nickname as string,
            profileImage: idTokenResult.claims.profileImage as string,
          });
        });
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const user = await loginWithKakao();
      showToast('success', `${user.nickname || '도사'}님, 환영합니다!`);
      setUserInfo({
        nickname: user.nickname,
        profileImage: user.profileImage,
      });

      // vibers-sync: lightstar 카카오 로그인 사용자를 vibers.brand_members에 등록
      fetch(`${import.meta.env.VITE_VIBERS_SITE_URL ?? 'https://vibers.co.kr'}/api/vibers/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-vibers-secret': import.meta.env.VITE_VIBERS_CONNECT_SECRET ?? '' },
        body: JSON.stringify({ type: 'join', brandSlug: 'lightstar', userEmail: user.email ?? '', userName: user.nickname ?? null }),
      }).catch(() => {});
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      showToast('error', '카카오 로그인에 실패했습니다');
    }
  };

  const handleLogout = async () => {
    try {
      await Promise.all([
        signOut(auth), // Firebase 로그아웃
        logoutKakao(), // 카카오 로그아웃
      ]);
      showToast('success', '로그아웃 되었습니다');
      setUserInfo(null);
    } catch (error) {
      console.error('로그아웃 에러:', error);
      showToast('error', '로그아웃에 실패했습니다');
    }
  };

  if (isLoggedIn && userInfo) {
    return (
      <div className="flex items-center gap-3">
        {userInfo.profileImage && (
          <img
            src={userInfo.profileImage}
            alt={userInfo.nickname}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm text-nebula-200">{userInfo.nickname}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-cosmic-800/50 hover:bg-cosmic-700/50 text-nebula-200 rounded-lg transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] rounded-lg font-medium transition-colors"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 0C4.02944 0 0 3.35786 0 7.5C0 10.0902 1.71106 12.3765 4.26106 13.6838L3.27544 17.3794C3.22694 17.5529 3.39544 17.7054 3.55919 17.6204L8.01581 15.0915C8.34206 15.1185 8.67206 15.132 9.00419 15.132C13.9748 15.132 18.0042 11.7741 18.0042 7.63206C18.0001 3.35786 13.9706 0 9 0Z"
          fill="currentColor"
        />
      </svg>
      카카오 로그인
    </button>
  );
}
