# 🚀 Deploy Deep Agent Copy Creator API na Vercel

## 🎯 Arquitetura Recomendada

### **Separação de Responsabilidades:**
- **Aplicação Principal (Next.js)**: Interface, autenticação, banco de dados
- **API Copy Creator (Este projeto)**: Lógica de geração de copies, deployed separadamente

### **Vantagens:**
✅ **Isolamento**: API independente, não afeta aplicação principal
✅ **Escalabilidade**: Pode usar planos diferentes da Vercel
✅ **Timeout**: API dedicada pode usar timeout maior
✅ **Manutenção**: Updates independentes
✅ **Reutilização**: API pode ser usada por múltiplas aplicações

---

## 📁 Estrutura do Projeto para Deploy

### **package.json**
```json
{
  "name": "deep-agent-copy-creator-api",
  "version": "1.0.0",
  "description": "API para geração de copies persuasivas com Deep Agents",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.0",
    "@langchain/core": "^0.1.0",
    "@langchain/langgraph": "^0.0.1",
    "@langchain/tavily": "^0.0.1",
    "@langchain/anthropic": "^0.1.0",
    "zod": "^3.22.0",
    "cors": "^2.8.5",
    "crypto": "^1.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/cors": "^2.8.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### **next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@langchain/core', '@langchain/langgraph']
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-API-Key' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### **Estrutura de Pastas:**
```
deep-agent-copy-creator-api/
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts       # Geração inicial de copies
│   │   ├── refine/
│   │   │   └── route.ts       # Refinamento de copy específica
│   │   ├── status/
│   │   │   └── route.ts       # Status de processo
│   │   └── health/
│   │       └── route.ts       # Health check
│   └── globals.css
├── lib/
│   ├── copy-creator/
│   │   ├── agent.ts           # Agente principal
│   │   ├── tools.ts           # Tools específicas
│   │   └── types.ts           # Tipos TypeScript
│   ├── auth/
│   │   └── middleware.ts      # Validação API key
│   └── utils/
│       └── response.ts        # Padronização de respostas
├── knowledge-base/            # Base de conhecimento
├── agents/                    # Sub-agentes
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.local                 # Variáveis de ambiente
└── vercel.json               # Configurações Vercel
```

---

## 🔐 Sistema de Autenticação por API Key

### **lib/auth/middleware.ts**
- ✅ Validação de API key via header `X-API-Key` ou `Authorization Bearer`
- ✅ Hash SHA-256 das keys para segurança
- ✅ Sistema de permissões por key
- ✅ Rate limiting simples por API key
- ✅ Logging de auditoria

### **Como Funciona:**
```typescript
// Headers da requisição
{
  "X-API-Key": "sua-api-key-aqui",
  "Content-Type": "application/json"
}
```

---

## 🌐 API Endpoints Implementados

### **1. POST /api/generate** - Geração Inicial de Copies
**Request:**
```json
{
  "clientName": "João Silva Construções",
  "region": "São Paulo, SP",
  "service": "Instalação de pisos laminados",
  "offers": "20% de desconto para os 10 primeiros",
  "phone": "(11) 99999-9999",
  "includeReviews": true,
  "userId": "user_123",
  "companyId": "comp_456",
  "tenantId": "tenant_789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Copies geradas com sucesso",
  "data": {
    "executionTime": 45000,
    "clientName": "João Silva Construções",
    "region": "São Paulo, SP",
    "service": "Instalação de pisos laminados",
    "status": "completed",
    "copies": {
      "copy1": {
        "content": "Copy completa de urgência/escassez...",
        "strategy": "urgency",
        "score": 8.5,
        "hook": "Se você mora em São Paulo, pare e...",
        "duration": "32 segundos"
      },
      "copy2": { /* Copy de autoridade */ },
      "copy3": { /* Copy de benefício */ }
    },
    "analysis": {
      "marketResearch": "Análise demográfica completa...",
      "hookStrategy": "3 hooks estratégicos criados...",
      "qualityAudit": "Scores e recomendações..."
    }
  }
}
```

### **2. POST /api/refine** - Refinamento de Copy Específica
**Request:**
```json
{
  "copyNumber": 3,
  "feedback": "não gostei da copy 3, precisa de mais urgência",
  "originalRequest": {
    "clientName": "João Silva Construções",
    "region": "São Paulo, SP",
    "service": "Instalação de pisos laminados",
    "offers": "20% de desconto",
    "phone": "(11) 99999-9999",
    "includeReviews": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Copy 3 refinada com sucesso",
  "data": {
    "executionTime": 38000,
    "copyNumber": 3,
    "feedback": "não gostei da copy 3, precisa de mais urgência",
    "status": "refined",
    "refinedCopy": {
      "content": "Nova copy com mais urgência...",
      "score": 9.2,
      "improvements": [
        "Adicionado elemento de escassez temporal",
        "Hook mais impactante",
        "CTA mais direto"
      ],
      "comparison": {
        "previousScore": 8.3,
        "newScore": 9.2,
        "improvementPercentage": 10.8
      }
    }
  }
}
```

### **3. GET /api/health** - Health Check
**Response:**
```json
{
  "success": true,
  "message": "Health check realizado com sucesso",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "services": {
      "agent": "up",
      "tavily": "up",
      "anthropic": "up"
    },
    "performance": {
      "averageResponseTime": 156,
      "successRate": 99.5
    }
  }
}
```

---

## ⚙️ Configurações Vercel

### **vercel.json**
```json
{
  "version": 2,
  "name": "deep-agent-copy-creator-api",
  "functions": {
    "app/api/*/route.ts": {
      "maxDuration": 300
    }
  },
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-API-Key"
        }
      ]
    }
  ]
}
```

### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🌍 Variáveis de Ambiente

### **.env.local** (Desenvolvimento)
```bash
# LLM APIs
ANTHROPIC_API_KEY=sk-ant-api03-your-anthropic-key-here
TAVILY_API_KEY=tvly-your-tavily-key-here

