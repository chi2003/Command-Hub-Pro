import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command } from "@/lib/store";
import { Terminal, Copy, ShieldAlert, Check, Monitor } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type RunCommandDialogProps = {
  command: Command | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ShellChoice = "cmd" | "powershell";

export function RunCommandDialog({ command, open, onOpenChange }: RunCommandDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const defaultShell: ShellChoice =
    command?.shell === "powershell" ? "powershell" : "cmd";
  const [selectedShell, setSelectedShell] = useState<ShellChoice>(defaultShell);

  const activeShell: ShellChoice =
    command?.shell === "both" ? selectedShell : defaultShell;

  if (!command) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command.command);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: `Paste into ${activeShell === "powershell" ? "PowerShell" : "Command Prompt"} to run.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: "destructive", title: "Failed to copy", description: "Please copy the text manually." });
    }
  };

  const isPS = activeShell === "powershell";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] glass border-border/50 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl ${isPS ? "bg-[#012456]/60 text-[#2795d9]" : "bg-white/5 text-gray-300"}`}>
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">{command.name}</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-base">
                {command.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {command.requiresAdmin && (
            <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span><strong>Requires Administrator privileges.</strong> Run the terminal as Administrator before pasting.</span>
            </div>
          )}

          {/* Shell selector — only when shell is "both" */}
          {command.shell === "both" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">Open in:</span>
              <button
                onClick={() => setSelectedShell("cmd")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                  ${selectedShell === "cmd"
                    ? "bg-[#1E1E1E] text-gray-200 border-white/20"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/70"}`}
              >
                <span className="font-mono text-[11px]">\_</span> CMD
              </button>
              <button
                onClick={() => setSelectedShell("powershell")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                  ${selectedShell === "powershell"
                    ? "bg-[#012456] text-[#2795d9] border-blue-900/60"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/70"}`}
              >
                <span className="font-mono text-[11px] text-[#2795d9]">&gt;_</span> PowerShell
              </button>
            </div>
          )}

          {/* Terminal preview */}
          <div className="relative group">
            <div className={`absolute inset-0 rounded-xl blur-xl transition-opacity opacity-0 group-hover:opacity-100 duration-500 -z-10
              ${isPS ? "bg-gradient-to-r from-blue-900/20 to-cyan-900/10" : "bg-gradient-to-r from-white/5 to-white/5"}`} />

            {isPS ? (
              /* PowerShell terminal */
              <div className="bg-[#012456] text-gray-200 p-5 rounded-xl border border-blue-900/40 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
                <div className="flex text-blue-400/60 mb-2 select-none border-b border-blue-900/40 pb-2 text-xs">
                  Windows PowerShell
                </div>
                <div className="flex">
                  <span className="text-[#2795d9] mr-2 shrink-0 select-none">PS C:\&gt;</span>
                  <span className="text-blue-100 font-medium whitespace-pre-wrap break-all">{command.command}</span>
                </div>
              </div>
            ) : (
              /* CMD terminal */
              <div className="bg-[#0C0C0C] text-gray-200 p-5 rounded-xl border border-white/10 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
                <div className="flex text-gray-500 mb-2 select-none border-b border-white/10 pb-2 text-xs">
                  Command Prompt
                </div>
                <div className="flex">
                  <span className="text-gray-400 mr-2 shrink-0 select-none">C:\&gt;</span>
                  <span className="text-gray-100 font-medium whitespace-pre-wrap break-all">{command.command}</span>
                </div>
              </div>
            )}
          </div>

          {/* How to run instructions */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/40 p-3 rounded-lg border border-border/40">
            <Monitor className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {isPS
                ? "Open PowerShell (search Start Menu for \"PowerShell\"), paste the command, and press Enter."
                : "Open Command Prompt (Win + R → cmd → Enter), paste the command, and press Enter."}
              {command.requiresAdmin && " Right-click the terminal icon and choose Run as administrator."}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-border/50">
              Close
            </Button>
            <Button
              onClick={handleCopy}
              className={`rounded-xl shadow-lg hover-elevate flex items-center justify-center
                ${isPS
                  ? "bg-[#012456] text-[#2795d9] hover:bg-[#013a7a] border border-blue-900/50 shadow-blue-900/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"}`}
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : `Copy for ${isPS ? "PowerShell" : "CMD"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
