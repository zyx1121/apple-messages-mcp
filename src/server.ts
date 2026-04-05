import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMessagesTools } from "./tools/messages.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "apple-messages",
    version: "0.1.0",
  });

  registerMessagesTools(server);

  return server;
}
