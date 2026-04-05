```
 █████╗ ██████╗ ██████╗ ██╗     ███████╗    ███╗   ███╗███████╗███████╗███████╗
██╔══██╗██╔══██╗██╔══██╗██║     ██╔════╝    ████╗ ████║██╔════╝██╔════╝██╔════╝
███████║██████╔╝██████╔╝██║     █████╗      ██╔████╔██║█████╗  ███████╗███████╗
██╔══██║██╔═══╝ ██╔═══╝ ██║     ██╔══╝      ██║╚██╔╝██║██╔══╝  ╚════██║╚════██║
██║  ██║██║     ██║     ███████╗███████╗    ██║ ╚═╝ ██║███████╗███████║███████║
╚═╝  ╚═╝╚═╝     ╚═╝     ╚══════╝╚══════╝    ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝
                                                                               
 █████╗  ██████╗ ███████╗███████╗                                              
██╔══██╗██╔════╝ ██╔════╝██╔════╝                                              
███████║██║  ███╗█████╗  ███████╗                                              
██╔══██║██║   ██║██╔══╝  ╚════██║                                              
██║  ██║╚██████╔╝███████╗███████║                                              
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝
```

# @zyx1121/apple-messages-mcp

MCP server for Apple Messages — send and read iMessages via Claude Code.

## Install

```bash
claude mcp add apple-messages -- npx @zyx1121/apple-messages-mcp
```

## Prerequisites

- macOS with Messages.app configured
- Node.js >= 18
- First run will prompt for Automation permission (System Settings > Privacy & Security > Automation)
- Reading messages requires Full Disk Access (System Settings > Privacy & Security > Full Disk Access)

## Tools

| Tool | Description |
|------|-------------|
| `messages_send` | Send an iMessage to a phone number or email |
| `messages_list_chats` | List recent chats/conversations |
| `messages_read` | Read recent messages from a specific chat or contact |
| `messages_search` | Search messages by keyword |

## Examples

```
"Send 'hello' to +886912345678" → messages_send { to: "+886912345678", message: "hello" }
"Show my recent chats" → messages_list_chats {}
"Read messages from John" → messages_read { contact: "john@example.com" }
"Search for 'meeting'" → messages_search { query: "meeting" }
```

## Limitations

- macOS only (uses AppleScript via `osascript` and `sqlite3`)
- Sending uses AppleScript — Messages.app must be running
- Reading uses `~/Library/Messages/chat.db` — requires Full Disk Access

## License

[MIT](LICENSE) — read at your own risk
