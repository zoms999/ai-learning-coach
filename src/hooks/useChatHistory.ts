import { useState, useEffect } from 'react';
import { Conversation, ChatMessage, Recommendation, UserInput } from '@/types';

const STORAGE_KEY = 'ai-learning-coach-conversations';

export interface SavedConversation extends Conversation {
  title: string; // 대화 제목 (사용자 학습 목표의 일부)
  preview: string; // 대화 미리보기 텍스트
}

export interface UseChatHistoryReturn {
  conversations: SavedConversation[];
  saveConversation: (
    userInput: UserInput,
    messages: ChatMessage[],
    recommendations: Recommendation[]
  ) => string;
  loadConversation: (id: string) => SavedConversation | null;
  deleteConversation: (id: string) => void;
  updateConversation: (
    id: string,
    messages: ChatMessage[],
    recommendations: Recommendation[]
  ) => void;
  searchConversations: (query: string) => SavedConversation[];
  clearAllConversations: () => void;
}

export function useChatHistory(): UseChatHistoryReturn {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);

  // 로컬 스토리지에서 대화 목록 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Date 객체 복원
        const restoredConversations = parsed.map((conv: SavedConversation) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(restoredConversations);
      }
    } catch (error) {
      console.error('대화 히스토리 로드 실패:', error);
      setConversations([]);
    }
  }, []);

  // 로컬 스토리지에 대화 목록 저장
  const saveToStorage = (updatedConversations: SavedConversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
      setConversations(updatedConversations);
    } catch (error) {
      console.error('대화 히스토리 저장 실패:', error);
    }
  };

  // 새 대화 저장
  const saveConversation = (
    userInput: UserInput,
    messages: ChatMessage[],
    recommendations: Recommendation[]
  ): string => {
    const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    // 제목 생성 (학습 목표의 첫 30자)
    const title = userInput.learningGoal.length > 30 
      ? `${userInput.learningGoal.slice(0, 30)}...`
      : userInput.learningGoal;
    
    // 미리보기 생성 (첫 번째 AI 응답의 일부)
    const aiMessage = messages.find(msg => msg.type === 'ai');
    const preview = aiMessage 
      ? aiMessage.content.length > 100
        ? `${aiMessage.content.slice(0, 100)}...`
        : aiMessage.content
      : '새로운 상담 내용';

    const newConversation: SavedConversation = {
      id,
      title,
      preview,
      createdAt: now,
      updatedAt: now,
      messages,
      recommendations,
      userInput
    };

    const updatedConversations = [newConversation, ...conversations];
    saveToStorage(updatedConversations);
    
    return id;
  };

  // 대화 불러오기
  const loadConversation = (id: string): SavedConversation | null => {
    return conversations.find(conv => conv.id === id) || null;
  };

  // 대화 삭제
  const deleteConversation = (id: string): void => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    saveToStorage(updatedConversations);
  };

  // 기존 대화 업데이트 (메시지나 추천사항이 추가된 경우)
  const updateConversation = (
    id: string,
    messages: ChatMessage[],
    recommendations: Recommendation[]
  ): void => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === id) {
        // 미리보기 업데이트
        const aiMessage = messages.find(msg => msg.type === 'ai');
        const preview = aiMessage 
          ? aiMessage.content.length > 100
            ? `${aiMessage.content.slice(0, 100)}...`
            : aiMessage.content
          : conv.preview;

        return {
          ...conv,
          messages,
          recommendations,
          preview,
          updatedAt: new Date()
        };
      }
      return conv;
    });
    saveToStorage(updatedConversations);
  };

  // 대화 검색
  const searchConversations = (query: string): SavedConversation[] => {
    if (!query.trim()) return conversations;
    
    const lowercaseQuery = query.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(lowercaseQuery) ||
      conv.preview.toLowerCase().includes(lowercaseQuery) ||
      conv.userInput.learningGoal.toLowerCase().includes(lowercaseQuery) ||
      conv.userInput.interests.some(interest => 
        interest.toLowerCase().includes(lowercaseQuery)
      ) ||
      conv.messages.some(msg => 
        msg.content.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  // 모든 대화 삭제
  const clearAllConversations = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    setConversations([]);
  };

  return {
    conversations,
    saveConversation,
    loadConversation,
    deleteConversation,
    updateConversation,
    searchConversations,
    clearAllConversations
  };
} 