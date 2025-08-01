'use client';

import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { UserInput, ChatMessage, Recommendation } from '@/types';

interface EmailExportProps {
  userInput: UserInput;
  messages: ChatMessage[];
  recommendations: Recommendation[];
  title?: string;
}

interface EmailFormData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  message: string;
}

export default function EmailExport({ 
  userInput, 
  messages, 
  recommendations, 
  title = '학습 상담 보고서' 
}: EmailExportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<EmailFormData>({
    recipientEmail: userInput.email || '',
    recipientName: '',
    senderName: 'AI 학습 코치',
    message: '안녕하세요! AI 학습 코치가 생성한 맞춤형 학습 상담 보고서를 보내드립니다.'
  });

  // 다운로드할 내용이 있는지 확인
  const hasContent = messages.length > 0 || recommendations.length > 0;

  // 이메일 내용 생성
  const generateEmailContent = () => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const getPriorityText = (priority: string) => {
      switch (priority) {
        case 'high': return '🔴 높음';
        case 'medium': return '🟡 중간';
        case 'low': return '🟢 낮음';
        default: return '⚪ 보통';
      }
    };

    const getCategoryText = (category: string) => {
      switch (category) {
        case 'resource': return '📚 학습 자료';
        case 'activity': return '🎯 학습 활동';
        case 'strategy': return '🧠 학습 전략';
        default: return '📝 기타';
      }
    };

    let content = `
${title}
생성일: ${formatDate(new Date())}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 상담 정보
• 학습 목표: ${userInput.learningGoal}
• 관심 분야: ${userInput.interests.join(', ')}
• 현재 고민: ${userInput.currentConcerns}`;

    if (userInput.learningLevel) {
      content += `\n• 학습 수준: ${userInput.learningLevel}`;
    }
    if (userInput.timeAvailable) {
      content += `\n• 가용 시간: ${userInput.timeAvailable}`;
    }

    content += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n💬 상담 대화 (총 ${messages.length}개)`;

    messages.forEach((message, index) => {
      const speaker = message.type === 'user' ? '👤 사용자' : '🤖 AI 학습 코치';
      const time = formatDate(new Date(message.timestamp));
      content += `\n\n${index + 1}. ${speaker} | ${time}\n${message.content}`;
    });

    if (recommendations.length > 0) {
      content += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n💡 맞춤 추천사항 (총 ${recommendations.length}개)`;

      recommendations.forEach((rec, index) => {
        content += `\n\n${index + 1}. ${rec.title}
   카테고리: ${getCategoryText(rec.category)}
   우선순위: ${getPriorityText(rec.priority)}
   설명: ${rec.description}`;
      });
    }

    content += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🤖 AI 학습 코치 - 개인 맞춤형 학습 지원 서비스
본 보고서는 AI가 생성한 개인화된 학습 조언으로, 참고용으로 활용해 주세요.
더 자세한 상담이 필요하시면 언제든지 다시 방문해 주세요!`;

    return content;
  };

  const handleSendEmail = async () => {
    setIsLoading(true);

    try {
      // EmailJS 서비스 설정 (실제 환경에서는 환경 변수 사용)
      const serviceID = 'service_ai_coach'; // EmailJS 서비스 ID
      const templateID = 'template_learning_report'; // EmailJS 템플릿 ID
      const publicKey = 'your_emailjs_public_key'; // EmailJS 공개 키

      // 이메일 템플릿 매개변수
      const templateParams = {
        to_email: formData.recipientEmail,
        to_name: formData.recipientName || '학습자',
        from_name: formData.senderName,
        subject: `${title} - ${formatDate(new Date())}`,
        message: formData.message,
        report_content: generateEmailContent(),
        user_goal: userInput.learningGoal,
        user_interests: userInput.interests.join(', '),
        message_count: messages.length,
        recommendation_count: recommendations.length,
        high_priority_count: recommendations.filter(r => r.priority === 'high').length
      };

      // EmailJS를 통한 이메일 전송
      await emailjs.send(serviceID, templateID, templateParams, publicKey);

      setIsSent(true);
      setShowForm(false);
      
      // 3초 후 성공 상태 초기화
      setTimeout(() => {
        setIsSent(false);
      }, 3000);

    } catch (error) {
      console.error('이메일 전송 오류:', error);
      alert(`이메일 전송 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmailFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.recipientEmail && formData.recipientEmail.includes('@');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!hasContent) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">이메일로 보낼 내용이 없습니다</span>
        </div>
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="bg-green-500 rounded-full p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">이메일 전송 완료!</h3>
            <p className="text-green-700 text-sm mt-1">
              {formData.recipientEmail}로 학습 상담 보고서가 전송되었습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            ✉️ 이메일 전송
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            상담 내용을 이메일로 전송하여 언제든지 확인하세요
          </p>
        </div>
      </div>

      {!showForm ? (
        <>
          {/* 미리보기 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-800 mb-2">전송될 내용:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-600">상담 정보</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-600">대화 내용 ({messages.length}개)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-600">추천사항 ({recommendations.length}개)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-600">생성 날짜/시간</span>
              </div>
            </div>
          </div>

          {/* 이메일 전송 버튼 */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>이메일 전송하기</span>
          </button>

          {/* 안내 메시지 */}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">EmailJS 서비스 안내</p>
                <ul className="space-y-1 text-amber-700">
                  <li>• 이메일 전송을 위해 EmailJS 서비스를 사용합니다</li>
                  <li>• 전송된 이메일은 텍스트 형식으로 제공됩니다</li>
                  <li>• 개인정보는 전송 목적으로만 사용됩니다</li>
                  <li>• 전송 실패 시 다시 시도해 주세요</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 이메일 전송 폼 */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 사람 이메일 *
            </label>
            <input
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
              placeholder="example@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 사람 이름 (선택)
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => handleInputChange('recipientName', e.target.value)}
              placeholder="홍길동"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              보내는 사람
            </label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => handleInputChange('senderName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email-message" className="block text-sm font-medium text-gray-700 mb-2">
              메시지
            </label>
            <textarea
              id="email-message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="함께 전송할 메시지를 입력하세요..."
            />
          </div>

          {/* 폼 액션 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSendEmail}
              disabled={isLoading || !isFormValid}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>전송 중...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>전송</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 