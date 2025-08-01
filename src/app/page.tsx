'use client';

import { useEffect, useCallback, useRef } from 'react';
import InputForm from '@/components/InputForm';
import ChatInterface from '@/components/ChatInterface';
import RecommendationCards from '@/components/RecommendationCards';
import ConversationHistory from '@/components/ConversationHistory';
import PDFExport from '@/components/PDFExport';
import EmailExport from '@/components/EmailExport';
import Navigation from '@/components/Navigation';
import { UserInput, Recommendation } from '@/types';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useAppStore, useSessionActions, useStatsActions } from '@/store/useAppStore';

export default function Home() {
  // Zustand 상태 - 개별 구독으로 변경하여 안정성 확보
  const userInput = useAppStore((state) => state.userInput);
  const messages = useAppStore((state) => state.messages);
  const recommendations = useAppStore((state) => state.recommendations);
  const isLoading = useAppStore((state) => state.isLoading);
  const showChat = useAppStore((state) => state.showChat);
  const currentView = useAppStore((state) => state.currentView);
  const currentConversationId = useAppStore((state) => state.currentConversationId);
  const theme = useAppStore((state) => state.theme);

  // Zustand 액션
  const {
    setUserInput,
    setMessages,
    addMessage,
    setRecommendations,
    addRecommendations,
    setIsLoading,
    setShowChat,
    setCurrentView,
    setCurrentConversationId,
    resetSession,
    loadConversation
  } = useSessionActions();

  const {
    incrementConversationCount,
    incrementMessageCount,
    incrementRecommendationCount
  } = useStatsActions();

  // Chat History 훅
  const { saveConversation, updateConversation } = useChatHistory();

  // 테마 적용
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleFormSubmit = useCallback(async (data: UserInput) => {
    console.log('폼 데이터:', data);
    setIsLoading(true);
    setUserInput(data);
    setRecommendations([]);
    setCurrentConversationId(null);
    setMessages([]);
    
    // 통계 업데이트 - 비동기로 처리하여 렌더링 블로킹 방지
    setTimeout(() => {
      incrementConversationCount();
    }, 0);
    
    // 짧은 지연 후 채팅 인터페이스로 전환
    setTimeout(() => {
      setIsLoading(false);
      setShowChat(true);
      setCurrentView('chat');
    }, 500);
  }, [setIsLoading, setUserInput, setRecommendations, setCurrentConversationId, setMessages, incrementConversationCount, setShowChat, setCurrentView]);

  const handleNewRecommendations = useCallback((newRecommendations: Recommendation[]) => {
    setRecommendations(newRecommendations);
    // 통계 업데이트를 다음 틱에서 처리하여 렌더링 사이클 분리
    Promise.resolve().then(() => {
      incrementRecommendationCount(newRecommendations.length);
    });
  }, [setRecommendations, incrementRecommendationCount]);

  // 대화 저장 (첫 번째 AI 응답 후 자동 저장)
  const handleSaveConversation = (conversationMessages: any[], conversationRecommendations: Recommendation[]) => {
    if (!userInput) return;

    if (currentConversationId) {
      // 기존 대화 업데이트
      updateConversation(currentConversationId, conversationMessages, conversationRecommendations);
    } else {
      // 새 대화 저장
      const newId = saveConversation(userInput, conversationMessages, conversationRecommendations);
      setCurrentConversationId(newId);
    }
  };

  // 저장된 대화 불러오기
  const handleLoadConversation = (conversation: any) => {
    loadConversation(conversation);
  };

  const handleReset = () => {
    resetSession();
  };

  const handleRecommendationCardClick = (recommendation: Recommendation) => {
    // 추천사항 카드 클릭 시 동작 (현재는 모달에서 처리)
    console.log('추천사항 클릭:', recommendation);
  };

  const handleViewChange = (view: 'chat' | 'recommendations' | 'history' | 'export') => {
    setCurrentView(view);
  };

  // 메시지 추가 시 통계 업데이트
  const handleMessageAdd = (message: any) => {
    addMessage(message);
    incrementMessageCount();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* 네비게이션 */}
      {userInput && (
        <Navigation
          onViewChange={handleViewChange}
          currentView={currentView}
          onReset={handleReset}
          userInput={userInput}
          recommendations={recommendations}
          currentConversationId={currentConversationId}
        />
      )}

      <div className={`container mx-auto px-4 ${userInput ? 'py-6' : 'py-8'}`}>
        {/* 헤더 (초기 화면에만 표시) */}
        {!userInput && (
          <header className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">AI</span>
              </div>
            </div>
            <h1 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              🤖 AI 학습 코치
            </h1>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              당신의 학습 목표와 고민을 AI가 분석하여 맞춤형 학습 계획과 조언을 제공합니다.
            </p>
          </header>
        )}

        {/* 메인 콘텐츠 */}
        <main>
          {!userInput ? (
            <div className="space-y-8">
              <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
              
              {/* 대화 기록 미리보기 */}
              <div className="max-w-4xl mx-auto">
                <ConversationHistory onLoadConversation={handleLoadConversation} />
              </div>
            </div>
          ) : !showChat ? (
            <div className="max-w-2xl mx-auto">
              <div className={`rounded-lg shadow-lg p-6 text-center ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  AI 학습 코치가 준비 중입니다...
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {currentView === 'chat' ? (
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* 채팅 영역 */}
                  <div className="lg:col-span-3">
                    <ChatInterface 
                      initialUserInput={userInput}
                      onNewRecommendations={handleNewRecommendations}
                    />
                  </div>

                  {/* 사이드바 - 요약 정보 */}
                  <div className="space-y-6">
                    {/* 사용자 정보 요약 */}
                    <div className={`rounded-lg shadow-lg p-4 ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <h3 className={`font-semibold mb-3 flex items-center ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        📋 상담 정보
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>목표:</span>
                          <p className={`mt-1 text-xs leading-relaxed ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {userInput.learningGoal.length > 60 
                              ? `${userInput.learningGoal.slice(0, 60)}...` 
                              : userInput.learningGoal
                            }
                          </p>
                        </div>
                        <div>
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>관심분야:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {userInput.interests.slice(0, 4).map((interest) => (
                              <span
                                key={interest}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {interest}
                              </span>
                            ))}
                            {userInput.interests.length > 4 && (
                              <span className={`text-xs ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                              }`}>+{userInput.interests.length - 4}개</span>
                            )}
                          </div>
                        </div>
                        {userInput.learningLevel && (
                          <div>
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>수준:</span>
                            <span className={`ml-1 text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>{userInput.learningLevel}</span>
                          </div>
                        )}
                        {userInput.timeAvailable && (
                          <div>
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>시간:</span>
                            <span className={`ml-1 text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>{userInput.timeAvailable}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 진행 상황 */}
                    <div className={`rounded-lg shadow-lg p-4 ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <h3 className={`font-semibold mb-3 flex items-center ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        📊 상담 현황
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>메시지:</span>
                          <span className="font-medium text-blue-600">
                            {messages.length}개
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>추천사항:</span>
                          <span className="font-medium text-blue-600">
                            {recommendations.length}개
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>높은 우선순위:</span>
                          <span className="font-medium text-red-600">
                            {recommendations.filter(r => r.priority === 'high').length}개
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>학습 자료:</span>
                          <span className="font-medium text-green-600">
                            {recommendations.filter(r => r.category === 'resource').length}개
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>저장 상태:</span>
                          <span className={`font-medium ${currentConversationId ? 'text-green-600' : 'text-gray-400'}`}>
                            {currentConversationId ? '저장됨' : '미저장'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 추천사항 미리보기 */}
                    {recommendations.length > 0 && (
                      <div className={`rounded-lg shadow-lg p-4 ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`font-semibold text-sm ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            💡 최신 추천사항
                          </h3>
                          <button
                            onClick={() => setCurrentView('recommendations')}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            전체보기 →
                          </button>
                        </div>
                        <div className="space-y-2">
                          {recommendations.slice(0, 2).map((rec) => (
                            <div key={rec.id} className={`p-2 border rounded text-xs ${
                              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                            }`}>
                              <div className="flex items-center space-x-1 mb-1">
                                <span>{rec.category === 'resource' ? '📚' : rec.category === 'activity' ? '🎯' : '🧠'}</span>
                                <span className={`font-medium ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                                }`}>{rec.title.slice(0, 20)}...</span>
                              </div>
                              <p className={`text-xs ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {rec.description.slice(0, 50)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 저장 버튼 */}
                    {!currentConversationId && messages.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <h3 className="font-semibold text-yellow-800 mb-2 text-sm">
                          💾 대화 저장
                        </h3>
                        <p className="text-yellow-700 text-xs mb-3">
                          현재 대화가 저장되지 않았습니다. 저장하시겠습니까?
                        </p>
                        <button
                          onClick={() => handleSaveConversation(messages, recommendations)}
                          className="w-full bg-yellow-600 text-white py-2 px-3 rounded text-xs font-medium hover:bg-yellow-700 transition-colors"
                        >
                          대화 저장하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : currentView === 'recommendations' ? (
                // 추천사항 전체 보기 뷰
                <div className="space-y-6">
                  <RecommendationCards 
                    recommendations={recommendations}
                    onCardClick={handleRecommendationCardClick}
                  />
                  
                  {/* 채팅으로 돌아가기 버튼 */}
                  <div className="text-center">
                    <button
                      onClick={() => setCurrentView('chat')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      💬 AI 코치와 더 대화하기
                    </button>
                  </div>
                </div>
              ) : currentView === 'export' ? (
                // PDF 및 이메일 내보내기 뷰
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* PDF 다운로드 */}
                    <PDFExport 
                      userInput={userInput}
                      messages={messages}
                      recommendations={recommendations}
                      title={`${userInput.interests.slice(0, 2).join(', ')} 학습 상담 보고서`}
                    />
                    
                    {/* 이메일 전송 */}
                    <EmailExport 
                      userInput={userInput}
                      messages={messages}
                      recommendations={recommendations}
                      title={`${userInput.interests.slice(0, 2).join(', ')} 학습 상담 보고서`}
                    />
                  </div>
                  
                  {/* 다른 뷰로 이동 버튼들 */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setCurrentView('chat')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      💬 대화로 돌아가기
                    </button>
                    <button
                      onClick={() => setCurrentView('recommendations')}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      💡 추천사항 보기
                    </button>
                  </div>
                </div>
              ) : (
                // 대화 기록 뷰
                <div className="space-y-6">
                  <ConversationHistory onLoadConversation={handleLoadConversation} />
                  
                  {/* 새 상담 시작 버튼 */}
                  <div className="text-center">
                    <button
                      onClick={handleReset}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      ✨ 새로운 상담 시작하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 푸터 */}
        {!userInput && (
          <footer className={`text-center mt-16 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p>&copy; 2024 AI Learning Coach. 개인 학습 지원을 위한 프로젝트입니다.</p>
          </footer>
        )}
      </div>
    </div>
  );
}
