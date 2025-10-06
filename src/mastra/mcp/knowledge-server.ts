import { MCPServer } from "@mastra/mcp";
import type { MCPServerResources, Resource, MCPServerResourceContent } from "@mastra/mcp";
import {
  knowledgeAddTool,
  knowledgeRemoveTool,
  knowledgeSearchTool,
  knowledgeUpdateTool,
} from "../tools/knowledge";

const DEFAULT_INDEX = process.env.S3_VECTORS_INDEX_NAME || "knowledge";

const resourceHandlers: MCPServerResources = {
  listResources: async () => {
    const indexName = DEFAULT_INDEX.replace(/_/g, "-").toLowerCase();
    
    // S3 Vectorsはリソースリストの取得機能を直接提供していないため、
    // 代わりにインデックス自体をリソースとして公開
    const resources: Resource[] = [
      {
        uri: `knowledge://${indexName}`,
        name: `Knowledge Base: ${indexName}`,
        description: `Vector index containing knowledge base documents`,
        mimeType: "application/json",
      },
    ];
    
    return resources;
  },

  getResourceContent: async ({ uri }) => {
    // URIからindexNameを抽出
    const match = uri.match(/^knowledge:\/\/([^/]+)$/);
    if (!match) {
      throw new Error(`Invalid resource URI: ${uri}. Expected format: knowledge://<indexName>`);
    }
    
    const [, indexName] = match;
    
    try {
      // インデックスのメタ情報を返す
      const content: MCPServerResourceContent = {
        text: JSON.stringify({
          indexName,
          description: "Knowledge base powered by AWS S3 Vectors",
          embeddingModel: "amazon.titan-embed-text-v2:0",
          dimension: 1024,
          availableTools: [
            "knowledge_add - Add documents to the knowledge base",
            "knowledge_search - Search for relevant documents",
            "knowledge_update - Update existing documents",
            "knowledge_remove - Remove documents from the knowledge base",
          ],
        }, null, 2),
      };
      
      return content;
    } catch (error) {
      console.error(`Failed to get resource content for ${uri}:`, error);
      throw new Error(`Failed to retrieve knowledge base info: ${error}`);
    }
  },

  resourceTemplates: async () => {
    return [
      {
        uriTemplate: `knowledge://{indexName}`,
        name: "Knowledge Base Index",
        description: "Information about a knowledge base vector index",
        mimeType: "application/json",
      },
    ];
  },
};

export const knowledgeMcpServer = new MCPServer({
  name: "knowledge",
  version: "0.1.0",
  
  tools: {
    knowledge_add: knowledgeAddTool,
    knowledge_update: knowledgeUpdateTool,
    knowledge_remove: knowledgeRemoveTool,
    knowledge_search: knowledgeSearchTool,
  },
  
  resources: resourceHandlers,
});
