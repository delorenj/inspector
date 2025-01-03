import { useState } from "react";
import { Play, ChevronDown, ChevronRight, CircleHelp, Bug, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StdErrNotification } from "@/lib/notificationTypes";

import useTheme from "../lib/useTheme";
import { version } from "../../../package.json";

interface SidebarProps {
  connectionStatus: "disconnected" | "connected" | "error";
  transportType: "stdio" | "sse";
  setTransportType: (type: "stdio" | "sse") => void;
  command: string;
  setCommand: (command: string) => void;
  args: string;
  setArgs: (args: string) => void;
  sseUrl: string;
  setSseUrl: (url: string) => void;
  env: Record<string, string>;
  setEnv: (env: Record<string, string>) => void;
  onConnect: () => void;
  stdErrNotifications: StdErrNotification[];
}

const Sidebar = ({
  connectionStatus,
  transportType,
  setTransportType,
  command,
  setCommand,
  args,
  setArgs,
  sseUrl,
  setSseUrl,
  env,
  setEnv,
  onConnect,
  stdErrNotifications,
}: SidebarProps) => {
  const [theme, setTheme] = useTheme();
  const [showEnvVars, setShowEnvVars] = useState(false);

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="ml-2 text-lg font-semibold">
            MCP Inspector v{version}
          </h1>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Transport Type</label>
            <Select
              value={transportType}
              onValueChange={(value: "stdio" | "sse") =>
                setTransportType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transport type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stdio">STDIO</SelectItem>
                <SelectItem value="sse">SSE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transportType === "stdio" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Command</label>
                <Input
                  placeholder="Command"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Arguments</label>
                <Input
                  placeholder="Arguments (space-separated)"
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  className="font-mono"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input
                placeholder="URL"
                value={sseUrl}
                onChange={(e) => setSseUrl(e.target.value)}
                className="font-mono"
              />
            </div>
          )}
          {transportType === "stdio" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEnvVars(!showEnvVars)}
                  className="flex items-center flex-1"
                >
                  {showEnvVars ? (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2" />
                  )}
                  Environment Variables
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.env';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          const text = await file.text();
                          const newEnv = text.split('\n').reduce((acc, line) => {
                            const [key, value] = line.split('=');
                            if (key && value) {
                              acc[key.trim()] = value.trim();
                            }
                            return acc;
                          }, {} as Record<string, string>);
                          setEnv(newEnv);
                        } catch (error) {
                          console.error('Error importing .env file:', error);
                        }
                      }
                    };
                    input.click();
                  }}
                  title="Import .env file"
                >
                  Import
                </Button>
              </div>
              {showEnvVars && (
                <div className="space-y-2">
                  {Object.entries(env).map(([key, value], idx) => (
                    <div key={idx} className="grid grid-cols-[1fr,auto] gap-2">
                      <div className="space-y-1">
                        <Input
                          placeholder="Key"
                          value={key}
                          onChange={(e) => {
                            const newEnv = { ...env };
                            delete newEnv[key];
                            newEnv[e.target.value] = value;
                            setEnv(newEnv);
                          }}
                          className="font-mono"
                        />
                        <Input
                          placeholder="Value"
                          value={value}
                          onChange={(e) => {
                            const newEnv = { ...env };
                            newEnv[key] = e.target.value;
                            setEnv(newEnv);
                          }}
                          className="font-mono"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { [key]: removed, ...rest } = env;
                          setEnv(rest);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newEnv = { ...env };
                      newEnv[""] = "";
                      setEnv(newEnv);
                    }}
                  >
                    Add Environment Variable
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Button className="w-full" onClick={onConnect}>
              <Play className="w-4 h-4 mr-2" />
              Connect
            </Button>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "error"
                      ? "bg-red-500"
                      : "bg-gray-500"
                }`}
              />
              <span className="text-sm text-gray-600">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "error"
                    ? "Connection Error"
                    : "Disconnected"}
              </span>
            </div>
            {stdErrNotifications.length > 0 && (
              <>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium">
                    Error output from MCP server
                  </h3>
                  <div className="mt-2 max-h-80 overflow-y-auto">
                    {stdErrNotifications.map((notification, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-500 font-mono py-2 border-b border-gray-200 last:border-b-0"
                      >
                        {notification.params.content}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <Select
            value={theme}
            onValueChange={(value: string) =>
              setTheme(value as "system" | "light" | "dark")
            }
          >
            <SelectTrigger className="w-[100px]" id="theme-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <a href="https://modelcontextprotocol.io/docs/tools/inspector" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" title="Inspector Documentation">
                <CircleHelp className="w-4 h-4 text-gray-800" />
              </Button>
            </a>
            <a href="https://modelcontextprotocol.io/docs/tools/debugging" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" title="Debugging Guide">
                <Bug className="w-4 h-4 text-gray-800" />
              </Button>
            </a>
            <a href="https://github.com/modelcontextprotocol/inspector" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" title="Report bugs or contribute on GitHub">
                <Github className="w-4 h-4 text-gray-800" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
