'use client';

import { useAppStore } from '@/store/useAppStore';

export default function Loading() {
  const theme = useAppStore((state) => state.theme);

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`text-center ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>
        {/* 메인 로딩 애니메이션 */}
        <div className="relative mb-8">
          {/* 외부 회전 링 */}
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          
          {/* 내부 펄스 원 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse opacity-75"></div>
          </div>
          
          {/* AI 아이콘 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <div className="space-y-2">
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            AI 학습 코치 준비 중...
          </h2>
          
          {/* 애니메이션된 점들 */}
          <div className="flex justify-center items-center space-x-1">
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'
            }`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'
            }`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'
            }`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* 로딩 단계 표시 */}
        <div className={`mt-8 space-y-3 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <div className="text-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-green-500 border-r-transparent rounded-full animate-spin"></div>
              <span>시스템 초기화 중...</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>UI 로드 완료</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>AI 연결 중</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
              <span>준비 중</span>
            </div>
          </div>
        </div>

        {/* 로딩 프로그레스 바 */}
        <div className="mt-6 w-64 mx-auto">
          <div className={`h-1 rounded-full overflow-hidden ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* 힌트 메시지 */}
        <div className={`mt-8 text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>💡 잠깐! 학습 목표를 미리 생각해두시면 더 나은 상담을 받으실 수 있어요</p>
        </div>
      </div>
    </div>
  );
} 