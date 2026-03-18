import { useState } from "react";
import { useCommands, useDeleteCommand } from "@/hooks/use-commands";
import { Command } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Search, Terminal, MoreVertical, Edit2, Trash2, Play, ShieldAlert, Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandFormDialog } from "@/components/command-form-dialog";
import { RunCommandDialog } from "@/components/run-command-dialog";
import { DetailDialog } from "@/components/detail-dialog";
import { CategoryBadge } from "@/components/category-badge";
import { CategoryFilter } from "@/components/category-filter";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandsPage() {
  const { data: commands = [], isLoading } = useCommands();
  const deleteMutation = useDeleteCommand();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [runOpen, setRunOpen] = useState(false);
  const [runningCommand, setRunningCommand] = useState<Command | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCommand, setDetailCommand] = useState<Command | null>(null);

  const filteredCommands = commands.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleAdd = () => { setEditingCommand(null); setFormOpen(true); };
  const handleEdit = (cmd: Command) => { setEditingCommand(cmd); setFormOpen(true); };
  const handleRun = (cmd: Command) => { setRunningCommand(cmd); setRunOpen(true); };
  const handleDetail = (cmd: Command) => { setDetailCommand(cmd); setDetailOpen(true); };
  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this command?")) await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Commands</h1>
          <p className="text-muted-foreground mt-1">Manage your individual Windows commands.</p>
        </div>
        <Button onClick={handleAdd} className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover-elevate px-6">
          <Plus className="w-5 h-5 mr-2" /> New Command
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search commands..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 rounded-xl bg-card border-border/50 shadow-sm h-12 text-base focus-visible:ring-primary/20"
          />
        </div>
        <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredCommands.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card/30 rounded-2xl border border-dashed border-border/50">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 text-muted-foreground">
            <Terminal className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold">No commands found</h3>
          <p className="text-muted-foreground max-w-sm mt-1 mb-4">
            {search || categoryFilter !== "all" ? "Try adjusting your search or category filter." : "Get started by adding your first reusable command."}
          </p>
          {!search && categoryFilter === "all" && (
            <Button variant="outline" onClick={handleAdd} className="rounded-xl">Add Command</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
          <AnimatePresence>
            {filteredCommands.map((cmd) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={cmd.id}
                onClick={() => handleDetail(cmd)}
                className="group bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md hover:border-border transition-all duration-300 flex flex-col h-full relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg text-foreground">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-1">{cmd.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg -mr-2 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 glass rounded-xl border-border/50">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(cmd); }} className="rounded-lg m-1 cursor-pointer">
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/50 mx-2" />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(cmd.id); }} className="rounded-lg m-1 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1 relative z-10">
                  {cmd.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto relative z-10 gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={cmd.category} />
                    {cmd.requiresAdmin && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 rounded-lg px-2 py-0.5">
                        <ShieldAlert className="w-3 h-3" /> Admin
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={e => { e.stopPropagation(); handleRun(cmd); }}
                    className="rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
                  >
                    <Play className="w-4 h-4 mr-1.5" /> Run
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <CommandFormDialog open={formOpen} onOpenChange={setFormOpen} command={editingCommand} />
      <RunCommandDialog open={runOpen} onOpenChange={setRunOpen} command={runningCommand} />
      <DetailDialog open={detailOpen} onOpenChange={setDetailOpen} command={detailCommand} onEdit={handleEdit} onRun={handleRun} />
    </div>
  );
}
