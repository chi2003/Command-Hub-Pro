import { useState } from "react";
import { useChains, useDeleteChain } from "@/hooks/use-chains";
import { CommandChain } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Play, Loader2, ListOrdered } from "lucide-react";
import { ChainFormDialog } from "@/components/chain-form-dialog";
import { RunChainDialog } from "@/components/run-chain-dialog";
import { ChainDetailDialog } from "@/components/chain-detail-dialog";
import { CategoryBadge } from "@/components/category-badge";
import { CategoryFilter } from "@/components/category-filter";
import { ShellIcon } from "@/components/shell-icon";
import { motion, AnimatePresence } from "framer-motion";

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-400/40 text-yellow-100 rounded px-0.5 align-baseline">{part}</span>
        ) : part
      )}
    </>
  );
}

export default function ChainsPage() {
  const { data: chains = [], isLoading } = useChains();
  const deleteMutation = useDeleteChain();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<CommandChain | null>(null);
  const [runOpen, setRunOpen] = useState(false);
  const [runningChain, setRunningChain] = useState<CommandChain | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailChain, setDetailChain] = useState<CommandChain | null>(null);

  const filteredChains = chains.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleAdd = () => { setEditingChain(null); setFormOpen(true); };
  const handleEdit = (chain: CommandChain) => { setEditingChain(chain); setFormOpen(true); };
  const handleRun = (chain: CommandChain) => { setRunningChain(chain); setRunOpen(true); };
  const handleDetail = (chain: CommandChain) => { setDetailChain(chain); setDetailOpen(true); };
  const handleDelete = async (id: string) => { await deleteMutation.mutateAsync(id); };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Chains</h1>
          <p className="text-muted-foreground mt-1">Multi-step workflows for sequential command execution.</p>
        </div>
        <Button onClick={handleAdd} className="rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover-elevate px-6 flex items-center justify-center">
          <Plus className="w-5 h-5 mr-2" /> New Chain
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search chains..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-11 rounded-xl bg-card border-border/50 shadow-sm h-12 text-base focus-visible:ring-accent/20" />
        </div>
        <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
      ) : filteredChains.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card/30 rounded-2xl border border-dashed border-border/50">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 text-muted-foreground">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold">No chains found</h3>
          <p className="text-muted-foreground max-w-sm mt-1 mb-4">
            {search || categoryFilter !== "all" ? "Try adjusting your search or category filter." : "Create workflows to automate multiple commands in sequence."}
          </p>
          {!search && categoryFilter === "all" && (
            <Button variant="outline" onClick={handleAdd} className="rounded-xl border-accent text-accent hover:bg-accent hover:text-accent-foreground">Add Command Chain</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
          <AnimatePresence>
            {filteredChains.map((chain) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
                key={chain.id}
                onClick={() => handleDetail(chain)}
                className="group bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-shadow duration-300 flex flex-col h-full relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-center mb-3 relative z-10 gap-3">
                  <ShellIcon shell={chain.shell} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base line-clamp-1">{highlightMatch(chain.name, search)}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-1">
                      <ListOrdered className="w-3 h-3" />
                      <span>{chain.steps.length} Steps</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1 relative z-10">
                  {highlightMatch(chain.description, search)}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto relative z-10 gap-3">
                  <CategoryBadge category={chain.category} />
                  <Button onClick={e => { e.stopPropagation(); handleRun(chain); }}
                    className="rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shrink-0 flex items-center justify-center" size="sm">
                    <Play className="w-4 h-4 mr-1.5" /> Run Chain
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ChainFormDialog open={formOpen} onOpenChange={setFormOpen} chain={editingChain} />
      <RunChainDialog open={runOpen} onOpenChange={setRunOpen} chain={runningChain} />
      <ChainDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        chain={detailChain}
        onEdit={handleEdit}
        onRun={handleRun}
        onDelete={(id) => { setDetailOpen(false); handleDelete(id); }}
      />
    </div>
  );
}
