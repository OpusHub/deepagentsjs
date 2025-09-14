// Padronização de respostas da API

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export function createResponse<T>(
  data: T,
  message: string = 'Operação realizada com sucesso'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0'
    }
  };
}

export function createErrorResponse(
  message: string,
  code: string = 'UNKNOWN_ERROR',
  details?: any
): ApiResponse {
  return {
    success: false,
    message: 'Erro na operação',
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0'
    }
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Tipos específicos para responses da Copy Creator API

export interface GenerateCopyResponse {
  executionTime: number;
  clientName: string;
  region: string;
  service: string;
  status: 'completed' | 'failed' | 'partial';
  copies: {
    copy1: CopyResult;
    copy2: CopyResult;
    copy3: CopyResult;
  };
  analysis: {
    marketResearch: string;
    hookStrategy: string;
    qualityAudit: string;
  };
}

export interface CopyResult {
  content: string;
  strategy: 'urgency' | 'authority' | 'benefit';
  score: number;
  hook: string;
  duration: string; // "30-40 segundos"
}

export interface RefineCopyResponse {
  executionTime: number;
  copyNumber: 1 | 2 | 3;
  feedback: string;
  status: 'refined' | 'failed';
  refinedCopy: {
    content: string;
    score: number;
    improvements: string[];
    comparison: {
      previousScore: number;
      newScore: number;
      improvementPercentage: number;
    };
  };
  analysis: {
    marketResearchUpdate: string;
    newHookStrategy: string;
    qualityAudit: string;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    agent: 'up' | 'down';
    tavily: 'up' | 'down';
    anthropic: 'up' | 'down';
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
  };
}