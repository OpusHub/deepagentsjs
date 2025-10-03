# 📋 Exemplos de Request - Copy Creator Agent

## 🚀 Como Testar

### 1. Via TypeScript (Local)

```bash
# Compilar o projeto
yarn build

# Executar o agente
node examples/research/copy-creator-agent.js
```

---

## 📝 Exemplos de Input

### Exemplo 1: Request com 5 Copies (Formato Estruturado)

```typescript
import { invokeWithStructuredOutput } from './copy-creator-agent.js';
import type { CopyCreatorInput, CopyResponse } from './types/copy-output.js';

const input: CopyCreatorInput = {
  clientName: "João Silva Construções",
  region: "São Paulo, SP",
  service: "Instalação de pisos laminados",
  offers: "20% de desconto para os 10 primeiros agendamentos",
  phoneNumber: "(11) 99999-9999",
  includeGoogleReviews: true,
  numberOfCopies: 5 // 🆕 Gera 5 copies
};

const result: CopyResponse = await invokeWithStructuredOutput(input);
console.log(JSON.stringify(result, null, 2));
```

---

### Exemplo 2: Request com 3 Copies (Default)

```typescript
const input: CopyCreatorInput = {
  clientName: "Maria Pereira Reformas",
  region: "Rio de Janeiro, RJ",
  service: "Pintura residencial e comercial",
  offers: "15% off na primeira contratação",
  phoneNumber: "(21) 98888-7777",
  includeGoogleReviews: false,
  // numberOfCopies não especificado = 3 (default)
};

const result = await invokeWithStructuredOutput(input);
```

---

### Exemplo 3: Request com 1 Copy

```typescript
const input: CopyCreatorInput = {
  clientName: "Carlos Moura Carpintaria",
  region: "Belo Horizonte, MG",
  service: "Móveis planejados sob medida",
  offers: "Projeto 3D grátis + desconto de 10%",
  phoneNumber: "(31) 97777-6666",
  includeGoogleReviews: true,
  numberOfCopies: 1 // Apenas 1 copy
};

const result = await invokeWithStructuredOutput(input);
```

---

### Exemplo 4: Request com 10 Copies (Máximo Recomendado)

```typescript
const input: CopyCreatorInput = {
  clientName: "Renovar Construções Ltda",
  region: "Curitiba, PR",
  service: "Reforma completa de apartamentos",
  offers: "Parcelamento em até 12x sem juros",
  phoneNumber: "(41) 96666-5555",
  includeGoogleReviews: true,
  numberOfCopies: 10 // 10 copies para A/B testing extensivo
};

const result = await invokeWithStructuredOutput(input);
```

---

### Exemplo 5: Request via Mensagem de Texto (Formato Livre)

```typescript
const input = {
  messages: [{
    role: "user",
    content: `Crie 7 copies para:
Nome do cliente: Ana Costa Arquitetura
Região: Brasília, DF
Serviço: Design de interiores residencial
Ofertas: Consulta inicial gratuita
Telefone: (61) 95555-4444
Reviews Google: Sim, incluir`
  }]
};

const result = await invokeWithStructuredOutput(input);
```

---

## ✅ Exemplo de Response (Structured Output)

### Sucesso - Copies Geradas

```json
{
  "message": "Aqui estão as 5 copies geradas com sucesso!",
  "type": "copies",
  "copies": [
    {
      "id": "copy-1",
      "order": 1,
      "content": "If you live in São Paulo and your floors are looking worn out, stop scrolling! João Silva Construções, a 5-star award-winning company with over 15 years transforming homes in the city, specializes in premium laminate flooring installation. Right now, we're offering 20% off, but only for the first 10 appointments this month. With hundreds of satisfied clients across São Paulo, we're booking up fast. Don't wait—call now at (11) 99999-9999 and schedule your free estimate before slots run out!",
      "created_at": "2025-10-02T15:30:00.000Z",
      "strategy": "Urgency/Scarcity Hook",
      "score": 9.2
    },
    {
      "id": "copy-2",
      "order": 2,
      "content": "Attention São Paulo homeowners! Are your floors outdated or damaged? João Silva Construções has been the trusted name in laminate flooring for over 15 years, with a perfect 5-star Google rating. We transform homes across the city with premium materials and expert craftsmanship. For a limited time, we're offering 20% off for the first 10 clients who book this month. Our schedule is filling up fast—don't miss out! Call (11) 99999-9999 today and elevate your home's style with flawless new floors.",
      "created_at": "2025-10-02T15:30:00.000Z",
      "strategy": "Authority/Credibility Hook",
      "score": 8.9
    },
    {
      "id": "copy-3",
      "order": 3,
      "content": "Imagine walking into your São Paulo home and seeing stunning, brand-new laminate floors that completely transform the space. João Silva Construções makes that dream a reality. With over 15 years of experience and a 5-star Google rating, we deliver beautiful, durable flooring that increases your home's value and comfort. Right now, get 20% off when you're one of the first 10 to book this month. But hurry—our calendar is nearly full! Call (11) 99999-9999 now and give your home the upgrade it deserves.",
      "created_at": "2025-10-02T15:30:00.000Z",
      "strategy": "Benefit/Transformation Hook",
      "score": 9.0
    },
    {
      "id": "copy-4",
      "order": 4,
      "content": "São Paulo residents: tired of scratched, outdated floors that make your home look old? The solution is here. João Silva Construções specializes in high-quality laminate flooring installation that's affordable, durable, and stunning. With 15+ years in the business and a perfect 5-star Google rating, we've helped hundreds of homeowners just like you. Plus, for the first 10 clients this month, we're offering 20% off. Our schedule fills fast—call (11) 99999-9999 today and solve your flooring problem for good!",
      "created_at": "2025-10-02T15:30:00.000Z",
      "strategy": "Problem/Solution Hook",
      "score": 8.7
    },
    {
      "id": "copy-5",
      "order": 5,
      "content": "Join hundreds of satisfied São Paulo homeowners who trust João Silva Construções for premium laminate flooring! With a 5-star Google rating and over 15 years of proven excellence, we're the go-to experts for transforming homes across the city. Our clients rave about our craftsmanship, reliability, and stunning results. Right now, we're offering 20% off for the first 10 appointments—but don't wait, we're booking up fast! Call (11) 99999-9999 now and see why everyone's choosing João Silva Construções!",
      "created_at": "2025-10-02T15:30:00.000Z",
      "strategy": "Social Proof Hook",
      "score": 8.8
    }
  ],
  "metadata": {
    "client_name": "João Silva Construções",
    "region": "São Paulo, SP",
    "service": "Instalação de pisos laminados",
    "total_copies": 5,
    "requested_copies": 5
  }
}
```

