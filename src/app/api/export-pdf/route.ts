import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { ChatMessage, Recommendation, UserInput } from '@/types';

interface PDFExportRequest {
  userInput: UserInput;
  messages: ChatMessage[];
  recommendations: Recommendation[];
  title?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFExportRequest = await request.json();
    const { userInput, messages, recommendations, title } = body;

    // 입력 검증
    if (!userInput || !messages || !recommendations) {
      return NextResponse.json(
        { success: false, error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // HTML 템플릿 생성
    const htmlContent = generatePDFTemplate({
      userInput,
      messages,
      recommendations,
      title: title || '학습 상담 보고서'
    });

    // Puppeteer로 PDF 생성
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // HTML 콘텐츠 설정
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // PDF 생성 옵션
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });

    await browser.close();

    // PDF를 base64로 인코딩하여 응답
    const base64PDF = Buffer.from(pdfBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      pdf: base64PDF,
      filename: `learning-consultation-${Date.now()}.pdf`
    });

  } catch (error) {
    console.error('PDF 생성 오류:', error);
    
    let errorMessage = 'PDF 생성 중 오류가 발생했습니다.';
    if (error instanceof Error) {
      if (error.message.includes('Protocol error')) {
        errorMessage = 'PDF 생성 서비스가 일시적으로 사용할 수 없습니다.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// PDF용 HTML 템플릿 생성 함수
function generatePDFTemplate({
  userInput,
  messages,
  recommendations,
  title
}: {
  userInput: UserInput;
  messages: ChatMessage[];
  recommendations: Recommendation[];
  title: string;
}): string {
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
      case 'high': return '높음';
      case 'medium': return '중간';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'resource': return '학습 자료';
      case 'activity': return '학습 활동';
      case 'strategy': return '학습 전략';
      default: return '기타';
    }
  };

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 0;
            border-bottom: 3px solid #2563eb;
        }
        
        .header h1 {
            font-size: 28px;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .header .date {
            color: #6b7280;
            font-size: 14px;
        }
        
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .user-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .info-item {
            margin-bottom: 15px;
        }
        
        .info-label {
            font-weight: bold;
            color: #374151;
            display: inline-block;
            width: 100px;
        }
        
        .info-content {
            color: #6b7280;
        }
        
        .interests {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 5px;
        }
        
        .interest-tag {
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: medium;
        }
        
        .conversation {
            margin-bottom: 30px;
        }
        
        .message {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            page-break-inside: avoid;
        }
        
        .message.user {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
        }
        
        .message.ai {
            background: #f9fafb;
            border-left: 4px solid #10b981;
        }
        
        .message-header {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .message.user .message-header {
            color: #1e40af;
        }
        
        .message.ai .message-header {
            color: #059669;
        }
        
        .message-content {
            white-space: pre-line;
            line-height: 1.8;
        }
        
        .message-time {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 8px;
        }
        
        .recommendations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .recommendation-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            background: #fff;
            page-break-inside: avoid;
        }
        
        .recommendation-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .recommendation-category {
            font-size: 12px;
            font-weight: bold;
            color: #6b7280;
            text-transform: uppercase;
        }
        
        .recommendation-priority {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: medium;
        }
        
        .priority-high {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .priority-medium {
            background: #fef3c7;
            color: #d97706;
        }
        
        .priority-low {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .recommendation-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .recommendation-description {
            color: #6b7280;
            line-height: 1.6;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
        }
        
        @media print {
            body { 
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .message {
                page-break-inside: avoid;
            }
            
            .recommendation-card {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 ${title}</h1>
        <div class="date">생성일: ${formatDate(new Date())}</div>
    </div>

    <div class="section">
        <h2 class="section-title">📋 상담 정보</h2>
        <div class="user-info">
            <div class="info-item">
                <span class="info-label">학습 목표:</span>
                <div class="info-content">${userInput.learningGoal}</div>
            </div>
            <div class="info-item">
                <span class="info-label">관심 분야:</span>
                <div class="interests">
                    ${userInput.interests.map(interest => 
                        `<span class="interest-tag">${interest}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="info-item">
                <span class="info-label">현재 고민:</span>
                <div class="info-content">${userInput.currentConcerns}</div>
            </div>
            ${userInput.learningLevel ? `
            <div class="info-item">
                <span class="info-label">학습 수준:</span>
                <div class="info-content">${userInput.learningLevel}</div>
            </div>
            ` : ''}
            ${userInput.timeAvailable ? `
            <div class="info-item">
                <span class="info-label">가용 시간:</span>
                <div class="info-content">${userInput.timeAvailable}</div>
            </div>
            ` : ''}
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">💬 상담 대화</h2>
        <div class="conversation">
            ${messages.map(message => `
                <div class="message ${message.type}">
                    <div class="message-header">
                        ${message.type === 'user' ? '👤 사용자' : '🤖 AI 학습 코치'}
                    </div>
                    <div class="message-content">${message.content}</div>
                    <div class="message-time">${formatDate(new Date(message.timestamp))}</div>
                </div>
            `).join('')}
        </div>
    </div>

    ${recommendations.length > 0 ? `
    <div class="section">
        <h2 class="section-title">💡 맞춤 추천사항</h2>
        <div class="recommendations-grid">
            ${recommendations.map(rec => `
                <div class="recommendation-card">
                    <div class="recommendation-header">
                        <div class="recommendation-category">${getCategoryText(rec.category)}</div>
                        <div class="recommendation-priority priority-${rec.priority}">
                            우선순위: ${getPriorityText(rec.priority)}
                        </div>
                    </div>
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-description">${rec.description}</div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>AI 학습 코치 - 개인 맞춤형 학습 지원 서비스</p>
        <p>본 보고서는 AI가 생성한 개인화된 학습 조언으로, 참고용으로 활용해 주세요.</p>
    </div>
</body>
</html>
  `;
} 