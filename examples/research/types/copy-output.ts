/**
 * TypeScript interfaces for Copy Creator Agent structured output
 */

export interface CopyObject {
  id: string;           // "copy-1", "copy-2", etc
  order: number;        // 1, 2, 3, ..., n
  content: string;      // Texto completo da copy
  created_at: string;   // ISO timestamp
  strategy?: string;    // "Urgency/Scarcity", "Authority/Credibility", etc
  score?: number;       // Score do QA Agent (8.5, 9.2, etc)
}

export interface CopyResponse {
  message: string;      // Mensagem para o usuário
  type: "copies" | "message" | "error" | "validation_error";
  copies?: CopyObject[];
  metadata?: {
    client_name?: string;
    region?: string;
    service?: string;
    total_copies: number;
    requested_copies?: number;
    warning?: string;
  };
}

export interface CopyCreatorInput {
  clientName: string;
  region: string;
  service: string;
  offers: string;
  phoneNumber: string;
  includeGoogleReviews: boolean;
  numberOfCopies?: number; // Opcional (default: 3)
}
