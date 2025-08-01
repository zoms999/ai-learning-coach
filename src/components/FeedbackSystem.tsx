'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import toast from 'react-hot-toast';

interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  rating: number;
  message: string;
  email?: string;
  category: string;
}

interface FeedbackSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackSystem({ isOpen, onClose }: FeedbackSystemProps) {
  const theme = useAppStore((state) => state.theme);
  const [step, setStep] = useState<'rating' | 'details' | 'success'>('rating');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    type: 'general',
    rating: 0,
    message: '',
    email: '',
    category: '',
  });

  const categories = {
    'general': '전반적인 경험',
    'ui': '사용자 인터페이스',
    'ai': 'AI 상담 품질',
    'features': '기능 및 도구',
    'performance': '속도 및 성능',
    'export': '내보내기 기능',
  };

  const feedbackTypes = {
    'bug': { icon: '🐛', label: '버그 신고', description: '문제나 오류를 발견했어요' },
    'feature': { icon: '💡', label: '기능 제안', description: '새로운 기능을 제안해요' },
    'improvement': { icon: '✨', label: '개선 의견', description: '더 나은 방향을 제시해요' },
    'general': { icon: '💬', label: '일반 피드백', description: '자유로운 의견을 남겨요' },
  };

  const handleRatingClick = (rating: number) => {
    setFeedbackData(prev => ({ ...prev, rating }));
    
    // 평점에 따른 자동 타입 설정
    if (rating <= 2) {
      setFeedbackData(prev => ({ ...prev, type: 'bug' }));
    } else if (rating === 3) {
      setFeedbackData(prev => ({ ...prev, type: 'improvement' }));
    } else if (rating === 4) {
      setFeedbackData(prev => ({ ...prev, type: 'general' }));
    } else {
      setFeedbackData(prev => ({ ...prev, type: 'feature' }));
    }
    
    setTimeout(() => setStep('details'), 500);
  };

  const handleSubmit = async () => {
    if (!feedbackData.message.trim()) {
      toast.error('피드백 내용을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 실제 환경에서는 API 엔드포인트로 전송
      const submissionData = {
        ...feedbackData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // 로컬 스토리지에 피드백 저장 (임시)
      const existingFeedback = JSON.parse(localStorage.getItem('ai-coach-feedback') || '[]');
      existingFeedback.push(submissionData);
      localStorage.setItem('ai-coach-feedback', JSON.stringify(existingFeedback));

      // 시뮬레이션: API 호출
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('success');
      toast.success('소중한 피드백 감사합니다! 🙏');
      
      // 3초 후 자동 닫기
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('피드백 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('rating');
    setFeedbackData({
      type: 'general',
      rating: 0,
      message: '',
      email: '',
      category: '',
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* 모달 컨텐츠 */}
        <div
          className={`relative max-w-md w-full rounded-xl shadow-2xl transform transition-all duration-300 ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className={`p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {step === 'rating' && '🌟 평가해주세요'}
                {step === 'details' && '📝 세부 의견'}
                {step === 'success' && '✅ 전송 완료'}
              </h2>
              <button
                onClick={handleClose}
                className={`p-1 rounded-full transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="닫기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 컨텐츠 */}
          <div className="p-6">
            {step === 'rating' && (
              <div className="text-center space-y-6">
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  AI 학습 코치 서비스는 어떠셨나요?
                </p>
                
                {/* 별점 */}
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      className={`text-4xl transition-all duration-200 hover:scale-110 ${
                        star <= feedbackData.rating 
                          ? 'text-yellow-400' 
                          : theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  별점을 클릭하면 다음 단계로 이동합니다
                </p>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-6">
                {/* 평점 표시 */}
                <div className="text-center">
                  <div className="flex justify-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xl ${
                          star <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {feedbackData.rating}점을 주셨습니다
                  </p>
                </div>

                {/* 피드백 타입 선택 */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    피드백 유형
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(feedbackTypes).map(([type, info]) => (
                      <button
                        key={type}
                        onClick={() => setFeedbackData(prev => ({ ...prev, type: type as any }))}
                        className={`p-3 rounded-lg text-left transition-colors ${
                          feedbackData.type === type
                            ? theme === 'dark'
                              ? 'bg-blue-900/50 border-2 border-blue-600 text-blue-300'
                              : 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                            : theme === 'dark'
                              ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{info.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{info.label}</div>
                            <div className="text-xs opacity-75">{info.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 카테고리 선택 */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    분야 (선택)
                  </label>
                  <select
                    value={feedbackData.category}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full p-3 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">분야를 선택해주세요</option>
                    {Object.entries(categories).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* 메시지 입력 */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    자세한 의견 *
                  </label>
                  <textarea
                    value={feedbackData.message}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="구체적인 피드백을 남겨주세요. 어떤 부분이 좋았는지, 개선이 필요한지 알려주시면 큰 도움이 됩니다."
                    rows={4}
                    className={`w-full p-3 rounded-lg border resize-none text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* 이메일 입력 (선택) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    이메일 (선택)
                  </label>
                  <input
                    type="email"
                    value={feedbackData.email}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="답변을 받고 싶으시면 이메일을 입력해주세요"
                    className={`w-full p-3 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* 버튼들 */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('rating')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    이전
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !feedbackData.message.trim()}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      isSubmitting || !feedbackData.message.trim()
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>전송 중...</span>
                      </div>
                    ) : (
                      '전송하기'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">✅</span>
                </div>
                
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    피드백이 전송되었습니다!
                  </h3>
                  <p className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    소중한 의견 감사합니다.<br />
                    더 나은 서비스로 보답하겠습니다.
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    📧 이메일을 입력하신 경우<br />
                    영업일 기준 2-3일 내 답변드릴게요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 