import { useState } from "react";
import { useGroups, useDeleteGroup } from "@/hooks/use-groups";
import { useCommands } from "@/hooks/use-commands";
import { useChains } from "@/hooks/use-chains";
import { useRegistryCommands } from "@/hooks/use-registry";
import { Group } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FolderKanban, MoreVertical, Edit2, Trash2, Terminal, Layers, DatabaseZap, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GroupFormDialog } from "@/components/group-form-dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupsPage() {
  const { data: groups = [], isLoading } = useGroups();
  const { data: commands = [] } = useCommands();
  const { data: chains = [] } = useChains();
  const { data: registryCommands = [] } = useRegistryCommands();
  const deleteMutation = useDeleteGroup();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => { setEditingGroup(null); setFormOpen(true); };
  const handleEdit = (g: Group) => { setEditingGroup(g); setFormOpen(true); };
  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this group?")) await deleteMutation.mutateAsync(id);
  };
  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const getGroupItems = (group: Group) => ({
    commands: commands.filter(c => group.commandIds.includes(c.id)),
    chains: chains.filter(c => group.chainIds.includes(c.id)),
    registry: registryCommands.filter(c => group.registryIds.includes(c.id)),
  });

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Groups</h1>
          <p className="text-muted-foreground mt-1">Organize commands, chains, and registry items into collections.</p>
        </div>
        <Button onClick={handleAdd} className="rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-600 hover-elevate px-6">
          <Plus className="w-5 h-5 mr-2" /> New Group
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-11 rounded-xl bg-card border-border/50 shadow-sm h-12 text-base focus-visible:ring-primary/20" />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card/30 rounded-2xl border border-dashed border-border/50">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 text-muted-foreground">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold">No groups yet</h3>
          <p className="text-muted-foreground max-w-sm mt-1 mb-4">
            {search ? "No groups match your search." : "Create a group to bundle related commands, chains, and registry items together."}
          </p>
          {!search && <Button variant="outline" onClick={handleAdd} className="rounded-xl">Create First Group</Button>}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredGroups.map(group => {
              const items = getGroupItems(group);
              const totalCount = items.commands.length + items.chains.length + items.registry.length;
              const isExpanded = expandedId === group.id;

              return (
                <motion.div key={group.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.18 }}
                  className="bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  
                  {/* Group header */}
                  <div className="flex items-center gap-4 p-5 cursor-pointer select-none" onClick={() => toggleExpand(group.id)}>
                    <div className="p-2.5 bg-purple-400/10 text-purple-400 rounded-xl shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg leading-tight truncate">{group.name}</h3>
                        {totalCount > 0 && (
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">{totalCount} item{totalCount !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{group.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {items.commands.length > 0 && <CountBadge icon={<Terminal className="w-3 h-3" />} count={items.commands.length} label="Commands" color="text-purple-400" />}
                        {items.chains.length > 0 && <CountBadge icon={<Layers className="w-3 h-3" />} count={items.chains.length} label="Chains" color="text-purple-400" />}
                        {items.registry.length > 0 && <CountBadge icon={<DatabaseZap className="w-3 h-3" />} count={items.registry.length} label="Registry" color="text-orange-400" />}
                        {totalCount === 0 && <span className="text-xs text-muted-foreground italic">Empty group</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 glass rounded-xl border-border/50">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(group); }} className="rounded-lg m-1 cursor-pointer">
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/50 mx-2" />
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(group.id); }} className="rounded-lg m-1 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="text-muted-foreground">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded content — segmented by type */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-border/50">
                        <div className="p-5 space-y-4">
                          {items.commands.length > 0 && (
                            <ItemSection
                              title="Commands" icon={<Terminal className="w-4 h-4 text-purple-400" />}
                              headerClass="bg-purple-400/5 border-purple-400/20 text-purple-400"
                              items={items.commands.map(c => ({ id: c.id, name: c.name, detail: c.command }))}
                            />
                          )}
                          {items.chains.length > 0 && (
                            <ItemSection
                              title="Command Chains" icon={<Layers className="w-4 h-4 text-purple-400" />}
                              headerClass="bg-purple-400/5 border-purple-400/20 text-purple-400"
                              items={items.chains.map(c => ({ id: c.id, name: c.name, detail: `${c.steps.length} step${c.steps.length !== 1 ? 's' : ''}` }))}
                            />
                          )}
                          {items.registry.length > 0 && (
                            <ItemSection
                              title="Registry Commands" icon={<DatabaseZap className="w-4 h-4 text-orange-400" />}
                              headerClass="bg-orange-400/5 border-orange-400/20 text-orange-400"
                              items={items.registry.map(c => ({ id: c.id, name: c.name, detail: c.command.substring(0, 50) + (c.command.length > 50 ? '…' : '') }))}
                            />
                          )}
                          {totalCount === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4 italic">This group has no items. Click Edit to add some.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <GroupFormDialog open={formOpen} onOpenChange={setFormOpen} group={editingGroup} />
    </div>
  );
}

function CountBadge({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${color} opacity-80`}>
      {icon} {count} {label}
    </span>
  );
}

function ItemSection({ title, icon, headerClass, items }: {
  title: string;
  icon: React.ReactNode;
  headerClass: string;
  items: { id: string; name: string; detail?: string }[];
}) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-border/30 ${headerClass}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        <span className="ml-auto text-xs opacity-60">{items.length}</span>
      </div>
      <div className="divide-y divide-border/30">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm font-medium">{item.name}</span>
            {item.detail && (
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[220px] ml-4">{item.detail}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