---

### Erro de Validação - Dados Faltando

```json
{
  "message": "Para criar suas copies de alta conversão, preciso das seguintes informações obrigatórias: Client phone number (for CTA), Google reviews preference (include or not)",
  "type": "validation_error"
}
```

---

### Mensagem Normal - Interação

```json
{
  "message": "Olá! Sou especialista em criar copies persuasivas para o setor de construção. Para começar, preciso de alguns dados sobre seu cliente. Pode me informar?",
  "type": "message"
}
```

---

## 🔧 Como Fazer Request HTTP (Via Railway/LangGraph SDK)

### Endpoint
```
POST https://seu-app.railway.app/copy-creator/invoke
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body (JSON)
```json
{
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Crie 5 copies para:\nNome do cliente: João Silva Construções\nRegião: São Paulo, SP\nServiço: Instalação de pisos laminados\nOfertas: 20% de desconto para os 10 primeiros agendamentos\nTelefone: (11) 99999-9999\nReviews Google: Sim, incluir"
      }
    ]
  }
}
```

### Exemplo com cURL

```bash
curl -X POST https://seu-app.railway.app/copy-creator/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "messages": [
        {
          "role": "user",
          "content": "Crie 5 copies para:\nNome do cliente: João Silva Construções\nRegião: São Paulo, SP\nServiço: Instalação de pisos laminados\nOfertas: 20% de desconto para os 10 primeiros agendamentos\nTelefone: (11) 99999-9999\nReviews Google: Sim, incluir"
        }
      ]
    }
  }'
```

### Exemplo com JavaScript/Fetch

```javascript
const response = await fetch('https://seu-app.railway.app/copy-creator/invoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: {
      messages: [
        {
          role: 'user',
          content: `Crie 7 copies para:
Nome do cliente: Maria Santos Reformas
Região: Porto Alegre, RS
Serviço: Pintura e impermeabilização
Ofertas: Orçamento gratuito + 10% de desconto
Telefone: (51) 94444-3333
Reviews Google: Sim, incluir`
        }
      ]
    }
  })
});

const data = await response.json();
console.log(data);
```

---

## 📊 Variações de Quantidade

| Quantidade | Uso Recomendado | Tempo Estimado |
|------------|-----------------|----------------|
| 1 copy | Teste rápido, validação inicial | ~30s |
| 3 copies | Default, A/B testing básico | ~60s |
| 5 copies | A/B testing robusto | ~90s |
| 7 copies | Testes multi-variados | ~2min |
| 10 copies | Campanhas grandes, análise extensa | ~3min |

---

## ⚠️ Notas Importantes

1. **Timeout**: Para N > 5, considere aumentar timeout para `N * 30000ms`
2. **Qualidade**: Quanto mais copies, maior o tempo de processamento
3. **Streaming**: Esta implementação **NÃO** usa streaming - retorna resposta completa
4. **Validação**: Agente valida automaticamente se N está entre 1-10
5. **Default**: Se não especificar `numberOfCopies`, assume 3

---

## 🧪 Testando Diferentes Cenários

### Cenário 1: Dados Incompletos
```typescript
const input = {
  clientName: "Test",
  // Falta region, service, offers, etc
};

// Resposta esperada:
// {
//   "type": "validation_error",
//   "message": "Para criar suas copies, preciso de: ..."
// }
```

### Cenário 2: Número Inválido de Copies
```typescript
const input = {
  clientName: "Test",
  region: "São Paulo, SP",
  service: "Reforma",
  offers: "10% off",
  phoneNumber: "(11) 99999-9999",
  includeGoogleReviews: true,
  numberOfCopies: 0 // Inválido!
};

// Resposta esperada:
// {
//   "type": "validation_error",
//   "message": "Número mínimo de copies é 1"
// }
```

### Cenário 3: Interação Normal
```typescript
const input = {
  messages: [{
    role: "user",
    content: "Olá, pode me ajudar?"
  }]
};

// Resposta esperada:
// {
//   "type": "message",
//   "message": "Olá! Sou especialista em criar copies..."
// }
```

---

## 🚀 Deploy no Railway

O agente já está configurado no `langgraph.json`:

```json
{
  "graphs": {
    "copy-creator": "./copy-creator-agent.ts:copyCreatorAgent"
  }
}
```

Após o deploy, use:
```
POST https://seu-app.railway.app/copy-creator/invoke
```

**Atenção**: Via LangGraph SDK HTTP, o retorno ainda pode vir em streaming. Para forçar resposta única, processe o stream completo antes de retornar ao cliente.
