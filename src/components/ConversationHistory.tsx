'use client';

import { useState, useMemo } from 'react';
import { useChatHistory, SavedConversation } from '@/hooks/useChatHistory';

interface ConversationHistoryProps {
  onLoadConversation: (conversation: SavedConversation) => void;
}

export default function ConversationHistory({ onLoadConversation }: ConversationHistoryProps) {
  const {
    conversations,
    deleteConversation,
    searchConversations,
    clearAllConversations
  } = useChatHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // 검색 및 정렬된 대화 목록
  const filteredAndSortedConversations = useMemo(() => {
    const filtered = searchQuery ? searchConversations(searchQuery) : conversations;
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [conversations, searchQuery, sortBy, searchConversations]);

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return '오늘 ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return '어제 ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  // 대화 삭제
  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    setShowDeleteConfirm(null);
  };

  // 모든 대화 삭제
  const handleClearAll = () => {
    clearAllConversations();
    setShowClearAllConfirm(false);
  };

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">저장된 대화가 없습니다</h3>
        <p className="text-gray-600">AI 코치와 대화를 나누고 저장해보세요!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* 헤더 */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            📚 대화 기록
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({conversations.length}개)
            </span>
          </h2>
          <button
            onClick={() => setShowClearAllConfirm(true)}
            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
          >
            전체 삭제
          </button>
        </div>

        {/* 검색 및 정렬 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="대화 내용, 학습 목표, 관심 분야 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 정렬 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="대화 정렬 순서 선택"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순</option>
          </select>
        </div>
      </div>

      {/* 대화 목록 */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAndSortedConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => onLoadConversation(conversation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* 제목 */}
                    <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {conversation.title}
                    </h3>

                    {/* 미리보기 */}
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {conversation.preview}
                    </p>

                    {/* 메타 정보 */}
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatDate(conversation.updatedAt)}</span>
                      <span>메시지 {conversation.messages.length}개</span>
                      <span>추천사항 {conversation.recommendations.length}개</span>
                    </div>

                    {/* 관심 분야 태그 */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {conversation.userInput.interests.slice(0, 3).map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {interest}
                        </span>
                      ))}
                      {conversation.userInput.interests.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{conversation.userInput.interests.length - 3}개
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="ml-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(conversation.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">대화 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 대화를 삭제하시겠습니까? 삭제된 대화는 복구할 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteConversation(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 전체 삭제 확인 모달 */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">모든 대화 삭제</h3>
            <p className="text-gray-600 mb-6">
              저장된 모든 대화를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                전체 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 