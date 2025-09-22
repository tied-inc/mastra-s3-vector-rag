import { MCPServer } from "@mastra/mcp";
import {
  knowledgeAddTool,
  knowledgeRemoveTool,
  knowledgeSearchTool,
  knowledgeUpdateTool,
} from "../tools/knowledge";

export const knowledgeMcpServer = new MCPServer({
  name: "knowledge",
  version: "0.1.0",
  tools: {
    knowledge_add: knowledgeAddTool,
    knowledge_update: knowledgeUpdateTool,
    knowledge_remove: knowledgeRemoveTool,
    knowledge_search: knowledgeSearchTool,
  },
});
