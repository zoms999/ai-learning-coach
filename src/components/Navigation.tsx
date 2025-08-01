'use client';

import { useState } from 'react';
import { useAppStore, useUIActions, useStats, useUserSettings } from '@/store/useAppStore';
import FeedbackSystem from '@/components/FeedbackSystem';

interface NavigationProps {
  onViewChange: (view: 'chat' | 'recommendations' | 'history' | 'export') => void;
  currentView: string;
  onReset: () => void;
  userInput: { interests: string[] } | null;
  recommendations: { length: number }[];
  currentConversationId: string | null;
}

export default function Navigation({ 
  onViewChange, 
  currentView, 
  onReset, 
  userInput, 
  recommendations,
  currentConversationId 
}: NavigationProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const { toggleSidebar, setTheme } = useUIActions();
  const stats = useStats();
  const userSettings = useUserSettings();
  const theme = useAppStore((state) => state.theme);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const updateUserSettings = useAppStore((state) => state.updateUserSettings);

  const viewButtons = [
    {
      id: 'chat',
      label: '💬 대화',
      shortLabel: '💬',
      description: 'AI 코치와 대화하기'
    },
    {
      id: 'recommendations',
      label: `💡 추천 ${recommendations.length > 0 ? `(${recommendations.length})` : ''}`,
      shortLabel: '💡',
      description: '맞춤 추천사항 보기'
    },
    {
      id: 'export',
      label: '📤 내보내기',
      shortLabel: '📤',
      description: 'PDF 다운로드 및 이메일 전송'
    },
    {
      id: 'history',
      label: '📚 기록',
      shortLabel: '📚',
      description: '저장된 대화 기록'
    }
  ];

    const formatDate = (date: string | null) => {
    if (!date) return '없음';
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric', 
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    } catch {
      return '없음';
    }
  };

  return (
    <>
      {/* 메인 네비게이션 바 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 왼쪽: 로고 및 제목 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="메뉴 토글"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">AI 학습 코치</h1>
                  {userInput && (
                    <p className="text-xs text-gray-500 truncate max-w-xs">
                      {userInput.interests.slice(0, 2).join(', ')} 학습 상담
                      {currentConversationId && <span className="ml-1 text-green-600">● 저장됨</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 중앙: 네비게이션 버튼들 */}
            {userInput && (
              <div className="hidden md:flex bg-gray-50 rounded-lg p-1 space-x-1">
                {viewButtons.map((button) => (
                  <button
                    key={button.id}
                                         onClick={() => onViewChange(button.id as 'chat' | 'recommendations' | 'history' | 'export')}
                     className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                       currentView === button.id
                         ? 'bg-blue-600 text-white shadow-sm'
                         : 'text-gray-600 hover:bg-white hover:shadow-sm'
                     }`}
                     title={button.description}
                   >
                     <span className="hidden lg:inline">{button.label}</span>
                     <span className="lg:hidden">{button.shortLabel}</span>
                   </button>
                 ))}
               </div>
             )}
 
             {/* 오른쪽: 액션 버튼들 */}
             <div className="flex items-center space-x-2">
               {/* 통계 버튼 */}
               <button
                 onClick={() => setShowStats(!showStats)}
                 className="relative p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                 title="사용 통계"
                 aria-label="사용 통계 보기"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
                 {stats.totalConversations > 0 && (
                   <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                     {stats.totalConversations > 9 ? '9+' : stats.totalConversations}
                   </span>
                 )}
               </button>
 
               {/* 테마 전환 버튼 */}
               <button
                 onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                 className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                 title="테마 전환"
                 aria-label="테마 전환"
               >
                 {theme === 'light' ? (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                   </svg>
                 ) : (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                 )}
               </button>
 
                             {/* 설정 버튼 */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                title="설정"
                aria-label="설정 열기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* 피드백 버튼 */}
              <button
                onClick={() => setShowFeedback(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                title="피드백 보내기"
                aria-label="피드백 보내기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </button>

              {/* 새 상담 시작 버튼 */}
              {userInput && (
                <button
                  onClick={onReset}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="hidden sm:inline">새 상담</span>
                  <span className="sm:hidden">+</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 모바일 네비게이션 */}
        {userInput && (
          <div className="md:hidden border-t border-gray-200 bg-gray-50">
            <div className="flex justify-around py-2">
              {viewButtons.map((button) => (
                <button
                  key={button.id}
                                     onClick={() => onViewChange(button.id as 'chat' | 'recommendations' | 'history' | 'export')}
                   className={`flex flex-col items-center py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                     currentView === button.id
                       ? 'text-blue-600 bg-blue-50'
                       : 'text-gray-600'
                   }`}
                   title={button.description}
                 >
                   <span className="text-lg">{button.shortLabel}</span>
                   <span className="mt-1">{button.id === 'recommendations' ? '추천' : 
                                           button.id === 'export' ? '내보내기' :
                                           button.id === 'history' ? '기록' : '대화'}</span>
                 </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 통계 드롭다운 */}
      {showStats && (
        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64 z-50">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            📊 사용 통계
            <button
              onClick={() => setShowStats(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">총 상담:</span>
              <span className="font-medium">{stats.totalConversations}회</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">총 메시지:</span>
              <span className="font-medium">{stats.totalMessages}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">총 추천사항:</span>
              <span className="font-medium">{stats.totalRecommendations}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">마지막 활동:</span>
              <span className="font-medium">{formatDate(stats.lastActiveDate)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 설정 드롭다운 */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72 z-50">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            ⚙️ 설정
            <button
              onClick={() => setShowSettings(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </h3>
          <div className="space-y-4">
            {/* 자동 저장 설정 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">자동 저장</span>
              <button
                onClick={() => updateUserSettings({ autoSave: !userSettings.autoSave })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  userSettings.autoSave ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    userSettings.autoSave ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 알림 설정 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">알림</span>
              <button
                onClick={() => updateUserSettings({ notifications: !userSettings.notifications })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  userSettings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    userSettings.notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 이메일 리마인더 설정 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">이메일 리마인더</span>
              <button
                onClick={() => updateUserSettings({ emailReminders: !userSettings.emailReminders })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  userSettings.emailReminders ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    userSettings.emailReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 테마 선택 */}
            <div className="space-y-2">
              <span className="text-sm text-gray-700">테마</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    theme === 'light'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ☀️ 라이트
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🌙 다크
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 클릭 외부 영역 감지 */}
      {(showStats || showSettings) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowStats(false);
            setShowSettings(false);
          }}
        />
      )}

      {/* 피드백 시스템 */}
      <FeedbackSystem 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
      />
    </>
  );
} 