# API Keys para autenticação
API_KEY_1=sua-api-key-principal-aqui
API_KEY_2=sua-api-key-secundaria-aqui

# Configurações
NODE_ENV=development
```

### **Vercel Environment Variables** (Produção)
```bash
# No dashboard da Vercel, configure:
ANTHROPIC_API_KEY=sk-ant-api03-production-key
TAVILY_API_KEY=tvly-production-key
API_KEY_1=production-main-key
API_KEY_2=production-secondary-key
NODE_ENV=production
```

---

## 🚀 Passo a Passo do Deploy

### **1. Preparar o Projeto:**
```bash
# Clone ou mova os arquivos
cd your-copy-creator-api
npm install

# Teste localmente
npm run dev
```

### **2. Configurar Vercel:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy inicial
vercel

# Configurar variáveis de ambiente
vercel env add ANTHROPIC_API_KEY
vercel env add TAVILY_API_KEY
vercel env add API_KEY_1
vercel env add API_KEY_2
```

### **3. Deploy Final:**
```bash
vercel --prod
```

---

## 🔗 Como Conectar da Sua Aplicação Principal

### **No seu Next.js Principal:**

**lib/api/copy-creator.ts**
```typescript
const COPY_CREATOR_API = 'https://your-copy-api.vercel.app';
const API_KEY = process.env.COPY_CREATOR_API_KEY;

export async function generateCopies(data: {
  clientName: string;
  region: string;
  service: string;
  offers?: string;
  phone: string;
  includeReviews: boolean;
  userId: string;
  companyId: string;
  tenantId: string;
}) {
  const response = await fetch(`${COPY_CREATOR_API}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY!,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Erro na geração de copies');
  }

  return response.json();
}

export async function refineCopy(data: {
  copyNumber: 1 | 2 | 3;
  feedback: string;
  originalRequest: any;
  userId: string;
  companyId: string;
  tenantId: string;
}) {
  const response = await fetch(`${COPY_CREATOR_API}/api/refine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY!,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Erro no refinamento da copy');
  }

  return response.json();
}
```

**Server Action Exemplo:**
```typescript
// actions/copy-creator.ts
'use server'

import { generateCopies, refineCopy } from '@/lib/api/copy-creator';
import { getServerSession } from 'next-auth';
import { getUserCompany } from '@/lib/database/queries';

export async function createCopies(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) throw new Error('Unauthorized');

  const userCompany = await getUserCompany(session.user.id);
  if (!userCompany) throw new Error('Company not found');

  const result = await generateCopies({
    clientName: formData.get('clientName') as string,
    region: formData.get('region') as string,
    service: formData.get('service') as string,
    offers: formData.get('offers') as string,
    phone: formData.get('phone') as string,
    includeReviews: formData.get('includeReviews') === 'on',
    userId: session.user.id,
    companyId: userCompany.id,
    tenantId: userCompany.tenantId,
  });

  // Salvar resultado no seu banco de dados
  // await saveCopyResults(result);

  return result;
}
```

---

## ⚡ Otimizações e Considerações

### **Performance:**
- ✅ **Timeout**: Configurado para 300 segundos (5 minutos)
- ✅ **Rate Limiting**: 10 requests/minuto por API key
- ✅ **Health Check**: Monitoramento de status
- ✅ **Error Handling**: Tratamento robusto de erros

### **Segurança:**
- ✅ **API Key Authentication**: SHA-256 hash
- ✅ **CORS**: Configurado apropriadamente
- ✅ **Input Validation**: Zod schemas
- ✅ **Audit Logging**: Log de todas as requisições

### **Monitoramento:**
- ✅ **Health Endpoint**: `/api/health`
- ✅ **Error Tracking**: Console logs estruturados
- ✅ **Performance Metrics**: Tempo de execução tracking

---

## 📱 Exemplo de Uso Completo

```typescript
// Na sua aplicação principal
const result = await fetch('https://your-copy-api.vercel.app/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sua-api-key-aqui'
  },
  body: JSON.stringify({
    clientName: "João Silva Construções",
    region: "São Paulo, SP",
    service: "Instalação de pisos laminados",
    offers: "20% de desconto para os 10 primeiros",
    phone: "(11) 99999-9999",
    includeReviews: true,
    userId: "user_123",
    companyId: "comp_456",
    tenantId: "tenant_789"
  })
});

const data = await result.json();
console.log(data.data.copies); // 3 copies geradas
```

**🎯 Pronto! Sua API está isolada, escalável e pronta para integração com qualquer aplicação!**