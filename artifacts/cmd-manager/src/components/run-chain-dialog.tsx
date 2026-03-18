import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CommandChain } from "@/lib/store";
import { Layers, Copy, Check, Pencil } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

type RunChainDialogProps = {
  chain: CommandChain | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RunChainDialog({ chain, open, onOpenChange }: RunChainDialogProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSteps, setCopiedSteps] = useState(false);
  const [copiedSuffix, setCopiedSuffix] = useState(false);
  const { toast } = useToast();

  if (!chain) return null;

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

  const handleCopySteps = async () => {
    const stepsText = chain.steps.map(s => s.command).join('\n');
    try {
      await navigator.clipboard.writeText(stepsText);
      setCopiedSteps(true);
      toast({ title: "Steps copied", description: "Paste into terminal and run in order." });
      setTimeout(() => setCopiedSteps(false), 2000);
    } catch {
      toast({ variant: "destructive", title: "Copy failed" });
    }
  };

  const handleCopySuffix = async () => {
    if (!chain.suffix) return;
    try {
      await navigator.clipboard.writeText(chain.suffix);
      setCopiedSuffix(true);
      toast({ title: "Suffix template copied", description: "Paste into terminal and fill in placeholders." });
      setTimeout(() => setCopiedSuffix(false), 2000);
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
              
              {chain.steps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-sm shadow-primary/20 z-10">
                    <span className="text-[10px] font-bold text-primary">{index + 1}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    {step.prefix}
                  </h4>
                  
                  <div className="relative group">
                    <div className="bg-[#0D1117] rounded-xl border border-gray-800 overflow-hidden">
                      <div className="flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
                        <span className="text-xs font-mono text-gray-400">Command Prompt</span>
                        <button 
                          onClick={() => handleCopySingle(step.command, step.id)}
                          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                        >
                          {copiedId === step.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="p-4 font-mono text-sm overflow-x-auto text-blue-300">
                        <span className="text-green-400 mr-2 select-none">&gt;</span>
                        {step.command}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {chain.suffix && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-background border-2 border-amber-500/60 flex items-center justify-center z-10">
                    <Pencil className="w-3 h-3 text-amber-400" />
                  </div>
                  
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-500/20 bg-amber-500/10">
                      <div className="flex items-center gap-2">
                        <Pencil className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">Paste &amp; Complete Manually</span>
                      </div>
                      <button
                        onClick={handleCopySuffix}
                        className="text-amber-400/70 hover:text-amber-300 transition-colors flex items-center gap-1 text-xs"
                      >
                        {copiedSuffix ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copiedSuffix ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="p-4 font-mono text-sm text-amber-300/80 whitespace-pre-wrap break-all">
                      <span className="text-amber-500/50 mr-2 select-none">&gt;</span>
                      {chain.suffix}
                    </div>
                    <div className="px-4 py-2.5 border-t border-amber-500/15">
                      <p className="text-[11px] text-amber-400/60 leading-relaxed">
                        After the steps above complete, paste this into your terminal. Fill in any placeholders (e.g. <code className="bg-amber-500/10 px-1 rounded">{"{ShadowID}"}</code>) using output from the previous steps, then press Enter.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-border/50 bg-background/50 flex justify-end gap-3 mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-border/50">
            Close
          </Button>
          <Button onClick={handleCopySteps} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover-elevate">
            {copiedSteps ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copiedSteps ? "Steps Copied!" : "Copy Steps"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
