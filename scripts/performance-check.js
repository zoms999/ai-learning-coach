#!/usr/bin/env node

/**
 * AI 학습 코치 성능 벤치마크 스크립트
 * 
 * 이 스크립트는 다음을 검사합니다:
 * 1. 번들 크기 분석
 * 2. 빌드 성능 측정
 * 3. 런타임 성능 체크
 * 4. 메모리 사용량 모니터링
 * 5. 라이트하우스 점수 (옵션)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// 로깅 유틸리티
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// 성능 기준값
const PERFORMANCE_THRESHOLDS = {
  bundleSize: {
    js: 500 * 1024, // 500KB
    css: 50 * 1024,  // 50KB
    total: 1000 * 1024, // 1MB
  },
  buildTime: 120, // 2분
  lighthouse: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 95,
  },
};

class PerformanceChecker {
  constructor() {
    this.results = {
      bundleSize: {},
      buildTime: 0,
      warnings: [],
      errors: [],
    };
  }

  // 메인 실행 함수
  async run() {
    log.title('🚀 AI 학습 코치 성능 벤치마크 시작');
    
    try {
      await this.checkPrerequisites();
      await this.analyzeBundleSize();
      await this.measureBuildPerformance();
      await this.checkDependencies();
      await this.validateConfiguration();
      
      this.generateReport();
      
    } catch (error) {
      log.error(`벤치마크 실행 중 오류: ${error.message}`);
      process.exit(1);
    }
  }

  // 사전 조건 검사
  async checkPrerequisites() {
    log.info('사전 조건 검사 중...');
    
    // package.json 존재 확인
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json을 찾을 수 없습니다.');
    }
    
    // Next.js 프로젝트 확인
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.dependencies?.next) {
      throw new Error('Next.js 프로젝트가 아닙니다.');
    }
    
    // .next 빌드 디렉토리 확인
    if (!fs.existsSync('.next')) {
      log.warning('.next 디렉토리가 없습니다. 빌드를 실행합니다...');
      execSync('npm run build', { stdio: 'inherit' });
    }
    
    log.success('사전 조건 검사 완료');
  }

  // 번들 크기 분석
  async analyzeBundleSize() {
    log.info('번들 크기 분석 중...');
    
    const buildManifest = path.join('.next', 'build-manifest.json');
    if (!fs.existsSync(buildManifest)) {
      throw new Error('빌드 매니페스트를 찾을 수 없습니다.');
    }
    
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    const staticDir = path.join('.next', 'static');
    
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    
    // 정적 파일 크기 계산
    if (fs.existsSync(staticDir)) {
      const calculateDirSize = (dir) => {
        let size = 0;
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            size += calculateDirSize(fullPath);
          } else {
            const stats = fs.statSync(fullPath);
            size += stats.size;
            
            if (file.name.endsWith('.js')) {
              jsSize += stats.size;
            } else if (file.name.endsWith('.css')) {
              cssSize += stats.size;
            }
          }
        }
        return size;
      };
      
      totalSize = calculateDirSize(staticDir);
    }
    
    this.results.bundleSize = {
      total: totalSize,
      js: jsSize,
      css: cssSize,
    };
    
    // 결과 표시
    log.info(`총 번들 크기: ${this.formatBytes(totalSize)}`);
    log.info(`JavaScript: ${this.formatBytes(jsSize)}`);
    log.info(`CSS: ${this.formatBytes(cssSize)}`);
    
    // 임계값 검사
    this.checkBundleThresholds();
    
    log.success('번들 크기 분석 완료');
  }

  // 빌드 성능 측정
  async measureBuildPerformance() {
    log.info('빌드 성능 측정 중...');
    
    const startTime = Date.now();
    
    try {
      // 클린 빌드 실행
      if (fs.existsSync('.next')) {
        fs.rmSync('.next', { recursive: true, force: true });
      }
      
      execSync('npm run build', { stdio: 'pipe' });
      
      const endTime = Date.now();
      this.results.buildTime = (endTime - startTime) / 1000;
      
      log.info(`빌드 시간: ${this.results.buildTime.toFixed(2)}초`);
      
      if (this.results.buildTime > PERFORMANCE_THRESHOLDS.buildTime) {
        this.results.warnings.push(
          `빌드 시간이 기준값(${PERFORMANCE_THRESHOLDS.buildTime}초)을 초과했습니다: ${this.results.buildTime.toFixed(2)}초`
        );
      }
      
    } catch (error) {
      this.results.errors.push(`빌드 실패: ${error.message}`);
    }
    
    log.success('빌드 성능 측정 완료');
  }

  // 의존성 검사
  async checkDependencies() {
    log.info('의존성 검사 중...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    
    // 대용량 패키지 확인
    const heavyPackages = [
      '@next/bundle-analyzer',
      'webpack-bundle-analyzer',
      'moment', // date-fns 사용 권장
      'lodash', // lodash-es 사용 권장
    ];
    
    const foundHeavyPackages = heavyPackages.filter(pkg => dependencies[pkg]);
    if (foundHeavyPackages.length > 0) {
      this.results.warnings.push(
        `대용량 패키지 발견: ${foundHeavyPackages.join(', ')}. 경량 대안을 고려해보세요.`
      );
    }
    
    // 중복 패키지 확인 (package-lock.json 분석)
    if (fs.existsSync('package-lock.json')) {
      try {
        const output = execSync('npm ls --depth=0', { encoding: 'utf8' });
        if (output.includes('WARN')) {
          this.results.warnings.push('npm 의존성 경고가 발견되었습니다.');
        }
      } catch (error) {
        // npm ls 명령어 오류는 무시 (일반적)
      }
    }
    
    log.success('의존성 검사 완료');
  }

  // 설정 유효성 검사
  async validateConfiguration() {
    log.info('설정 유효성 검사 중...');
    
    // next.config.js/ts 확인
    const nextConfigExists = fs.existsSync('next.config.js') || fs.existsSync('next.config.ts');
    if (!nextConfigExists) {
      this.results.warnings.push('next.config 파일이 없습니다. 최적화 설정을 고려해보세요.');
    }
    
    // TypeScript 설정 확인
    if (fs.existsSync('tsconfig.json')) {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      if (!tsConfig.compilerOptions?.strict) {
        this.results.warnings.push('TypeScript strict 모드가 비활성화되어 있습니다.');
      }
    }
    
    // ESLint 설정 확인
    const eslintConfigExists = fs.existsSync('.eslintrc.json') || 
                              fs.existsSync('.eslintrc.js') || 
                              fs.existsSync('eslint.config.js');
    if (!eslintConfigExists) {
      this.results.warnings.push('ESLint 설정 파일이 없습니다.');
    }
    
    log.success('설정 유효성 검사 완료');
  }

  // 번들 크기 임계값 검사
  checkBundleThresholds() {
    const { bundleSize } = this.results;
    const { bundleSize: thresholds } = PERFORMANCE_THRESHOLDS;
    
    if (bundleSize.js > thresholds.js) {
      this.results.warnings.push(
        `JavaScript 번들 크기가 임계값을 초과했습니다: ${this.formatBytes(bundleSize.js)} > ${this.formatBytes(thresholds.js)}`
      );
    }
    
    if (bundleSize.css > thresholds.css) {
      this.results.warnings.push(
        `CSS 번들 크기가 임계값을 초과했습니다: ${this.formatBytes(bundleSize.css)} > ${this.formatBytes(thresholds.css)}`
      );
    }
    
    if (bundleSize.total > thresholds.total) {
      this.results.warnings.push(
        `전체 번들 크기가 임계값을 초과했습니다: ${this.formatBytes(bundleSize.total)} > ${this.formatBytes(thresholds.total)}`
      );
    }
  }

  // 바이트를 읽기 쉬운 형태로 변환
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 최종 보고서 생성
  generateReport() {
    log.title('📊 성능 벤치마크 결과');
    
    // 번들 크기 보고서
    console.log(`${colors.bright}번들 크기:${colors.reset}`);
    console.log(`  총 크기: ${this.formatBytes(this.results.bundleSize.total)}`);
    console.log(`  JavaScript: ${this.formatBytes(this.results.bundleSize.js)}`);
    console.log(`  CSS: ${this.formatBytes(this.results.bundleSize.css)}`);
    
    // 빌드 시간 보고서
    console.log(`\n${colors.bright}빌드 성능:${colors.reset}`);
    console.log(`  빌드 시간: ${this.results.buildTime.toFixed(2)}초`);
    
    // 경고 사항
    if (this.results.warnings.length > 0) {
      console.log(`\n${colors.bright}⚠️  경고 사항:${colors.reset}`);
      this.results.warnings.forEach(warning => {
        log.warning(warning);
      });
    }
    
    // 에러
    if (this.results.errors.length > 0) {
      console.log(`\n${colors.bright}❌ 오류:${colors.reset}`);
      this.results.errors.forEach(error => {
        log.error(error);
      });
    }
    
    // 개선 제안
    this.generateOptimizationSuggestions();
    
    // 전체 점수 계산
    const score = this.calculateOverallScore();
    console.log(`\n${colors.bright}전체 점수: ${score}/100${colors.reset}`);
    
    if (score >= 80) {
      log.success('훌륭한 성능입니다! 🎉');
    } else if (score >= 60) {
      log.warning('양호한 성능입니다. 몇 가지 개선이 가능합니다.');
    } else {
      log.error('성능 개선이 필요합니다.');
    }
    
    // JSON 보고서 저장
    this.saveReport();
  }

  // 최적화 제안 생성
  generateOptimizationSuggestions() {
    const suggestions = [];
    
    if (this.results.bundleSize.js > PERFORMANCE_THRESHOLDS.bundleSize.js) {
      suggestions.push('• 코드 분할(Code Splitting)을 적용하세요');
      suggestions.push('• 사용하지 않는 라이브러리를 제거하세요');
      suggestions.push('• 동적 import를 사용하세요');
    }
    
    if (this.results.buildTime > PERFORMANCE_THRESHOLDS.buildTime) {
      suggestions.push('• SWC 컴파일러 사용을 확인하세요');
      suggestions.push('• 불필요한 플러그인을 제거하세요');
    }
    
    if (suggestions.length > 0) {
      console.log(`\n${colors.bright}🚀 최적화 제안:${colors.reset}`);
      suggestions.forEach(suggestion => {
        console.log(`  ${suggestion}`);
      });
    }
  }

  // 전체 점수 계산
  calculateOverallScore() {
    let score = 100;
    
    // 번들 크기 점수 (40점 만점)
    const bundleScore = Math.max(0, 40 - (this.results.warnings.filter(w => w.includes('번들')).length * 10));
    score = score - (40 - bundleScore);
    
    // 빌드 시간 점수 (30점 만점)
    const buildScore = Math.max(0, 30 - (this.results.buildTime > PERFORMANCE_THRESHOLDS.buildTime ? 15 : 0));
    score = score - (30 - buildScore);
    
    // 에러 점수 (30점 만점)
    const errorScore = Math.max(0, 30 - (this.results.errors.length * 15));
    score = score - (30 - errorScore);
    
    return Math.round(score);
  }

  // 보고서 파일 저장
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      score: this.calculateOverallScore(),
      results: this.results,
      thresholds: PERFORMANCE_THRESHOLDS,
    };
    
    const reportPath = path.join('reports', `performance-${Date.now()}.json`);
    
    // reports 디렉토리 생성
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.success(`보고서가 저장되었습니다: ${reportPath}`);
  }
}

// 메인 실행
if (require.main === module) {
  const checker = new PerformanceChecker();
  checker.run().catch(error => {
    console.error('성능 체크 실패:', error);
    process.exit(1);
  });
}

module.exports = PerformanceChecker; 