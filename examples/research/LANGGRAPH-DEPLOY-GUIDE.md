# 🚀 Deploy LangGraph Studio - Guia Completo

## 🎯 Resumo da Situação

**Sua Configuração Atual:**
```
Frontend Chat (Next.js) → localhost:2024 → copy-creator agent → Streaming ✅
```

**Objetivo:**
```
Frontend Chat (Next.js) → LangGraph Cloud → copy-creator agent → Streaming ✅
```

**O que muda:** Apenas a URL do `NEXT_PUBLIC_DEPLOYMENT_URL`!

---

## 🌐 Opções de Deploy LangGraph

### **Opção 1: LangGraph Cloud (Recomendada)**
- ✅ **Managed service** oficial
- ✅ **Scaling automático**
- ✅ **Streaming nativo**
- ✅ **Setup mais simples**

### **Opção 2: Self-Hosted**
- ✅ **Controle total**
- ✅ **Custos menores**
- ⚠️ **Mais complexo**

### **Opção 3: Containers (Docker)**
- ✅ **Portabilidade**
- ✅ **Controle de ambiente**
- ⚠️ **Requer infraestrutura**

---

## 🚀 Deploy LangGraph Cloud (Método Oficial)

### **1. Instalar LangChain CLI:**
```bash
pip install -U "langgraph-cli[inmem]"
```

### **2. Configurar Projeto:**
```bash
# No diretório do seu agente
cd examples/research

# Verificar se langgraph.json existe
cat langgraph.json
```

### **3. Login LangSmith:**
```bash
# Criar conta em https://smith.langchain.com
export LANGCHAIN_API_KEY="your-api-key"
langchain auth login
```

### **4. Deploy:**
```bash
# Deploy do agente
langchain deploy

# Seguir o wizard:
# 1. Escolher nome do deployment
# 2. Configurar environment variables
# 3. Aguardar deploy
```

### **5. Obter URL:**
```bash
# Após deploy, você receberá uma URL como:
# https://your-deployment.langchain.app
```

---

## ⚙️ Deploy Self-Hosted (Alternativa)

### **Usando Railway:**
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Dockerfile
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy project
COPY . .

# Expose port
EXPOSE 2024

# Run LangGraph CLI
CMD ["langgraph", "dev", "--host", "0.0.0.0", "--port", "2024"]
```

**requirements.txt:**
```txt
langgraph-cli[inmem]
langchain
langchain-anthropic
langchain-tavily
python-dotenv
```

### **Deploy Railway:**
```bash
railway up
```

---

## 🔧 Deploy com Render (Alternativa)

### **render.yaml:**
```yaml
services:
  - type: web
    name: langgraph-copy-creator
    env: node
    buildCommand: |
      pip install -U "langgraph-cli[inmem]"
      npm install
    startCommand: langgraph dev --host 0.0.0.0 --port $PORT
    envVars:
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: TAVILY_API_KEY
        sync: false
      - key: LANGCHAIN_API_KEY
        sync: false
```

---

## 🌐 Usando Vercel Functions (Experimental)

### **api/langgraph.js:**
```javascript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Executar LangGraph como subprocess
      const { stdout } = await execAsync(
        'langgraph invoke copy-creator',
        {
          input: JSON.stringify(req.body),
          timeout: 300000 // 5 minutes
        }
      );

      res.status(200).json(JSON.parse(stdout));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

**⚠️ Limitação:** Vercel não suporta streaming nativo do LangGraph

---

## 📱 Atualizar Seu Frontend

### **Antes (Localhost):**
```typescript
// .env.local
NEXT_PUBLIC_DEPLOYMENT_URL=http://localhost:2024
NEXT_PUBLIC_AGENT_ID=copy-creator
```

### **Depois (Produção):**
```typescript
// .env.local
NEXT_PUBLIC_DEPLOYMENT_URL=https://your-deployment.langchain.app
NEXT_PUBLIC_AGENT_ID=copy-creator

// ou Railway/Render
NEXT_PUBLIC_DEPLOYMENT_URL=https://your-app.railway.app
NEXT_PUBLIC_AGENT_ID=copy-creator
```

### **Código do Frontend (Não Muda!):**
```typescript
// Seu código atual já funciona!
const response = await fetch(`${process.env.NEXT_PUBLIC_DEPLOYMENT_URL}/invoke`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    agent_id: process.env.NEXT_PUBLIC_AGENT_ID,
    input: userMessage,
    stream: true // Streaming ainda funciona!
  })
});
```

---

## 🎯 Resumo - O que Fazer:

### **Passo 1: Deploy LangGraph**
```bash
# Opção mais fácil
langchain deploy

# Ou self-hosted
# Railway/Render com Dockerfile
```

### **Passo 2: Atualizar Frontend**
```bash
# Mudar apenas uma linha no .env.local:
NEXT_PUBLIC_DEPLOYMENT_URL=https://sua-url-de-producao
```

### **Passo 3: Testar**
```bash
# Frontend continua funcionando igual!
npm run dev
```

---

## ⚡ Vantagens de Manter LangGraph:

✅ **Streaming**: Visualização das tools em tempo real
✅ **Debug**: Interface do LangGraph Studio
✅ **Performance**: Otimizado para agents
✅ **Compatibilidade**: Seu frontend já funciona
✅ **Simplicidade**: Só muda a URL

---

## 🚨 Configurações Importantes:

### **Environment Variables (Produção):**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-production-key
TAVILY_API_KEY=tvly-production-key
LANGCHAIN_API_KEY=lsv2_production_key

# Para LangGraph Cloud
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=copy-creator-prod
```

### **langgraph.json (Verificar):**
```json
{
  "agent_id": "copy-creator",
  "description": "Deep Agent Copy Creator with streaming",
  "config_schemas": {
    "agent": {
      "type": "object",
      "properties": {}
    }
  }
}
```

---

## 🎉 Resultado Final:

```
Desenvolvimento: localhost:2024 (LangGraph CLI)
Produção: https://your-deployment.langchain.app (LangGraph Cloud)

Seu frontend: Só muda URL, funcionalidade idêntica!
✅ Streaming mantido
✅ Tools visualization mantida
✅ Chat interface mantida
✅ Performance otimizada
```

**Recomendação: Use LangGraph Cloud para máxima simplicidade!** 🚀