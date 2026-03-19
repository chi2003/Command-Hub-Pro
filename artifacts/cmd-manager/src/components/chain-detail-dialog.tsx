import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CommandChain } from "@/lib/store";
import { Layers, Copy, Check, Edit2, Play, ListOrdered, Pencil } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryBadge } from "@/components/category-badge";
import { ShellIcon } from "@/components/shell-icon";

type ChainDetailDialogProps = {
  chain: CommandChain | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (chain: CommandChain) => void;
  onRun?: (chain: CommandChain) => void;
};

function CopyableCommand({ command, amber = false }: { command: string; amber?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={`relative group rounded-lg border overflow-hidden ${amber ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[#0D1117] border-border/30'}`}>
      <pre className={`p-3 pr-12 text-xs font-mono whitespace-pre-wrap break-all leading-relaxed ${amber ? 'text-amber-200/80' : 'text-blue-300'}`}>
        {command}
      </pre>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        className="absolute top-1.5 right-1.5 h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
}

export function ChainDetailDialog({ chain, open, onOpenChange, onEdit, onRun }: ChainDetailDialogProps) {
  if (!chain) return null;

  const lastIndex = chain.steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col glass rounded-2xl border-border/50 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-background/50 shrink-0">
          <div className="flex items-start gap-3">
            <ShellIcon shell={chain.shell} />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl leading-tight">{chain.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{chain.description}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <CategoryBadge category={chain.category} />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ListOrdered className="w-3 h-3" /> {chain.steps.length} steps
                </span>
                {chain.steps.length > 1 && (
                  <span className="text-xs text-amber-400/70 flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Last step pastes
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 pb-2">
            {chain.steps.map((step, index) => {
              const isLast = index === lastIndex && chain.steps.length > 1;
              return (
                <div key={step.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isLast
                      ? <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0"><Pencil className="w-3 h-3" /></span>
                      : <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                    }
                    <p className="text-sm font-medium text-foreground">{step.prefix}</p>
                  </div>
                  <div className="pl-8">
                    <CopyableCommand command={step.command} amber={isLast} />
                  </div>
                  {isLast && (
                    <p className="pl-8 text-[11px] text-amber-400/60 leading-relaxed">
                      Paste this into your terminal after the steps above complete. Fill in any placeholders before pressing Enter.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="px-6 pb-6 pt-4 border-t border-border/30 flex items-center justify-end gap-3 shrink-0">
          {onEdit && (
            <Button variant="outline" onClick={() => { onOpenChange(false); onEdit(chain); }} className="rounded-xl border-border/50">
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
          {onRun && (
            <Button onClick={() => { onOpenChange(false); onRun(chain); }} className="rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover-elevate">
              <Play className="w-4 h-4 mr-2" /> Run Workflow
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
