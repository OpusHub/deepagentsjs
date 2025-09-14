# 🚀 Integração Deep Agent Copy Creator com Next.js + Vercel

## 📋 Informações Necessárias do Seu Projeto

**Antes de prosseguir, preciso entender melhor sua arquitetura atual:**

### 🔍 **Por favor, me informe sobre:**

1. **Estrutura do Banco de Dados:**
   - Schema das tabelas (users, companies, tenants)
   - Relacionamentos entre entidades
   - Onde serão armazenadas as copies geradas?

2. **Arquitetura de Autenticação:**
   - Sistema de auth usado (NextAuth, Clerk, custom?)
   - Como funciona o sistema de tenancy?
   - Middleware de autenticação existente?

3. **Estrutura de Pastas:**
   - Layout atual do projeto Next.js
   - Onde ficam server actions, API routes?
   - Sistema de components e pages?

4. **Limitações da Vercel:**
   - Plano atual (Hobby, Pro, Enterprise?)
   - Timeout limits que preciso considerar?

---

## 🎯 Opções de Implementação Recomendadas

### **Opção 1: API Route (Recomendada para Simplicidade)**
```typescript
// app/api/copy-creator/route.ts
export async function POST(request: Request) {
  // Implementação do agente aqui
}
```

### **Opção 2: Server Actions (Recomendada para UX)**
```typescript
// actions/copy-creator.ts
'use server'
export async function createCopies(formData: FormData) {
  // Implementação do agente aqui
}
```

### **Opção 3: Serviço Externo (Recomendada para Escala)**
```typescript
// Hospedar agente em serviço separado
// Next.js faz chamadas HTTP para o serviço
```

---

## ⚠️ Considerações Importantes da Vercel

### **Limitações Críticas:**

1. **Timeout Limits:**
   - **Hobby Plan**: 10 segundos
   - **Pro Plan**: 60 segundos (pode não ser suficiente)
   - **Enterprise**: 900 segundos

2. **Memory Limits:**
   - **Hobby**: 1024 MB
   - **Pro**: 1024 MB (pode ser insuficiente para LLMs)
   - **Enterprise**: 3008 MB

3. **Cold Start:**
   - Agente pode ter cold start significativo
   - Primeira execução sempre mais lenta

---

## 🏗️ Arquitetura Recomendada (Aguardando seus detalhes)

### **Estrutura Prevista:**
```
seu-projeto-nextjs/
├── app/
│   ├── api/
│   │   └── copy-creator/
│   │       ├── route.ts          # Endpoint principal
│   │       ├── refine/route.ts   # Endpoint de refinamento
│   │       └── status/route.ts   # Endpoint de status
│   ├── dashboard/
│   │   └── copy-creator/
│   │       ├── page.tsx          # Interface principal
│   │       ├── components/       # Components específicos
│   │       └── hooks/           # Hooks customizados
├── lib/
│   ├── copy-creator/            # Lógica do agente
│   │   ├── agent.ts
│   │   ├── tools.ts
│   │   └── database.ts
│   └── database/
│       ├── schema.ts            # Schema das tabelas
│       └── queries.ts           # Queries relacionadas
└── actions/
    └── copy-creator.ts          # Server actions
```

### **Schema de Banco Previsto:**
```sql
-- Aguardando detalhes do seu schema atual
CREATE TABLE copy_projects (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  client_name VARCHAR NOT NULL,
  client_region VARCHAR NOT NULL,
  service_type VARCHAR NOT NULL,
  offers TEXT,
  phone VARCHAR,
  include_reviews BOOLEAN,
  status VARCHAR DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE copy_generations (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES copy_projects(id),
  copy_number INTEGER NOT NULL, -- 1, 2, 3
  copy_type VARCHAR NOT NULL,   -- urgency, authority, benefit
  content TEXT NOT NULL,
  score DECIMAL(3,1),
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Implementação Base (Template)

### **1. API Route Principal:**
```typescript
// app/api/copy-creator/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { copyCreatorAgent } from '@/lib/copy-creator/agent';
import { saveCopyProject, getUserCompany } from '@/lib/database/queries';

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validação de dados
    const body = await request.json();
    const { clientName, region, service, offers, phone, includeReviews } = body;

    // 3. Verificação de tenant/company
    const userCompany = await getUserCompany(session.user.id);
    if (!userCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // 4. Criar projeto no banco
    const project = await saveCopyProject({
      userId: session.user.id,
      companyId: userCompany.id,
      tenantId: userCompany.tenantId,
      clientName,
      region,
      service,
      offers,
      phone,
      includeReviews,
      status: 'processing'
    });

    // 5. Executar agente (em background se necessário)
    const result = await copyCreatorAgent.invoke({
      messages: [{
        role: "user",
        content: `Crie copies para:
        Nome do cliente: ${clientName}
        Região: ${region}
        Serviço: ${service}
        Ofertas: ${offers}
        Telefone: ${phone}
        Reviews Google: ${includeReviews ? 'Sim' : 'Não'}`
      }]
    });

    // 6. Salvar resultados no banco
    await saveCopyResults(project.id, result);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      message: 'Copies geradas com sucesso!'
    });

  } catch (error) {
    console.error('Copy Creator Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

### **2. Component React:**
```typescript
// app/dashboard/copy-creator/page.tsx
'use client';

import { useState } from 'react';
import { createCopies } from '@/actions/copy-creator';

export default function CopyCreatorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await createCopies(formData);
      setResult(result);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Criador de Copy Persuasiva</h1>

      <form action={handleSubmit} className="space-y-4">
        <input
          name="clientName"
          placeholder="Nome do Cliente"
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="region"
          placeholder="Região (ex: São Paulo, SP)"
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="service"
          placeholder="Tipo de Serviço"
          required
          className="w-full p-3 border rounded"
        />
        <input
          name="offers"
          placeholder="Ofertas Disponíveis"
          className="w-full p-3 border rounded"
        />
        <input
          name="phone"
          placeholder="Telefone do Cliente"
          required
          className="w-full p-3 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded disabled:bg-gray-400"
        >
          {loading ? 'Gerando Copies...' : 'Gerar Copies'}
        </button>
      </form>

      {result && (
        <div className="mt-8">
          {/* Exibir resultados */}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Próximos Passos

### **Para continuar, preciso que você me forneça:**

1. **Schema atual do banco de dados**
2. **Estrutura de autenticação/tenancy**
3. **Layout de pastas do projeto**
4. **Plano da Vercel atual**
5. **Preferência de implementação**

### **Com essas informações, vou criar:**

1. ✅ **Schema completo** das tabelas necessárias
2. ✅ **Implementação detalhada** da opção escolhida
3. ✅ **Sistema de background jobs** se necessário
4. ✅ **Interface completa** com components
5. ✅ **Sistema de refinamento** integrado
6. ✅ **Tratamento de erros** robusto
7. ✅ **Otimizações** para Vercel

---

## 🚨 Decisão Crítica Necessária

### **Pergunta Principal:**
**O processo de geração de copies (que pode levar 2-5 minutos) deve ser:**

**A) Síncrono** - Usuário espera na tela
**B) Assíncrono** - Background job + notificações
**C) Híbrido** - Streaming de resultados em tempo real

**Recomendo opção B ou C devido aos timeouts da Vercel.**

---

**Compartilhe os detalhes do seu projeto para eu criar a implementação completa e específica!** 🚀