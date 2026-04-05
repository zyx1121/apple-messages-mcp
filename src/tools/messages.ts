import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runAppleScript, runSqlite, escapeForAppleScript, success, withErrorHandling } from "../helpers.js";

const DB_PATH = `${process.env.HOME}/Library/Messages/chat.db`;

export function registerMessagesTools(server: McpServer) {
  server.tool(
    "messages_send",
    "Send an iMessage to a phone number or email",
    {
      to: z.string().describe("Recipient phone number or email address"),
      message: z.string().describe("Message text to send"),
    },
    withErrorHandling(async ({ to, message }) => {
      const esc = escapeForAppleScript;
      await runAppleScript(`
tell application "Messages"
  send "${esc(message)}" to buddy "${esc(to)}" of service 1
end tell`);
      return success({ to, sent: true });
    }),
  );

  server.tool(
    "messages_list_chats",
    "List recent chats/conversations from Messages",
    {
      limit: z.number().optional().default(50).describe("Max number of chats to return"),
    },
    withErrorHandling(async ({ limit }) => {
      const query = `
SELECT c.ROWID as chat_id, c.chat_identifier, c.display_name,
  datetime(m.date/1000000000 + 978307200, 'unixepoch', 'localtime') as last_message_date
FROM chat c
LEFT JOIN chat_message_join cmj ON c.ROWID = cmj.chat_id
LEFT JOIN message m ON cmj.message_id = m.ROWID
GROUP BY c.ROWID
ORDER BY m.date DESC
LIMIT ${limit};`;
      const raw = await runSqlite(DB_PATH, query);
      const chats = raw ? JSON.parse(raw) : [];
      return success(chats);
    }),
  );

  server.tool(
    "messages_read",
    "Read recent messages from a specific chat or contact",
    {
      chat_id: z.string().optional().describe("Chat ROWID from messages_list_chats"),
      contact: z.string().optional().describe("Phone number or email to find chat by"),
      limit: z.number().optional().default(20).describe("Max number of messages to return"),
    },
    withErrorHandling(async ({ chat_id, contact, limit }) => {
      if (!chat_id && !contact) throw new Error("Provide either chat_id or contact");

      let chatFilter: string;
      if (chat_id) {
        chatFilter = `cmj.chat_id = ${parseInt(chat_id, 10)}`;
      } else {
        const escaped = contact!.replace(/'/g, "''");
        chatFilter = `cmj.chat_id IN (SELECT ROWID FROM chat WHERE chat_identifier LIKE '%${escaped}%')`;
      }

      const query = `
SELECT m.text, m.is_from_me,
  datetime(m.date/1000000000 + 978307200, 'unixepoch', 'localtime') as date,
  h.id as sender
FROM message m
JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
LEFT JOIN handle h ON m.handle_id = h.ROWID
WHERE ${chatFilter} AND m.text IS NOT NULL
ORDER BY m.date DESC
LIMIT ${limit};`;
      const raw = await runSqlite(DB_PATH, query);
      const messages = raw ? JSON.parse(raw) : [];
      return success(messages);
    }),
  );

  server.tool(
    "messages_search",
    "Search messages by keyword",
    {
      query: z.string().describe("Search keyword"),
      limit: z.number().optional().default(20).describe("Max number of results to return"),
    },
    withErrorHandling(async ({ query: keyword, limit }) => {
      const escaped = keyword.replace(/'/g, "''");
      const sql = `
SELECT m.text, m.is_from_me,
  datetime(m.date/1000000000 + 978307200, 'unixepoch', 'localtime') as date,
  h.id as sender, c.chat_identifier
FROM message m
LEFT JOIN handle h ON m.handle_id = h.ROWID
JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
JOIN chat c ON cmj.chat_id = c.ROWID
WHERE m.text LIKE '%${escaped}%'
ORDER BY m.date DESC
LIMIT ${limit};`;
      const raw = await runSqlite(DB_PATH, sql);
      const messages = raw ? JSON.parse(raw) : [];
      return success(messages);
    }),
  );
}
