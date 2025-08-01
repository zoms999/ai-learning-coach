'use client';

import { useState } from 'react';
import { UserInput, ChatMessage, Recommendation } from '@/types';

interface PDFExportProps {
  userInput: UserInput;
  messages: ChatMessage[];
  recommendations: Recommendation[];
  title?: string;
}

interface PDFExportResponse {
  success: boolean;
  pdf?: string;
  filename?: string;
  error?: string;
}

export default function PDFExport({ 
  userInput, 
  messages, 
  recommendations, 
  title = '학습 상담 보고서' 
}: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          messages,
          recommendations,
          title
        }),
      });

      const result: PDFExportResponse = await response.json();

      if (result.success && result.pdf && result.filename) {
        // Base64 PDF를 다운로드
        downloadBase64PDF(result.pdf, result.filename);
      } else {
        throw new Error(result.error || 'PDF 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      alert(`PDF 다운로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBase64PDF = (base64Data: string, filename: string) => {
    try {
      // Base64를 Blob으로 변환
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // 다운로드 링크 생성
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // 다운로드 실행
      document.body.appendChild(link);
      link.click();
      
      // 정리
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF 파일 처리 오류:', error);
      alert('PDF 파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 다운로드할 내용이 있는지 확인
  const hasContent = messages.length > 0 || recommendations.length > 0;

  if (!hasContent) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm">PDF로 내보낼 내용이 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            📄 PDF 다운로드
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            상담 내용을 PDF 파일로 저장하여 오프라인에서도 확인하세요
          </p>
        </div>
      </div>

      {/* 미리보기 정보 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-800 mb-2">포함될 내용:</h4>
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

      {/* 다운로드 버튼 */}
      <button
        onClick={handleDownloadPDF}
        disabled={isGenerating || !hasContent}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>PDF 생성 중...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>PDF 다운로드</span>
          </>
        )}
      </button>

      {/* 안내 메시지 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">PDF 다운로드 안내</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 생성된 PDF는 A4 크기로 최적화됩니다</li>
              <li>• 모든 대화 내용과 추천사항이 포함됩니다</li>
              <li>• 생성 시간은 내용에 따라 10-30초 소요됩니다</li>
              <li>• 생성된 파일은 즉시 다운로드됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 