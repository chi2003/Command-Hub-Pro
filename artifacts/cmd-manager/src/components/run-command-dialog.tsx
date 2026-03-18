import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command } from "@/lib/store";
import { Terminal, Copy, ShieldAlert, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type RunCommandDialogProps = {
  command: Command | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RunCommandDialog({ command, open, onOpenChange }: RunCommandDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!command) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command.command);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Command is ready to paste into terminal.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy the text manually.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] glass border-border/50 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
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

        <div className="mt-4 space-y-4">
          {command.requiresAdmin && (
            <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>
                <strong>Requires Administrator privileges.</strong> In the desktop app, this automatically opens an elevated terminal.
              </span>
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-xl transition-opacity opacity-0 group-hover:opacity-100 duration-500 -z-10"></div>
            <div className="bg-[#0D1117] text-gray-300 p-5 rounded-xl border border-border/50 font-mono text-sm leading-relaxed overflow-x-auto relative z-0 shadow-inner">
              <div className="flex text-muted-foreground mb-2 select-none border-b border-gray-800 pb-2">
                <span>Windows PowerShell</span>
              </div>
              <div className="flex">
                <span className="text-green-400 mr-2 shrink-0 select-none">PS C:\&gt;</span>
                <span className="text-blue-300 font-medium whitespace-pre-wrap break-all">
                  {command.command}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-border/50">
              Close
            </Button>
            <Button onClick={handleCopy} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover-elevate">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Command"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
