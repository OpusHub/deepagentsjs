// Re-exportar o agente principal para uso na API
export { copyCreatorAgent } from '../../copy-creator-agent.js';

// Tipos específicos para a API
export interface CopyGenerationRequest {
  clientName: string;
  region: string;
  service: string;
  offers?: string;
  phone: string;
  includeReviews: boolean;
}

export interface RefinementRequest extends CopyGenerationRequest {
  copyNumber: 1 | 2 | 3;
  feedback: string;
}

// Função helper para processar resultados do agente
export function processAgentResult(result: any) {
  // Processar resultado do agente e extrair dados estruturados
  // Em produção, você implementaria a lógica para ler os arquivos salvos
  // pelo agente e estruturar os dados para a resposta da API

  return {
    copies: {
      copy1: {
        content: "Copy 1 seria extraída do arquivo copy1.md",
        strategy: 'urgency' as const,
        score: 8.5,
        hook: "Hook de urgência seria extraído",
        duration: "32 segundos"
      },
      copy2: {
        content: "Copy 2 seria extraída do arquivo copy2.md",
        strategy: 'authority' as const,
        score: 8.8,
        hook: "Hook de autoridade seria extraído",
        duration: "35 segundos"
      },
      copy3: {
        content: "Copy 3 seria extraída do arquivo copy3.md",
        strategy: 'benefit' as const,
        score: 8.3,
        hook: "Hook de benefício seria extraído",
        duration: "33 segundos"
      }
    },
    analysis: {
      marketResearch: "Análise seria extraída do arquivo analise_mercado.md",
      hookStrategy: "Estratégia seria extraída do arquivo hooks_estrategicos.md",
      qualityAudit: "Auditoria seria extraída do arquivo auditoria_qualidade.md"
    }
  };
}