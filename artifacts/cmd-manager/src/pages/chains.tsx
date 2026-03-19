import { useState } from "react";
import { useChains, useDeleteChain } from "@/hooks/use-chains";
import { CommandChain } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Edit2, Trash2, Play, Loader2, ListOrdered, Pencil } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChainFormDialog } from "@/components/chain-form-dialog";
import { RunChainDialog } from "@/components/run-chain-dialog";
import { ChainDetailDialog } from "@/components/chain-detail-dialog";
import { CategoryBadge } from "@/components/category-badge";
import { CategoryFilter } from "@/components/category-filter";
import { ShellIcon } from "@/components/shell-icon";
import { motion, AnimatePresence } from "framer-motion";

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
  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this chain workflow?")) await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Chains</h1>
          <p className="text-muted-foreground mt-1">Multi-step workflows — last step pastes to terminal for manual completion.</p>
        </div>
        <Button onClick={handleAdd} className="rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover-elevate px-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 auto-rows-max">
          <AnimatePresence>
            {filteredChains.map((chain) => (
              <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                key={chain.id} onClick={() => handleDetail(chain)}
                className="group bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="flex items-center gap-4">
                    <ShellIcon shell={chain.shell} />
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{chain.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-2">
                        <span className="flex items-center gap-1"><ListOrdered className="w-3 h-3" /> {chain.steps.length} Steps</span>
                        {chain.steps.length > 1 && (
                          <span className="flex items-center gap-1 text-amber-400/70">
                            <Pencil className="w-3 h-3" /> Last step pastes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg -mr-2 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 glass rounded-xl border-border/50">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(chain); }} className="rounded-lg m-1 cursor-pointer">
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/50 mx-2" />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(chain.id); }} className="rounded-lg m-1 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground mb-5 line-clamp-2 relative z-10 pl-[52px]">{chain.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto relative z-10 gap-3">
                  <CategoryBadge category={chain.category} />
                  <Button onClick={e => { e.stopPropagation(); handleRun(chain); }}
                    className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm shadow-accent/20 hover-elevate" size="sm">
                    <Play className="w-4 h-4 mr-2" /> Run Workflow
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ChainFormDialog open={formOpen} onOpenChange={setFormOpen} chain={editingChain} />
      <RunChainDialog open={runOpen} onOpenChange={setRunOpen} chain={runningChain} />
      <ChainDetailDialog open={detailOpen} onOpenChange={setDetailOpen} chain={detailChain} onEdit={handleEdit} onRun={handleRun} />
    </div>
  );
}
