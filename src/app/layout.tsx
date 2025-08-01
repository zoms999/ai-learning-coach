import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI 학습 코치 - 맞춤형 학습 상담 서비스',
  description: '당신의 학습 목표와 고민을 AI가 분석하여 맞춤형 학습 계획과 조언을 제공합니다.',
  keywords: ['AI', '학습', '교육', '상담', '맞춤형', '추천'],
  authors: [{ name: 'AI Learning Coach Team' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    title: 'AI 학습 코치',
    description: '맞춤형 AI 학습 상담 서비스',
    siteName: 'AI Learning Coach',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 학습 코치',
    description: '맞춤형 AI 학습 상담 서비스',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">

      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <main>
          {children}
        </main>
        
        {/* React Hot Toast */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // 기본 설정
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
            
            // 성공 토스트
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
              },
            },
            
            // 에러 토스트
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
              },
            },
            
            // 로딩 토스트
            loading: {
              style: {
                background: '#3B82F6',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#3B82F6',
              },
            },
            
            // 커스텀 토스트
            custom: {
              duration: 4000,
            },
          }}
        />

        {/* 서비스 워커 등록 스크립트 (PWA 준비) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
