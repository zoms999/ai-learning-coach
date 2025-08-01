import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { UserInput, ChatMessage, Recommendation } from '@/types';

// Gemini API 초기화
// .env.local 파일에 GEMINI_API_KEY=your_api_key_here 를 추가해주세요
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ChatRequest {
  userInput: UserInput;
  conversationHistory?: ChatMessage[];
}

interface ChatResponse {
  success: boolean;
  message: ChatMessage;
  recommendations: Recommendation[];
  error?: string;
}

// 학습 코칭을 위한 시스템 프롬프트
const SYSTEM_PROMPT = `
당신은 전문적인 AI 학습 코치입니다. 사용자의 학습 목표, 관심 분야, 현재 고민을 바탕으로 맞춤형 학습 조언을 제공해주세요.

응답 형식:
1. 먼저 사용자의 상황에 대한 공감과 격려를 표현해주세요.
2. 구체적이고 실행 가능한 학습 계획을 제시해주세요.
3. 단계별 학습 방법을 제안해주세요.
4. 추천 자료나 활동을 제시해주세요.

응답은 따뜻하고 격려하는 톤으로 작성하되, 구체적이고 실용적인 조언을 포함해주세요.
한국어로 답변해주세요.
`;

// 추천사항을 파싱하는 함수
function parseRecommendations(aiResponse: string): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // AI 응답에서 추천사항을 추출하는 간단한 로직
  // 실제로는 더 정교한 파싱이 필요할 수 있습니다
  const lines = aiResponse.split('\n');
  let recommendationCounter = 1;
  
  for (const line of lines) {
    if (line.includes('추천') || line.includes('제안') || line.includes('활용')) {
      const title = line.substring(0, 50).trim();
      if (title.length > 10) {
        recommendations.push({
          id: `rec-${recommendationCounter}`,
          title: title.replace(/[•\-*]/g, '').trim(),
          description: line.trim(),
          category: Math.random() > 0.6 ? 'resource' : Math.random() > 0.5 ? 'activity' : 'strategy',
          priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
        });
        recommendationCounter++;
      }
    }
  }
  
  // 최소 3개의 추천사항 보장
  if (recommendations.length < 3) {
    recommendations.push(
      {
        id: 'rec-default-1',
        title: '매일 30분 꾸준한 학습',
        description: '매일 일정한 시간에 30분씩 학습하는 습관을 만들어보세요.',
        category: 'strategy',
        priority: 'high'
      },
      {
        id: 'rec-default-2',
        title: '학습 일지 작성',
        description: '배운 내용과 어려웠던 점을 기록하여 성장을 추적해보세요.',
        category: 'activity',
        priority: 'medium'
      },
      {
        id: 'rec-default-3',
        title: '온라인 커뮤니티 참여',
        description: '같은 분야를 학습하는 사람들과 정보를 공유하고 동기부여를 받아보세요.',
        category: 'resource',
        priority: 'medium'
      }
    );
  }
  
  return recommendations.slice(0, 5); // 최대 5개까지
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { userInput, conversationHistory = [] } = body;

    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API 키가 설정되지 않았습니다. .env.local 파일에 GEMINI_API_KEY를 추가해주세요.'
        },
        { status: 500 }
      );
    }

    // 사용자 입력 검증
    if (!userInput.learningGoal || !userInput.currentConcerns || userInput.interests.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력 항목이 누락되었습니다.'
        },
        { status: 400 }
      );
    }

    // Gemini 모델 초기화
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 프롬프트 구성
    const userPrompt = `
사용자 정보:
- 학습 목표: ${userInput.learningGoal}
- 관심 분야: ${userInput.interests.join(', ')}
- 현재 고민: ${userInput.currentConcerns}
${userInput.learningLevel ? `- 학습 수준: ${userInput.learningLevel}` : ''}
${userInput.timeAvailable ? `- 가용 시간: ${userInput.timeAvailable}` : ''}

이 정보를 바탕으로 개인화된 학습 조언을 해주세요.
`;

    // 대화 히스토리가 있으면 포함
    let fullPrompt = SYSTEM_PROMPT + '\n\n' + userPrompt;
    
    if (conversationHistory.length > 0) {
      fullPrompt += '\n\n이전 대화 내용:\n';
      conversationHistory.forEach((msg) => {
        fullPrompt += `${msg.type === 'user' ? '사용자' : 'AI 코치'}: ${msg.content}\n`;
      });
      fullPrompt += '\n이전 대화를 참고하여 추가 조언을 해주세요.';
    }

    // Gemini API 호출
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    if (!aiResponse) {
      throw new Error('AI로부터 응답을 받지 못했습니다.');
    }

    // 응답 메시지 생성
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };

    // 추천사항 파싱
    const recommendations = parseRecommendations(aiResponse);

    const chatResponse: ChatResponse = {
      success: true,
      message,
      recommendations
    };

    return NextResponse.json(chatResponse);

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // 에러 타입에 따른 다른 응답
    let errorMessage = '알 수 없는 오류가 발생했습니다.';
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        errorMessage = 'API 키가 유효하지 않습니다.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API 사용 한도를 초과했습니다.';
      } else if (error.message.includes('network')) {
        errorMessage = '네트워크 연결에 문제가 있습니다.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 