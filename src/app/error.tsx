'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    // 에러 로깅 (실제 운영에서는 로그 서비스로 전송)
    console.error('Application Error:', error);
    
    // 에러 정보를 로컬 스토리지에 저장 (디버깅용)
    try {
      const errorInfo = {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      const existingErrors = JSON.parse(localStorage.getItem('ai-coach-errors') || '[]');
      existingErrors.push(errorInfo);
      
      // 최대 10개의 에러만 보관
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('ai-coach-errors', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.error('Failed to save error to localStorage:', storageError);
    }
  }, [error]);

  const handleReportError = () => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // 이메일 링크로 에러 리포트 생성
    const subject = encodeURIComponent('AI 학습 코치 에러 리포트');
    const body = encodeURIComponent(`
에러가 발생했습니다:

메시지: ${error.message}
시간: ${new Date().toLocaleString('ko-KR')}
URL: ${window.location.href}
브라우저: ${navigator.userAgent}

스택 트레이스:
${error.stack}

추가 정보:
${error.digest ? `Digest: ${error.digest}` : ''}
    `);

    window.open(`mailto:support@ai-learning-coach.com?subject=${subject}&body=${body}`);
  };

  const handleGoHome = () => {
    // 홈으로 이동하면서 상태 초기화
    window.location.href = '/';
  };

  const getErrorCategory = (error: Error) => {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        icon: '🌐',
        title: '네트워크 오류',
        description: '인터넷 연결을 확인하고 다시 시도해주세요.',
        suggestions: [
          '인터넷 연결 상태를 확인해주세요',
          '브라우저를 새로고침해주세요',
          '잠시 후 다시 시도해주세요'
        ]
      };
    } else if (error.message.includes('localStorage') || error.message.includes('storage')) {
      return {
        icon: '💾',
        title: '저장소 오류',
        description: '브라우저 저장소에 문제가 발생했습니다.',
        suggestions: [
          '브라우저 캐시를 정리해주세요',
          '시크릿 모드에서 시도해주세요',
          '다른 브라우저를 사용해보세요'
        ]
      };
    } else if (error.message.includes('API') || error.message.includes('Gemini')) {
      return {
        icon: '🤖',
        title: 'AI 서비스 오류',
        description: 'AI 서비스에 일시적인 문제가 발생했습니다.',
        suggestions: [
          'API 키 설정을 확인해주세요',
          '잠시 후 다시 시도해주세요',
          '관리자에게 문의해주세요'
        ]
      };
    } else {
      return {
        icon: '⚠️',
        title: '예상치 못한 오류',
        description: '알 수 없는 오류가 발생했습니다.',
        suggestions: [
          '페이지를 새로고침해주세요',
          '브라우저를 재시작해주세요',
          '문제가 지속되면 지원팀에 문의해주세요'
        ]
      };
    }
  };

  const errorInfo = getErrorCategory(error);

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-blue-900' 
        : 'bg-gradient-to-br from-red-50 to-orange-100'
    }`}>
      <div className={`max-w-lg w-full rounded-lg shadow-xl p-8 text-center ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-red-100'
      }`}>
        {/* 에러 아이콘 */}
        <div className="mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'dark' ? 'bg-red-900/20' : 'bg-red-100'
          }`}>
            <span className="text-4xl">{errorInfo.icon}</span>
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {errorInfo.title}
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {errorInfo.description}
          </p>
        </div>

        {/* 에러 메시지 */}
        <div className={`rounded-lg p-4 mb-6 text-left ${
          theme === 'dark' ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            기술적 세부사항:
          </h3>
          <p className={`text-sm font-mono break-all ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error.message}
          </p>
          {error.digest && (
            <p className={`text-xs mt-2 opacity-75 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              오류 ID: {error.digest}
            </p>
          )}
        </div>

        {/* 해결 방법 제안 */}
        <div className={`rounded-lg p-4 mb-6 text-left ${
          theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-3 ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`}>
            💡 해결 방법:
          </h3>
          <ul className="space-y-2">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className={`text-sm flex items-start ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <span className="text-blue-500 mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            <button
              onClick={reset}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              🔄 다시 시도
            </button>
            <button
              onClick={handleGoHome}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              🏠 홈으로
            </button>
          </div>
          
          <button
            onClick={handleReportError}
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            📧 오류 신고하기
          </button>
        </div>

        {/* 추가 도움말 */}
        <div className={`mt-6 pt-6 border-t text-sm ${
          theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
        }`}>
          <p className="mb-2">
            문제가 지속되면 다음을 시도해보세요:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <button
              onClick={() => window.location.reload()}
              className={`underline hover:no-underline ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              새로고침
            </button>
            <button
              onClick={() => localStorage.clear()}
              className={`underline hover:no-underline ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              캐시 정리
            </button>
            <a
              href="https://support.ai-learning-coach.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`underline hover:no-underline ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              고객지원
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 