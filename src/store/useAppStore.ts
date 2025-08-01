import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserInput, ChatMessage, Recommendation } from '@/types';
import { SavedConversation } from '@/hooks/useChatHistory';

// 애플리케이션 상태 인터페이스
interface AppState {
  // 현재 세션 상태
  userInput: UserInput | null;
  messages: ChatMessage[];
  recommendations: Recommendation[];
  isLoading: boolean;
  showChat: boolean;
  currentView: 'chat' | 'recommendations' | 'history' | 'export';
  currentConversationId: string | null;
  
  // UI 상태
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  
  // 사용자 설정
  userSettings: {
    autoSave: boolean;
    notifications: boolean;
    emailReminders: boolean;
    preferredLanguage: 'ko' | 'en';
  };
  
  // 통계 정보
  stats: {
    totalConversations: number;
    totalMessages: number;
    totalRecommendations: number;
    lastActiveDate: string | null;
  };
}

// 액션 인터페이스
interface AppActions {
  // 세션 액션
  setUserInput: (userInput: UserInput | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;
  addRecommendations: (recommendations: Recommendation[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setShowChat: (showChat: boolean) => void;
  setCurrentView: (view: 'chat' | 'recommendations' | 'history' | 'export') => void;
  setCurrentConversationId: (id: string | null) => void;
  
  // UI 액션
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // 사용자 설정 액션
  updateUserSettings: (settings: Partial<AppState['userSettings']>) => void;
  
  // 통계 업데이트 액션
  updateStats: (stats: Partial<AppState['stats']>) => void;
  incrementConversationCount: () => void;
  incrementMessageCount: (count?: number) => void;
  incrementRecommendationCount: (count?: number) => void;
  
  // 세션 초기화
  resetSession: () => void;
  
  // 대화 로드
  loadConversation: (conversation: SavedConversation) => void;
}

// 전역 상태 스토어 타입
type AppStore = AppState & AppActions;

// 초기 상태
const initialState: AppState = {
  // 현재 세션 상태
  userInput: null,
  messages: [],
  recommendations: [],
  isLoading: false,
  showChat: false,
  currentView: 'chat',
  currentConversationId: null,
  
  // UI 상태
  sidebarCollapsed: false,
  theme: 'light',
  
  // 사용자 설정
  userSettings: {
    autoSave: true,
    notifications: true,
    emailReminders: false,
    preferredLanguage: 'ko',
  },
  
  // 통계 정보
  stats: {
    totalConversations: 0,
    totalMessages: 0,
    totalRecommendations: 0,
    lastActiveDate: null,
  },
};

// Zustand 스토어 생성
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 세션 액션 구현
      setUserInput: (userInput) => 
        set({ userInput }),
      
      setMessages: (messages) => 
        set({ messages }),
      
      addMessage: (message) => 
        set((state) => ({ 
          messages: [...state.messages, message] 
        })),
      
      setRecommendations: (recommendations) => 
        set({ recommendations }),
      
      addRecommendations: (newRecommendations) => 
        set((state) => ({ 
          recommendations: [...state.recommendations, ...newRecommendations] 
        })),
      
      setIsLoading: (isLoading) => 
        set({ isLoading }),
      
      setShowChat: (showChat) => 
        set({ showChat }),
      
      setCurrentView: (currentView) => 
        set({ currentView }),
      
      setCurrentConversationId: (currentConversationId) => 
        set({ currentConversationId }),
      
      // UI 액션 구현
      toggleSidebar: () => 
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setSidebarCollapsed: (sidebarCollapsed) => 
        set({ sidebarCollapsed }),
      
      setTheme: (theme) => 
        set({ theme }),
      
      // 사용자 설정 액션 구현
      updateUserSettings: (newSettings) => 
        set((state) => ({
          userSettings: { ...state.userSettings, ...newSettings }
        })),
      
            // 통계 업데이트 액션 구현
      updateStats: (newStats) => 
        set((state) => ({
          stats: { 
            ...state.stats, 
            ...newStats, 
            lastActiveDate: newStats.lastActiveDate || state.stats.lastActiveDate 
          }
        })),
      
      incrementConversationCount: () => 
        set((state) => ({
          stats: {
            ...state.stats,
            totalConversations: state.stats.totalConversations + 1,
            lastActiveDate: new Date().toISOString()
          }
        })),
      
      incrementMessageCount: (count = 1) => 
        set((state) => ({
          stats: {
            ...state.stats,
            totalMessages: state.stats.totalMessages + count,
            lastActiveDate: new Date().toISOString()
          }
        })),
      
      incrementRecommendationCount: (count = 1) => 
        set((state) => ({
          stats: {
            ...state.stats,
            totalRecommendations: state.stats.totalRecommendations + count,
            lastActiveDate: new Date().toISOString()
          }
        })),
      
      // 세션 초기화
      resetSession: () => 
        set({
          userInput: null,
          messages: [],
          recommendations: [],
          isLoading: false,
          showChat: false,
          currentView: 'chat',
          currentConversationId: null,
        }),
      
      // 대화 로드
      loadConversation: (conversation) => 
        set({
          userInput: conversation.userInput,
          messages: conversation.messages,
          recommendations: conversation.recommendations,
          currentConversationId: conversation.id,
          showChat: true,
          currentView: 'chat',
        }),
    }),
    {
      name: 'ai-learning-coach-storage', // 로컬 스토리지 키
      storage: createJSONStorage(() => localStorage), // 로컬 스토리지 사용
      partialize: (state) => ({
        // 지속할 상태만 선택 (세션 상태는 제외)
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        userSettings: state.userSettings,
        stats: state.stats,
      }),
    }
  )
);

// 선택적 훅들 (성능 최적화를 위한 개별 구독)
export const useUserInput = () => useAppStore((state) => state.userInput);
export const useMessages = () => useAppStore((state) => state.messages);
export const useRecommendations = () => useAppStore((state) => state.recommendations);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useCurrentView = () => useAppStore((state) => state.currentView);
export const useTheme = () => useAppStore((state) => state.theme);
export const useUserSettings = () => useAppStore((state) => state.userSettings);
export const useStats = () => useAppStore((state) => state.stats);

// 액션 훅들
export const useSessionActions = () => useAppStore((state) => ({
  setUserInput: state.setUserInput,
  setMessages: state.setMessages,
  addMessage: state.addMessage,
  setRecommendations: state.setRecommendations,
  addRecommendations: state.addRecommendations,
  setIsLoading: state.setIsLoading,
  setShowChat: state.setShowChat,
  setCurrentView: state.setCurrentView,
  setCurrentConversationId: state.setCurrentConversationId,
  resetSession: state.resetSession,
  loadConversation: state.loadConversation,
}));

export const useUIActions = () => useAppStore((state) => ({
  toggleSidebar: state.toggleSidebar,
  setSidebarCollapsed: state.setSidebarCollapsed,
  setTheme: state.setTheme,
}));

export const useStatsActions = () => useAppStore((state) => ({
  updateStats: state.updateStats,
  incrementConversationCount: state.incrementConversationCount,
  incrementMessageCount: state.incrementMessageCount,
  incrementRecommendationCount: state.incrementRecommendationCount,
})); 