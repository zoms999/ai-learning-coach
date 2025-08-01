'use client';

import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { UserInput, InputFormProps } from '@/types';

const INTEREST_OPTIONS = [
  '프로그래밍',
  '데이터 사이언스',
  '디자인',
  '마케팅',
  '비즈니스',
  '언어 학습',
  '수학',
  '과학',
  '예술',
  '음악',
  '기타'
];

const LEARNING_LEVELS = [
  { value: 'beginner', label: '초급 (처음 시작)' },
  { value: 'intermediate', label: '중급 (기본기 보유)' },
  { value: 'advanced', label: '고급 (전문적 수준)' }
];

const TIME_OPTIONS = [
  { value: '1-2시간/일', label: '1-2시간/일' },
  { value: '3-4시간/일', label: '3-4시간/일' },
  { value: '5시간이상/일', label: '5시간 이상/일' },
  { value: '주말만', label: '주말만' },
  { value: '불규칙적', label: '불규칙적' }
];

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<UserInput>({
    defaultValues: {
      learningGoal: '',
      interests: [],
      currentConcerns: '',
      learningLevel: '',
      timeAvailable: '',
      email: ''
    }
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleFormSubmit = (data: UserInput) => {
    const formData = {
      ...data,
      interests: selectedInterests
    };
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        AI 학습 코치 상담 신청
      </h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 학습 목표 */}
        <div>
          <label htmlFor="learningGoal" className="block text-sm font-medium text-gray-700 mb-2">
            학습 목표 <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('learningGoal', {
              required: '학습 목표를 입력해주세요.',
              minLength: {
                value: 10,
                message: '학습 목표는 10자 이상 입력해주세요.'
              }
            })}
            id="learningGoal"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: 3개월 내에 React로 웹 애플리케이션을 개발할 수 있게 되고 싶습니다."
            disabled={isLoading}
          />
          {errors.learningGoal && (
            <p className="mt-1 text-sm text-red-600">{errors.learningGoal.message}</p>
          )}
        </div>

        {/* 관심 분야 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            관심 분야 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                disabled={isLoading}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedInterests.includes(interest)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {interest}
              </button>
            ))}
          </div>
          {selectedInterests.length === 0 && (
            <p className="mt-1 text-sm text-red-600">최소 하나의 관심 분야를 선택해주세요.</p>
          )}
        </div>

        {/* 현재 고민 */}
        <div>
          <label htmlFor="currentConcerns" className="block text-sm font-medium text-gray-700 mb-2">
            현재 고민 및 어려움 <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('currentConcerns', {
              required: '현재 고민을 입력해주세요.',
              minLength: {
                value: 10,
                message: '고민 내용은 10자 이상 입력해주세요.'
              }
            })}
            id="currentConcerns"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: 프로그래밍을 배우고 싶지만 어디서부터 시작해야 할지 모르겠고, 혼자 공부하다 보니 막히는 부분이 많아서 포기하고 싶어집니다."
            disabled={isLoading}
          />
          {errors.currentConcerns && (
            <p className="mt-1 text-sm text-red-600">{errors.currentConcerns.message}</p>
          )}
        </div>

        {/* 학습 수준 (선택사항) */}
        <div>
          <label htmlFor="learningLevel" className="block text-sm font-medium text-gray-700 mb-2">
            현재 학습 수준 (선택사항)
          </label>
          <select
            {...register('learningLevel')}
            id="learningLevel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">선택해주세요</option>
            {LEARNING_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* 가용 시간 (선택사항) */}
        <div>
          <label htmlFor="timeAvailable" className="block text-sm font-medium text-gray-700 mb-2">
            학습 가능 시간 (선택사항)
          </label>
          <select
            {...register('timeAvailable')}
            id="timeAvailable"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">선택해주세요</option>
            {TIME_OPTIONS.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
        </div>

        {/* 이메일 (선택사항) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            이메일 주소 (선택사항)
          </label>
          <input
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '올바른 이메일 형식을 입력해주세요.'
              }
            })}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="example@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            입력하시면 AI 피드백을 이메일로도 받아보실 수 있습니다.
          </p>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading || selectedInterests.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              AI 분석 중...
            </div>
          ) : (
            'AI 학습 코치 상담 받기'
          )}
        </button>
      </form>
    </div>
  );
} 