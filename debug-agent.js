// Script de debug para testar o copy-creator agent diretamente
// Execute: node debug-agent.js

import 'dotenv/config';

async function testAgent() {
  try {
    console.log('🔍 Testando conexão com Railway...');

    const response = await fetch('https://deepagentsjs-production.up.railway.app/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          messages: [
            {
              role: "user",
              content: `Teste simples:
Nome do cliente: Teste Construções
Região: São Paulo, SP
Serviço: Pisos laminados
Ofertas: 10% desconto
Telefone: (11) 99999-9999
Reviews Google: Sim`
            }
          ]
        },
        config: {
          configurable: {
            graph_id: "copy-creator"
          }
        },
        stream: false // Primeiro teste sem streaming
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Resposta recebida:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Erro no teste:', error);

    // Teste de saúde
    try {
      const healthResponse = await fetch('https://deepagentsjs-production.up.railway.app/health');
      console.log('🏥 Health check:', healthResponse.ok ? '✅ OK' : '❌ FAIL');
    } catch (healthError) {
      console.error('🏥 Health check failed:', healthError.message);
    }
  }
}

testAgent();