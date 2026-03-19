import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CommandChain } from "@/lib/store";
import { Layers, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

type RunChainDialogProps = {
  chain: CommandChain | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RunChainDialog({ chain, open, onOpenChange }: RunChainDialogProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && chain && chain.steps.length > 0) {
      const lastStep = chain.steps[chain.steps.length - 1];
      navigator.clipboard.writeText(lastStep.command)
        .then(() => {
          setCopiedId(lastStep.id);
          toast({
            title: "Last step copied to clipboard",
            description: "Paste it into your terminal after the previous steps complete.",
          });
          setTimeout(() => setCopiedId(null), 3000);
        })
        .catch(() => {});
    }
  }, [open, chain]);

  if (!chain) return null;

  const lastIndex = chain.steps.length - 1;

  const handleCopySingle = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({ title: "Command copied" });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ variant: "destructive", title: "Copy failed" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col glass border-border/50 rounded-2xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent/20 text-accent-foreground rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">{chain.name}</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {chain.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-border/60">
              {chain.steps.map((step, index) => {
                const isLast = index === lastIndex;
                return (
                  <div key={step.id} className="relative">
                    <div className={`absolute -left-[25px] top-1 w-6 h-6 rounded-full bg-background border-2 flex items-center justify-center shadow-sm z-10 ${isLast ? 'border-accent/60 shadow-accent/20' : 'border-primary shadow-primary/20'}`}>
                      <span className={`text-[10px] font-bold ${isLast ? 'text-accent' : 'text-primary'}`}>{index + 1}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-foreground mb-3">{step.prefix}</h4>

                    <div className="relative group">
                      <div className="bg-[#0D1117] rounded-xl border border-gray-800 overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
                          <span className="text-xs font-mono text-gray-400">
                            {chain.shell === "powershell" ? "PowerShell" : "Command Prompt"}
                            {isLast && <span className="ml-2 text-accent/80 text-[11px]">— auto-copied to clipboard</span>}
                          </span>
                          <button
                            onClick={() => handleCopySingle(step.command, step.id)}
                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                          >
                            {copiedId === step.id
                              ? <Check className="w-3 h-3 text-green-400" />
                              : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="p-4 font-mono text-sm overflow-x-auto text-blue-300">
                          <span className="text-green-400 mr-2 select-none">&gt;</span>
                          {step.command}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-border/50 bg-background/50 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-border/50">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
