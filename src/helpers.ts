import { execFile } from "node:child_process";

const TIMEOUT_MS = 30_000;

export class AppleMessagesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppleMessagesError";
  }
}

export async function runAppleScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("osascript", ["-e", script], { timeout: TIMEOUT_MS }, (err, stdout, stderr) => {
      if (err) {
        const msg = stderr || err.message;
        if (msg.includes("not running") || msg.includes("-600"))
          return reject(new AppleMessagesError("Messages.app is not running. Please open Messages and try again."));
        if (msg.includes("not allowed") || msg.includes("not permitted"))
          return reject(new AppleMessagesError("Permission denied. Grant automation access in System Settings > Privacy & Security > Automation."));
        if (msg.includes("timed out") || (err as NodeJS.ErrnoException).code === "ETIMEDOUT")
          return reject(new AppleMessagesError("AppleScript execution timed out."));
        return reject(new AppleMessagesError(msg.trim()));
      }
      resolve(stdout.trimEnd());
    });
  });
}

export function escapeForAppleScript(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function runSqlite(dbPath: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("sqlite3", ["-json", dbPath, query], { timeout: TIMEOUT_MS }, (err, stdout, stderr) => {
      if (err) {
        const msg = stderr || err.message;
        if (msg.includes("unable to open"))
          return reject(new AppleMessagesError("Cannot open chat.db. Grant Full Disk Access in System Settings > Privacy & Security > Full Disk Access."));
        return reject(new AppleMessagesError(msg.trim()));
      }
      resolve(stdout.trimEnd());
    });
  });
}

export function success(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function error(message: string) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
    isError: true as const,
  };
}

export function withErrorHandling<T extends Record<string, unknown>>(
  fn: (args: T) => Promise<ReturnType<typeof success | typeof error>>,
) {
  return async (args: T) => {
    try {
      return await fn(args);
    } catch (e) {
      if (e instanceof AppleMessagesError) return error(e.message);
      throw e;
    }
  };
}
