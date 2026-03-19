import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Group, Command, CommandChain } from "@/lib/store";
import { useCommands } from "@/hooks/use-commands";
import { useChains } from "@/hooks/use-chains";
import { useRegistryCommands } from "@/hooks/use-registry";
import { useCreateGroup, useUpdateGroup } from "@/hooks/use-groups";
import { FolderKanban, Save, Loader2, Terminal, Layers, DatabaseZap, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type GroupFormDialogProps = {
  group?: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GroupFormDialog({ group, open, onOpenChange }: GroupFormDialogProps) {
  const isEditing = !!group;
  const { toast } = useToast();
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: commands = [] } = useCommands();
  const { data: chains = [] } = useChains();
  const { data: registryCommands = [] } = useRegistryCommands();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCommandIds, setSelectedCommandIds] = useState<Set<string>>(new Set());
  const [selectedChainIds, setSelectedChainIds] = useState<Set<string>>(new Set());
  const [selectedRegistryIds, setSelectedRegistryIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      if (group) {
        setName(group.name);
        setDescription(group.description);
        setSelectedCommandIds(new Set(group.commandIds));
        setSelectedChainIds(new Set(group.chainIds));
        setSelectedRegistryIds(new Set(group.registryIds));
      } else {
        setName(""); setDescription(""); setSearch("");
        setSelectedCommandIds(new Set());
        setSelectedChainIds(new Set());
        setSelectedRegistryIds(new Set());
      }
    }
  }, [group, open]);

  const toggleSet = (set: Set<string>, id: string): Set<string> => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  const filteredCommands = commands.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredChains = chains.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredRegistry = registryCommands.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async () => {
    if (!name.trim()) { toast({ variant: "destructive", title: "Name is required" }); return; }
    const data = {
      name: name.trim(),
      description: description.trim(),
      commandIds: Array.from(selectedCommandIds),
      chainIds: Array.from(selectedChainIds),
      registryIds: Array.from(selectedRegistryIds),
    };
    try {
      if (isEditing && group) {
        await updateMutation.mutateAsync({ ...data, id: group.id });
        toast({ title: "Group updated" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Group created" });
      }
      onOpenChange(false);
    } catch {
      toast({ variant: "destructive", title: "Error saving group" });
    }
  };

  const totalSelected = selectedCommandIds.size + selectedChainIds.size + selectedRegistryIds.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 glass rounded-2xl border-border/50 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-background/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>{isEditing ? "Edit Group" : "New Group"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update group details and membership." : "Create a group to organize commands, chains, and registry items together."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-[620px] mx-auto pb-6">
            {/* Name & Description */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Group Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daily Maintenance" className="rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="What is this group for?" className="rounded-xl resize-none h-20" />
              </div>
            </div>

            {/* Selection search */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Select Items</h3>
                {totalSelected > 0 && (
                  <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                    {totalSelected} selected
                  </span>
                )}
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Filter items..." className="pl-9 rounded-xl h-10" />
              </div>

              <div className="space-y-5">
                {/* Commands */}
                <SelectionSection
                  title="Commands"
                  icon={<Terminal className="w-4 h-4 text-primary" />}
                  items={filteredCommands}
                  selectedIds={selectedCommandIds}
                  onToggle={id => setSelectedCommandIds(s => toggleSet(s, id))}
                  accentColor="primary"
                  emptyText="No commands match your search"
                />

                {/* Command Chains */}
                <SelectionSection
                  title="Command Chains"
                  icon={<Layers className="w-4 h-4 text-accent-foreground" />}
                  items={filteredChains}
                  selectedIds={selectedChainIds}
                  onToggle={id => setSelectedChainIds(s => toggleSet(s, id))}
                  accentColor="accent"
                  emptyText="No chains match your search"
                />

                {/* Registry Commands */}
                <SelectionSection
                  title="Registry Commands"
                  icon={<DatabaseZap className="w-4 h-4 text-orange-400" />}
                  items={filteredRegistry}
                  selectedIds={selectedRegistryIds}
                  onToggle={id => setSelectedRegistryIds(s => toggleSet(s, id))}
                  accentColor="orange"
                  emptyText="No registry commands match your search"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-border/50 bg-background/50 flex justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover-elevate">
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isEditing ? "Save Group" : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type SectionItem = { id: string; name: string; description?: string };

function SelectionSection({
  title, icon, items, selectedIds, onToggle, accentColor, emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: SectionItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  accentColor: "primary" | "accent" | "orange";
  emptyText: string;
}) {
  const headerColor = accentColor === "orange" ? "text-orange-400 border-orange-400/20 bg-orange-400/5" 
    : accentColor === "accent" ? "text-accent-foreground border-accent/20 bg-accent/5"
    : "text-primary border-primary/20 bg-primary/5";

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-border/50 ${headerColor}`}>
        {icon}
        <span className="text-sm font-semibold">{title}</span>
        {selectedIds.size > 0 && (
          <span className="ml-auto text-xs opacity-70">{selectedIds.size} selected</span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-3 text-xs text-muted-foreground italic">{emptyText}</div>
      ) : (
        <div className="divide-y divide-border/30 max-h-48 overflow-y-auto">
          {items.map(item => (
            <div key={item.id}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-secondary/50 ${selectedIds.has(item.id) ? 'bg-primary/5' : ''}`}
              onClick={() => onToggle(item.id)}>
              <Checkbox
                checked={selectedIds.has(item.id)}
                onCheckedChange={() => onToggle(item.id)}
                className="mt-0.5 shrink-0"
                onClick={e => e.stopPropagation()}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
