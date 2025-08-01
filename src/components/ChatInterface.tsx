'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserInput, Recommendation } from '@/types';

interface ChatInterfaceProps {
  initialUserInput: UserInput;
  onNewRecommendations?: (recommendations: Recommendation[]) => void;
}

interface ApiResponse {
  success: boolean;
  message?: ChatMessage;
  recommendations?: Recommendation[];
  error?: string;
}

export default function ChatInterface({ initialUserInput, onNewRecommendations }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const onNewRecommendationsRef = useRef(onNewRecommendations);
  
  // onNewRecommendations 콜백을 항상 최신으로 유지
  useEffect(() => {
    onNewRecommendationsRef.current = onNewRecommendations;
  }, [onNewRecommendations]);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 초기 AI 응답 요청
  useEffect(() => {
    const getInitialResponse = async () => {
      setIsLoading(true);
      
      // 사용자 입력을 첫 번째 메시지로 추가
      const userMessage: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        type: 'user',
        content: `안녕하세요! 저는 다음과 같은 상황입니다:

📚 학습 목표: ${initialUserInput.learningGoal}

🎯 관심 분야: ${initialUserInput.interests.join(', ')}

😰 현재 고민: ${initialUserInput.currentConcerns}

${initialUserInput.learningLevel ? `📊 학습 수준: ${initialUserInput.learningLevel}` : ''}
${initialUserInput.timeAvailable ? `⏰ 가용 시간: ${initialUserInput.timeAvailable}` : ''}

맞춤형 학습 조언을 부탁드립니다!`,
        timestamp: new Date()
      };

      setMessages([userMessage]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInput: initialUserInput,
            conversationHistory: []
          }),
        });

        const result: ApiResponse = await response.json();

        if (result.success && result.message) {
          setMessages(prev => [...prev, result.message!]);
          if (result.recommendations && onNewRecommendationsRef.current) {
            onNewRecommendationsRef.current(result.recommendations);
          }
        } else {
          const errorMessage: ChatMessage = {
            id: `msg-error-${Date.now()}`,
            type: 'ai',
            content: `죄송합니다. 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('API 호출 오류:', error);
        const errorMessage: ChatMessage = {
          id: `msg-error-${Date.now()}`,
          type: 'ai',
          content: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialResponse();
  }, [initialUserInput]);

  // 새 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: initialUserInput,
          conversationHistory: [...messages, userMessage]
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success && result.message) {
        setMessages(prev => [...prev, result.message!]);
        if (result.recommendations && onNewRecommendationsRef.current) {
          onNewRecommendationsRef.current(result.recommendations);
        }
      } else {
        const errorMessage: ChatMessage = {
          id: `msg-error-${Date.now()}`,
          type: 'ai',
          content: `죄송합니다. 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      const errorMessage: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        type: 'ai',
        content: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]">
      {/* 채팅 헤더 */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          💬 AI 학습 코치와의 대화
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          학습과 관련된 궁금한 점을 자유롭게 물어보세요!
        </p>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {/* 메시지 헤더 */}
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium">
                  {message.type === 'user' ? '👤 나' : '🤖 AI 코치'}
                </span>
                <span className={`text-xs ml-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              {/* 메시지 내용 */}
              <div className="whitespace-pre-line leading-relaxed">
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 shadow-sm max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">AI가 답변을 생각하고 있어요...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 영역 */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="추가 질문이나 궁금한 점을 입력해주세요... (Shift+Enter로 줄바꿈)"
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
          >
            전송
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 팁: Enter로 전송, Shift+Enter로 줄바꿈
        </p>
      </div>
    </div>
  );
} 