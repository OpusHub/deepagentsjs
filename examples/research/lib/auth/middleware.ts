import { NextRequest } from 'next/server';
import crypto from 'crypto';

interface ApiKeyValidationResult {
  valid: boolean;
  keyId?: string;
  error?: string;
}

// Lista de API keys válidas (em produção, isso viria do banco de dados)
const VALID_API_KEYS = new Map([
  // Format: [hashedKey, { keyId, name, permissions }]
  [
    hashApiKey(process.env.API_KEY_1 || 'default-key-1'),
    { keyId: 'key_1', name: 'Main App', permissions: ['generate', 'refine'] }
  ],
  [
    hashApiKey(process.env.API_KEY_2 || 'default-key-2'),
    { keyId: 'key_2', name: 'Test App', permissions: ['generate'] }
  ],
]);

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function validateApiKey(request: NextRequest): Promise<ApiKeyValidationResult> {
  try {
    // 1. Extrair API key do header
    const apiKey = request.headers.get('X-API-Key') ||
                   request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return {
        valid: false,
        error: 'API key não fornecida. Use header X-API-Key ou Authorization Bearer.'
      };
    }

    // 2. Hash da key fornecida
    const hashedKey = hashApiKey(apiKey);

    // 3. Validar contra keys conhecidas
    const keyData = VALID_API_KEYS.get(hashedKey);

    if (!keyData) {
      return {
        valid: false,
        error: 'API key inválida ou não autorizada.'
      };
    }

    // 4. Log da requisição para auditoria
    console.log(`API Access: ${keyData.name} (${keyData.keyId}) - ${new Date().toISOString()}`);

    return {
      valid: true,
      keyId: keyData.keyId
    };

  } catch (error) {
    console.error('API Key validation error:', error);
    return {
      valid: false,
      error: 'Erro na validação da API key.'
    };
  }
}

// Middleware para validar permissões específicas
export async function validatePermission(
  request: NextRequest,
  requiredPermission: string
): Promise<ApiKeyValidationResult> {

  const keyValidation = await validateApiKey(request);

  if (!keyValidation.valid) {
    return keyValidation;
  }

  // Encontrar dados da key para verificar permissões
  const apiKey = request.headers.get('X-API-Key') ||
                 request.headers.get('Authorization')?.replace('Bearer ', '');

  if (apiKey) {
    const hashedKey = hashApiKey(apiKey);
    const keyData = VALID_API_KEYS.get(hashedKey);

    if (keyData && !keyData.permissions.includes(requiredPermission)) {
      return {
        valid: false,
        error: `Permissão '${requiredPermission}' não autorizada para esta API key.`
      };
    }
  }

  return keyValidation;
}

// Rate limiting simples baseado em API key
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  keyId: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {

  const now = Date.now();
  const windowStart = now - windowMs;

  let keyData = requestCounts.get(keyId);

  if (!keyData || keyData.resetTime <= windowStart) {
    // Reset ou primeira requisição
    keyData = { count: 1, resetTime: now + windowMs };
    requestCounts.set(keyId, keyData);

    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: keyData.resetTime
    };
  }

  if (keyData.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: keyData.resetTime
    };
  }

  keyData.count++;
  requestCounts.set(keyId, keyData);

  return {
    allowed: true,
    remaining: limit - keyData.count,
    resetTime: keyData.resetTime
  };
}