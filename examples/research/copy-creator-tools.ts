import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get current directory for relative paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tool para acessar copies validadas
export const getValidatedCopies = tool(
  async () => {
    const filePath = join(__dirname, "knowledge-base", "validated-copies.md");

    if (!existsSync(filePath)) {
      return "Arquivo de copies validadas não encontrado. Verifique se o arquivo validated-copies.md existe na pasta knowledge-base.";
    }

    try {
      const content = readFileSync(filePath, "utf-8");
      return content;
    } catch (error) {
      return `Erro ao ler arquivo de copies validadas: ${error}`;
    }
  },
  {
    name: "get_validated_copies",
    description: "Acessa a base de conhecimento com 17 copies validadas de alta conversão para referência na criação de novas copies. Use esta ferramenta SEMPRE antes de criar copies.",
    schema: z.object({}),
  }
);

// Tool para acessar fórmulas de copywriting
export const getCopywritingFormulas = tool(
  async () => {
    const filePath = join(__dirname, "knowledge-base", "copywriting-formulas.md");

    if (!existsSync(filePath)) {
      return "Arquivo de fórmulas de copywriting não encontrado. Verifique se o arquivo copywriting-formulas.md existe na pasta knowledge-base.";
    }

    try {
      const content = readFileSync(filePath, "utf-8");
      return content;
    } catch (error) {
      return `Erro ao ler arquivo de fórmulas: ${error}`;
    }
  },
  {
    name: "get_copywriting_formulas",
    description: "Acessa fórmulas validadas de copywriting, gatilhos psicológicos, estruturas de 30-40 segundos e padrões de linguagem convertedora. Essential para criar copies seguindo padrões testados.",
    schema: z.object({}),
  }
);

// Tool para acessar templates de pesquisa de mercado
export const getMarketDataTemplates = tool(
  async () => {
    const filePath = join(__dirname, "knowledge-base", "market-data-templates.md");

    if (!existsSync(filePath)) {
      return "Arquivo de templates de mercado não encontrado. Verifique se o arquivo market-data-templates.md existe na pasta knowledge-base.";
    }

    try {
      const content = readFileSync(filePath, "utf-8");
      return content;
    } catch (error) {
      return `Erro ao ler templates de mercado: ${error}`;
    }
  },
  {
    name: "get_market_data_templates",
    description: "Acessa templates para análise de mercado, criação de personas, análise competitiva e insights comportamentais específicos para o setor de construção e home improvement.",
    schema: z.object({}),
  }
);

// Tool para acessar arquivo específico de copy base
export const getBaseCopys = tool(
  async () => {
    const filePath = join(__dirname, "base-copys.md");

    if (!existsSync(filePath)) {
      return "Arquivo base-copys.md não encontrado. Verifique se o arquivo existe na pasta root.";
    }

    try {
      const content = readFileSync(filePath, "utf-8");
      return content;
    } catch (error) {
      return `Erro ao ler base-copys.md: ${error}`;
    }
  },
  {
    name: "get_base_copys",
    description: "Acessa o arquivo base-copys.md que contém exemplos detalhados de copies com transcrições e descrições. Use para referência visual e estrutural.",
    schema: z.object({}),
  }
);