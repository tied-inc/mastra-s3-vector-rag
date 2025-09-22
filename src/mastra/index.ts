import { MastraJwtAuth } from "@mastra/auth";
import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { knowledgeMcpServer } from "./mcp/knowledge-server";
import { weatherWorkflow } from "./workflows/weather-workflow";

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  server: {
    port: 8080,
    experimental_auth: new MastraJwtAuth({
      secret: process.env.MASTRA_JWT_SECRET,
    }),
  },
  mcpServers: { knowledge: knowledgeMcpServer },
});
