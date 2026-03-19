import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command } from "@/lib/store";
import { ShieldAlert, Copy, Check, Edit2, Play } from "lucide-react";
import { useState } from "react";
import { CategoryBadge } from "@/components/category-badge";
import { ShellIcon } from "@/components/shell-icon";

type DetailDialogProps = {
  command: Command | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (cmd: Command) => void;
  onRun?: (cmd: Command) => void;
};

export function DetailDialog({ command, open, onOpenChange, onEdit, onRun }: DetailDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!command) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(command.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] glass rounded-2xl border-border/50 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-background/50">
          <div className="flex items-start gap-3">
            <ShellIcon shell={command.shell} />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl leading-tight">{command.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <CategoryBadge category={command.category} />
                {command.requiresAdmin && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 rounded-lg px-2 py-0.5 text-xs">
                    <ShieldAlert className="w-3 h-3" /> Requires Administrator
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</p>
            <p className="text-sm text-foreground/90 leading-relaxed">{command.description}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Command</p>
            <div className="relative group rounded-xl bg-[#0D1117] border border-border/30 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-2.5 bg-gray-900/80 border-b border-gray-800">
                <span className="text-xs font-mono text-gray-400">
                  {command.shell === "powershell" ? "PowerShell" : command.shell === "both" ? "CMD / PowerShell" : "Command Prompt"}
                </span>
                <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-4 text-sm font-mono text-blue-300 whitespace-pre-wrap break-all leading-relaxed">
                {command.command}
              </pre>
            </div>
            {command.requiresAdmin && (
              <p className="text-xs text-amber-500/80 mt-2 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Run in an elevated (Administrator) terminal.
              </p>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          {onEdit && (
            <Button variant="outline" onClick={() => { onOpenChange(false); onEdit(command); }} className="rounded-xl border-border/50">
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
          {onRun && (
            <Button onClick={() => { onOpenChange(false); onRun(command); }} className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover-elevate">
              <Play className="w-4 h-4 mr-2" /> Run
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
