'use client';

import { useState } from 'react';
import { Recommendation } from '@/types';

interface RecommendationCardsProps {
  recommendations: Recommendation[];
  onCardClick?: (recommendation: Recommendation) => void;
}

interface RecommendationModalProps {
  recommendation: Recommendation;
  isOpen: boolean;
  onClose: () => void;
}

function RecommendationModal({ recommendation, isOpen, onClose }: RecommendationModalProps) {
  if (!isOpen) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'resource': return '📚';
      case 'activity': return '🎯';
      case 'strategy': return '🧠';
      default: return '💡';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'resource': return '학습 자료';
      case 'activity': return '학습 활동';
      case 'strategy': return '학습 전략';
      default: return '기타';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '중간';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getCategoryIcon(recommendation.category)}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {recommendation.title}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">
                  {getCategoryName(recommendation.category)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                  우선순위: {getPriorityText(recommendation.priority)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="닫기"
            aria-label="모달 닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 상세 설명</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {recommendation.description}
            </p>
          </div>

          {/* 실행 가이드 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 실행 가이드</h3>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="space-y-2">
                {recommendation.category === 'resource' && (
                  <>
                    <p className="text-blue-800 text-sm">• 추천된 자료를 정기적으로 학습하세요</p>
                    <p className="text-blue-800 text-sm">• 학습한 내용을 정리하고 복습하세요</p>
                    <p className="text-blue-800 text-sm">• 모르는 부분은 추가로 검색해보세요</p>
                  </>
                )}
                {recommendation.category === 'activity' && (
                  <>
                    <p className="text-green-800 text-sm">• 일정한 시간을 정해서 활동하세요</p>
                    <p className="text-green-800 text-sm">• 진행 상황을 기록하고 평가하세요</p>
                    <p className="text-green-800 text-sm">• 꾸준히 지속할 수 있는 방법을 찾으세요</p>
                  </>
                )}
                {recommendation.category === 'strategy' && (
                  <>
                    <p className="text-purple-800 text-sm">• 단계별로 계획을 세우세요</p>
                    <p className="text-purple-800 text-sm">• 주기적으로 학습 방법을 점검하세요</p>
                    <p className="text-purple-800 text-sm">• 필요에 따라 전략을 조정하세요</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              이해했어요
            </button>
            <button
              onClick={() => {
                // TODO: 북마크 기능 구현
                alert('북마크 기능은 추후 구현 예정입니다.');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              📌 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationCards({ recommendations, onCardClick }: RecommendationCardsProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300';
      case 'medium': return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:border-yellow-300';
      case 'low': return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300';
      default: return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'resource': return '📚';
      case 'activity': return '🎯';
      case 'strategy': return '🧠';
      default: return '💡';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'resource': return '학습 자료';
      case 'activity': return '학습 활동';
      case 'strategy': return '학습 전략';
      default: return '기타';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '중간';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  const handleCardClick = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    if (onCardClick) {
      onCardClick(recommendation);
    }
  };

  const closeModal = () => {
    setSelectedRecommendation(null);
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">아직 추천사항이 없어요</h3>
        <p className="text-gray-600">AI와 대화를 나누면 맞춤형 추천사항이 나타납니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            💡 맞춤 추천사항
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({recommendations.length}개)
            </span>
          </h2>
          <div className="text-sm text-gray-500">
            클릭하면 상세 정보를 볼 수 있어요
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              onClick={() => handleCardClick(recommendation)}
              onMouseEnter={() => setHoveredCard(recommendation.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 transform
                ${getPriorityColor(recommendation.priority)}
                ${hoveredCard === recommendation.id ? 'scale-105 shadow-lg' : 'hover:shadow-md'}
              `}
            >
              {/* 카드 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getCategoryIcon(recommendation.category)}</span>
                  <span className="text-xs font-medium text-gray-600">
                    {getCategoryName(recommendation.category)}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(recommendation.priority)}`}>
                  {getPriorityText(recommendation.priority)}
                </span>
              </div>

              {/* 카드 제목 */}
              <h3 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">
                {recommendation.title}
              </h3>

              {/* 카드 설명 */}
              <p className="text-gray-700 text-xs leading-relaxed mb-3">
                {recommendation.description.length > 100 
                  ? `${recommendation.description.slice(0, 100)}...`
                  : recommendation.description
                }
              </p>

              {/* 카드 푸터 */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  자세히 보기 →
                </div>
                {hoveredCard === recommendation.id && (
                  <div className="text-xs text-blue-600 font-medium animate-pulse">
                    클릭!
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 추가 정보 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600">ℹ️</span>
            <span className="text-sm font-medium text-blue-800">추천사항 활용 팁</span>
          </div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 우선순위가 높은 항목부터 시작해보세요</li>
            <li>• 각 카드를 클릭하면 실행 가이드를 확인할 수 있어요</li>
            <li>• AI 코치에게 추천사항에 대해 더 자세히 질문해보세요</li>
          </ul>
        </div>
      </div>

      {/* 모달 */}
      <RecommendationModal
        recommendation={selectedRecommendation!}
        isOpen={!!selectedRecommendation}
        onClose={closeModal}
      />
    </>
  );
} 