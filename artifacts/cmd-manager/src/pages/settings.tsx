import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStoreData, setStoreData, clearStoreData, AppData } from "@/lib/store";
import {
  CATEGORIES, COLOR_PALETTE, PaletteColor, CustomCategory, BuiltinOverride,
  getCustomCategories, saveCustomCategories,
  getDeletedBuiltinCategories, saveDeletedBuiltinCategories,
  getBuiltinOverrides, saveBuiltinOverrides,
} from "@/lib/categories";
import { CategoryBadge } from "@/components/category-badge";
import { Download, Upload, FileJson, FileSpreadsheet, Trash2, Database, DatabaseZap, Tag, Plus, X, Edit2, Check, FolderKanban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

const COLOR_HEX: Record<PaletteColor, string> = {
  blue:   '#3b82f6', slate:  '#64748b', amber:  '#f59e0b', red:    '#ef4444',
  purple: '#a855f7', cyan:   '#06b6d4', pink:   '#ec4899', green:  '#22c55e',
  orange: '#f97316', yellow: '#eab308', indigo: '#6366f1', teal:   '#14b8a6',
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function commandsToCsv(commands: AppData["commands"]) {
  return Papa.unparse(commands.map(c => ({
    id: c.id, name: c.name, description: c.description, command: c.command,
    requiresAdmin: c.requiresAdmin, category: c.category, shell: c.shell,
  })));
}

function groupsToCsv(groups: AppData["groups"]) {
  return Papa.unparse(groups.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    command_ids: g.commandIds.join('|'),
    chain_ids: g.chainIds.join('|'),
    registry_ids: g.registryIds.join('|'),
  })));
}

function chainsToCsv(chains: AppData["chains"]) {
  const rows: Record<string, string>[] = [];
  for (const chain of chains) {
    if (chain.steps.length === 0) {
      rows.push({ chain_id: chain.id, chain_name: chain.name, chain_description: chain.description, chain_category: chain.category, chain_shell: chain.shell, step_index: "0", step_prefix: "", step_command: "" });
    } else {
      chain.steps.forEach((step, i) => {
        rows.push({ chain_id: chain.id, chain_name: chain.name, chain_description: chain.description, chain_category: chain.category, chain_shell: chain.shell, step_index: String(i), step_prefix: step.prefix, step_command: step.command });
      });
    }
  }
  return Papa.unparse(rows);
}

export default function SettingsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const registryFileInputRef = useRef<HTMLInputElement>(null);
  const groupFileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingRegistry, setIsImportingRegistry] = useState(false);
  const [isImportingGroups, setIsImportingGroups] = useState(false);

  const [customCats, setCustomCats] = useState<CustomCategory[]>(() => getCustomCategories());
  const [deletedBuiltins, setDeletedBuiltins] = useState<string[]>(() => getDeletedBuiltinCategories());
  const [builtinOverrides, setBuiltinOverrides] = useState<BuiltinOverride[]>(() => getBuiltinOverrides());
  const [editorState, setEditorState] = useState<{
    original: string; name: string; color: PaletteColor; isBuiltIn: boolean; isNew: boolean;
  } | null>(null);

  const date = new Date().toISOString().split('T')[0];

  const handleDeleteCategory = (name: string, isBuiltIn: boolean) => {
    if (isBuiltIn) {
      const updated = [...deletedBuiltins, name];
      saveDeletedBuiltinCategories(updated);
      setDeletedBuiltins(updated);
    } else {
      const updated = customCats.filter(c => c.name !== name);
      saveCustomCategories(updated);
      setCustomCats(updated);
    }
    toast({ title: "Category removed", description: `"${name}" has been hidden.` });
  };

  const handleEditorSave = () => {
    if (!editorState) return;
    if (editorState.isNew) {
      const name = editorState.name.trim().toLowerCase().replace(/\s+/g, '-');
      if (!name) return;
      const allNames = [...CATEGORIES as readonly string[], ...customCats.map(c => c.name)];
      if (allNames.includes(name)) {
        toast({ variant: "destructive", title: "Category already exists", description: `"${name}" is already a category.` });
        return;
      }
      const updated = [...customCats, { name, color: editorState.color }];
      saveCustomCategories(updated);
      setCustomCats(updated);
      setEditorState(null);
      toast({ title: "Category added", description: `"${name}" is now available.` });
    } else if (editorState.isBuiltIn) {
      const updated = builtinOverrides.filter(o => o.name !== editorState.original);
      const newOverrides = [...updated, { name: editorState.original, color: editorState.color }];
      saveBuiltinOverrides(newOverrides);
      setBuiltinOverrides(newOverrides);
      setEditorState(null);
      toast({ title: "Category color updated", description: `"${editorState.original}" color has been saved.` });
    } else {
      const trimmed = editorState.name.trim().toLowerCase().replace(/\s+/g, '-');
      if (!trimmed) return;
      const allNames = [
        ...(CATEGORIES as readonly string[]).filter(n => !deletedBuiltins.includes(n)),
        ...customCats.filter(c => c.name !== editorState.original).map(c => c.name),
      ];
      if (allNames.includes(trimmed)) {
        toast({ variant: "destructive", title: "Name already used", description: `"${trimmed}" is already a category.` });
        return;
      }
      const updated = customCats.map(c => c.name === editorState.original ? { name: trimmed, color: editorState.color } : c);
      saveCustomCategories(updated);
      setCustomCats(updated);
      setEditorState(null);
      toast({ title: "Category updated", description: `"${trimmed}" has been saved.` });
    }
  };

  const handleExportGroupsCsv = () => {
    const data = getStoreData();
    if (!data.groups?.length) { toast({ variant: "destructive", title: "No groups to export" }); return; }
    downloadBlob(new Blob([groupsToCsv(data.groups)], { type: "text/csv;charset=utf-8;" }), `cmd-manager-groups-${date}.csv`);
    toast({ title: "Groups CSV Exported" });
  };

  const handleExportGroupsJson = () => {
    const data = getStoreData();
    if (!data.groups?.length) { toast({ variant: "destructive", title: "No groups to export" }); return; }
    downloadBlob(new Blob([JSON.stringify(data.groups, null, 2)], { type: "application/json" }), `cmd-manager-groups-${date}.json`);
    toast({ title: "Groups JSON Exported" });
  };

  const handleGroupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingGroups(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const currentData = getStoreData();
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            setStoreData({ ...currentData, groups: [...(currentData.groups ?? []), ...parsed] });
            await queryClient.invalidateQueries();
            toast({ title: "Groups JSON Imported", description: `Added ${parsed.length} group(s).` });
          } else throw new Error("Expected JSON array");
        } else if (file.name.endsWith('.csv')) {
          Papa.parse(content, {
            header: true,
            complete: async (results) => {
              const rows = results.data as Record<string, string>[];
              const newGroups = rows.filter(r => r.name).map(r => ({
                id: r.id || uuidv4(),
                name: r.name,
                description: r.description || "",
                commandIds: r.command_ids ? r.command_ids.split('|').filter(Boolean) : [],
                chainIds: r.chain_ids ? r.chain_ids.split('|').filter(Boolean) : [],
                registryIds: r.registry_ids ? r.registry_ids.split('|').filter(Boolean) : [],
              }));
              setStoreData({ ...currentData, groups: [...(currentData.groups ?? []), ...newGroups] });
              await queryClient.invalidateQueries();
              toast({ title: "Groups CSV Imported", description: `Added ${newGroups.length} group(s).` });
            },
            error: (err) => { throw err; }
          });
        }
      } catch { toast({ variant: "destructive", title: "Groups Import Failed", description: "Could not parse file." }); }
      finally { setIsImportingGroups(false); if (groupFileInputRef.current) groupFileInputRef.current.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    const data = getStoreData();
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `cmd-manager-backup-${date}.json`);
    toast({ title: "JSON Exported Successfully" });
  };

  const handleExportCommandsCsv = () => {
    const data = getStoreData();
    if (!data.commands.length) { toast({ variant: "destructive", title: "No commands to export" }); return; }
    downloadBlob(new Blob([commandsToCsv(data.commands)], { type: "text/csv;charset=utf-8;" }), `cmd-manager-commands-${date}.csv`);
    toast({ title: "Commands CSV Exported" });
  };

  const handleExportChainsCsv = () => {
    const data = getStoreData();
    if (!data.chains.length) { toast({ variant: "destructive", title: "No chains to export" }); return; }
    downloadBlob(new Blob([chainsToCsv(data.chains)], { type: "text/csv;charset=utf-8;" }), `cmd-manager-chains-${date}.csv`);
    toast({ title: "Chains CSV Exported", description: "Each row represents one step." });
  };

  const handleExportRegistryCsv = () => {
    const data = getStoreData();
    if (!data.registryCommands?.length) { toast({ variant: "destructive", title: "No registry commands to export" }); return; }
    downloadBlob(new Blob([commandsToCsv(data.registryCommands)], { type: "text/csv;charset=utf-8;" }), `cmd-manager-registry-${date}.csv`);
    toast({ title: "Registry CSV Exported" });
  };

  const handleExportRegistryJson = () => {
    const data = getStoreData();
    if (!data.registryCommands?.length) { toast({ variant: "destructive", title: "No registry commands to export" }); return; }
    downloadBlob(new Blob([JSON.stringify(data.registryCommands, null, 2)], { type: "application/json" }), `cmd-manager-registry-${date}.json`);
    toast({ title: "Registry JSON Exported" });
  };

  const parseCsvRows = (rows: Record<string, string>[]) => {
    if (rows.length > 0 && 'chain_id' in rows[0]) {
      const chainMap = new Map<string, { id: string; name: string; description: string; category: string; shell: string; steps: { id: string; prefix: string; command: string }[] }>();
      for (const row of rows) {
        if (!row.chain_id) continue;
        if (!chainMap.has(row.chain_id)) chainMap.set(row.chain_id, { id: row.chain_id, name: row.chain_name || "", description: row.chain_description || "", category: row.chain_category || "system", shell: row.chain_shell || "cmd", steps: [] });
        if (row.step_command) chainMap.get(row.chain_id)!.steps.push({ id: uuidv4(), prefix: row.step_prefix || "", command: row.step_command });
      }
      return { type: "chains" as const, data: Array.from(chainMap.values()) };
    }
    return {
      type: "commands" as const,
      data: rows.filter(r => r.name && r.command).map(r => ({
        id: r.id || uuidv4(), name: r.name, description: r.description || "", command: r.command,
        requiresAdmin: r.requiresAdmin === "true" || r.requiresAdmin === "1",
        category: r.category || "system", shell: r.shell || "cmd",
      })),
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content) as AppData;
          if (parsed.commands && parsed.chains) {
            setStoreData(parsed); await queryClient.invalidateQueries();
            toast({ title: "Import Successful", description: "JSON data has been loaded." });
          } else throw new Error("Invalid JSON structure");
        } else if (file.name.endsWith('.csv')) {
          Papa.parse(content, {
            header: true,
            complete: async (results) => {
              const rows = results.data as Record<string, string>[];
              const currentData = getStoreData();
              const parsed = parseCsvRows(rows);
              if (parsed.type === "chains") {
                setStoreData({ ...currentData, chains: [...currentData.chains, ...parsed.data] });
                await queryClient.invalidateQueries();
                toast({ title: "Chains CSV Imported", description: `Added ${parsed.data.length} chain(s).` });
              } else {
                setStoreData({ ...currentData, commands: [...currentData.commands, ...parsed.data] });
                await queryClient.invalidateQueries();
                toast({ title: "Commands CSV Imported", description: `Added ${parsed.data.length} command(s).` });
              }
            },
            error: (err) => { throw err; }
          });
        }
      } catch { toast({ variant: "destructive", title: "Import Failed", description: "Could not parse file." }); }
      finally { setIsImporting(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleRegistryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingRegistry(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.csv')) {
          Papa.parse(content, {
            header: true,
            complete: async (results) => {
              const rows = results.data as Record<string, string>[];
              const currentData = getStoreData();
              const newCommands = rows.filter(r => r.name && r.command).map(r => ({
                id: r.id || uuidv4(), name: r.name, description: r.description || "", command: r.command,
                requiresAdmin: r.requiresAdmin === "true" || r.requiresAdmin === "1",
                category: r.category || "system", shell: r.shell || "cmd",
              }));
              setStoreData({ ...currentData, registryCommands: [...(currentData.registryCommands || []), ...newCommands] });
              await queryClient.invalidateQueries();
              toast({ title: "Registry CSV Imported", description: `Added ${newCommands.length} registry command(s).` });
            },
            error: (err) => { throw err; }
          });
        } else if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          const currentData = getStoreData();
          if (Array.isArray(parsed)) {
            setStoreData({ ...currentData, registryCommands: [...(currentData.registryCommands || []), ...parsed] });
            await queryClient.invalidateQueries();
            toast({ title: "Registry JSON Imported", description: `Added ${parsed.length} command(s).` });
          } else throw new Error("Expected JSON array");
        }
      } catch { toast({ variant: "destructive", title: "Registry Import Failed", description: "Could not parse file." }); }
      finally { setIsImportingRegistry(false); if (registryFileInputRef.current) registryFileInputRef.current.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm("WARNING: This will delete ALL your commands, chains, and registry commands. This cannot be undone. Are you sure?")) {
      clearStoreData(); await queryClient.invalidateQueries();
      toast({ title: "Data Cleared", description: "All local data has been removed. Demo data will reload on next visit." });
    }
  };

  const builtInCats = CATEGORIES as readonly string[];
  const allCategoryEntries = [
    ...builtInCats
      .filter(name => !deletedBuiltins.includes(name))
      .map(name => {
        const override = builtinOverrides.find(o => o.name === name);
        return { name, isBuiltIn: true as const, color: (override?.color ?? null) as PaletteColor | null };
      }),
    ...customCats.map(c => ({ name: c.name, isBuiltIn: false as const, color: c.color as PaletteColor })),
  ];

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings & Data</h1>
        <p className="text-muted-foreground mt-1">Manage your local portable data.</p>
      </div>

      <div className="space-y-6">
        {/* Category Manager */}
        <Card className="glass rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <div className="bg-accent/5 p-6 border-b border-border/50 flex items-center gap-4">
            <div className="p-3 bg-accent/20 text-accent rounded-xl">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Category Manager</CardTitle>
              <CardDescription className="text-base mt-1 text-foreground/70">
                Add custom categories for organizing your commands and chains.
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="flex min-h-[380px]">
              {/* Left panel — category list + Add button */}
              <div className="w-1/4 border-r border-border/50 flex flex-col">
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {allCategoryEntries.map(({ name, isBuiltIn, color }) => {
                    const isSelected = editorState?.original === name && !editorState.isNew;
                    return (
                      <button
                        key={name}
                        onClick={() => setEditorState({ original: name, name, color: color ?? "blue", isBuiltIn, isNew: false })}
                        className={cn(
                          "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-colors",
                          isSelected ? "bg-accent/10 border border-border/60" : "hover:bg-secondary/50"
                        )}
                      >
                        <CategoryBadge category={name} />
                        {isBuiltIn && <span className="ml-auto text-[9px] text-muted-foreground shrink-0">built-in</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-border/50">
                  <Button
                    onClick={() => setEditorState({ original: "", name: "", color: "blue", isBuiltIn: false, isNew: true })}
                    className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                  </Button>
                </div>
              </div>

              {/* Right panel — editor */}
              <div className="flex-1 p-6 flex flex-col">
                {!editorState ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
                    <Tag className="w-10 h-10 opacity-20" />
                    <p className="text-sm">Select a category from the list to edit it, or click <span className="font-medium text-foreground/60">Add Category</span> to create a new one.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {editorState.isNew ? "New Category" : editorState.isBuiltIn ? "Edit Built-in Category" : "Edit Category"}
                    </p>

                    {/* Name field */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Name</p>
                      {editorState.isBuiltIn ? (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/40 border border-border/40">
                          <span className="text-sm font-medium">{editorState.original}</span>
                          <span className="text-xs text-muted-foreground ml-auto">Built-in (name locked)</span>
                        </div>
                      ) : (
                        <Input
                          placeholder="Category name (e.g. scripting)"
                          value={editorState.name}
                          onChange={e => setEditorState(prev => prev ? { ...prev, name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') } : null)}
                          onKeyDown={e => { if (e.key === 'Enter') handleEditorSave(); if (e.key === 'Escape') setEditorState(null); }}
                          className="rounded-xl"
                          autoFocus={editorState.isNew}
                        />
                      )}
                    </div>

                    {/* Color picker */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Color</p>
                      <div className="flex gap-2 flex-wrap">
                        {(Object.entries(COLOR_HEX) as [PaletteColor, string][]).map(([key, hex]) => (
                          <button
                            key={key}
                            onClick={() => setEditorState(prev => prev ? { ...prev, color: key } : null)}
                            title={key}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${editorState.color === key ? 'ring-2 ring-offset-2 ring-primary ring-offset-background scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: hex + '33', borderColor: hex + '80' }}
                          >
                            <span className="sr-only">{key}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Preview</p>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border",
                        COLOR_PALETTE[editorState.color].bg,
                        COLOR_PALETTE[editorState.color].text,
                        COLOR_PALETTE[editorState.color].border,
                      )}>
                        {editorState.isNew ? (editorState.name || "preview") : editorState.original}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                      <Button
                        onClick={handleEditorSave}
                        disabled={!editorState.isBuiltIn && !editorState.name.trim()}
                        size="sm"
                        className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {editorState.isNew ? "Add Category" : "Save Changes"}
                      </Button>
                      {!editorState.isNew && (
                        <Button
                          onClick={() => { handleDeleteCategory(editorState.original, editorState.isBuiltIn); setEditorState(null); }}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {editorState.isBuiltIn ? "Hide" : "Delete"}
                        </Button>
                      )}
                      <Button
                        onClick={() => setEditorState(null)}
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-muted-foreground ml-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Library */}
        <Card className="glass rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-border/50 flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Library Data (Commands & Chains)</CardTitle>
              <CardDescription className="text-base mt-1 text-foreground/70">
                Export or import commands and command chains. All data is stored locally in your browser.
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground text-sm">
                <Download className="w-4 h-4" /> Export
              </h3>
              <Button onClick={handleExportJson} variant="outline" className="w-full justify-start h-12 rounded-xl text-left border-border/50 hover:bg-secondary hover:text-foreground">
                <FileJson className="w-5 h-5 mr-3 text-primary" />
                <div className="flex flex-col items-start leading-tight">
                  <span>Export JSON Backup</span>
                  <span className="text-[10px] text-muted-foreground">Full library (Commands, Chains & Registry)</span>
                </div>
              </Button>
              <Button onClick={handleExportCommandsCsv} variant="outline" className="w-full justify-start h-12 rounded-xl text-left border-border/50 hover:bg-secondary hover:text-foreground">
                <FileSpreadsheet className="w-5 h-5 mr-3 text-blue-400" />
                <div className="flex flex-col items-start leading-tight">
                  <span>Export Commands to CSV</span>
                  <span className="text-[10px] text-muted-foreground">Spreadsheet format (Commands only)</span>
                </div>
              </Button>
              <Button onClick={handleExportChainsCsv} variant="outline" className="w-full justify-start h-12 rounded-xl text-left border-border/50 hover:bg-secondary hover:text-foreground">
                <FileSpreadsheet className="w-5 h-5 mr-3 text-blue-400" />
                <div className="flex flex-col items-start leading-tight">
                  <span>Export Chains to CSV</span>
                  <span className="text-[10px] text-muted-foreground">Spreadsheet format (one row per step)</span>
                </div>
              </Button>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground text-sm">
                <Upload className="w-4 h-4" /> Import
              </h3>
              <input type="file" accept=".json,.csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting}
                className="w-full h-12 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 border border-border/50">
                <Upload className="w-5 h-5 mr-2" />
                {isImporting ? "Importing..." : "Select File (JSON/CSV)"}
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                JSON import overwrites your entire library. CSV auto-detects Commands or Chains by column headers and appends.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Groups */}
        <Card className="glass rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <div className="bg-purple-500/5 p-6 border-b border-border/50 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Groups Data</CardTitle>
              <CardDescription className="text-base mt-1 text-foreground/70">
                Export or import your command groups. CSV format uses pipe-separated IDs per cell.
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground text-sm">
                <Download className="w-4 h-4" /> Export
              </h3>
              <Button onClick={handleExportGroupsJson} variant="outline" className="w-full justify-start h-12 rounded-xl text-left border-border/50 hover:bg-secondary hover:text-foreground">
                <FileJson className="w-5 h-5 mr-3 text-purple-400" />
                <div className="flex flex-col items-start leading-tight">
                  <span>Export Groups to JSON</span>
                  <span className="text-[10px] text-muted-foreground">Groups as a JSON array</span>
                </div>
              </Button>
              <Button onClick={handleExportGroupsCsv} variant="outline" className="w-full justify-start h-12 rounded-xl text-left border-border/50 hover:bg-secondary hover:text-foreground">
                <FileSpreadsheet className="w-5 h-5 mr-3 text-purple-400" />
                <div className="flex flex-col items-start leading-tight">
                  <span>Export Groups to CSV</span>
                  <span className="text-[10px] text-muted-foreground">Groups with pipe-separated item IDs</span>
                </div>
              </Button>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground text-sm">
                <Upload className="w-4 h-4" /> Import
              </h3>
              <input type="file" accept=".json,.csv" className="hidden" ref={groupFileInputRef} onChange={handleGroupFileChange} />
              <Button onClick={() => groupFileInputRef.current?.click()} disabled={isImportingGroups}
                className="w-full h-12 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 border border-border/50">
                <Upload className="w-5 h-5 mr-2" />
                {isImportingGroups ? "Importing..." : "Select Groups JSON/CSV"}
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                JSON must be an array of group objects. CSV must have columns: id, name, description, command_ids, chain_ids, registry_ids (pipe-separated). Appends to existing groups.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Registry */}
        <Card className="glass rounded-2xl border-orange-500/20 shadow-sm overflow-hidden">
          <div className="bg-orange-500/5 p-6 border-b border-orange-500/20 flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
              <DatabaseZap className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Registry Manager Data</CardTitle>
              <CardDescription className="text-base mt-1 text-foreground/70">
                Export or import your registry commands separately as CSV.
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground text-sm">
                <Download className="w-4 h-4" /> Export
              </h3>
              <Button onClick={handleExportRegistryJson} variant="outline" className="w-full justify-start h-12 rounded-xl text-left border-border/50 hover:bg-secondary hover:text-foreground">
                <FileJson className="w-5 h-5 mr-3 text-orange-400" />
                <div className="flex flex-col items-start leading-tight">
                  <span>Export Registry to JSON</span>
                  <span className="text-[10px] text-muted-foreground">All registry commands as JSON array</span>
                </div>
              </Button>
              <Button onClick={handleExportRegistryCsv} variant="outline" className="w-full justify-start h-12 rounded-xl text-left border-border/50 hover:bg-secondary hover:text-foreground">
                <FileSpreadsheet className="w-5 h-5 mr-3 text-orange-400" />
                <div className="flex flex-col items-start leading-tight">
                  <span>Export Registry to CSV</span>
                  <span className="text-[10px] text-muted-foreground">All registry commands as spreadsheet</span>
                </div>
              </Button>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground text-sm">
                <Upload className="w-4 h-4" /> Import
              </h3>
              <input type="file" accept=".json,.csv" className="hidden" ref={registryFileInputRef} onChange={handleRegistryFileChange} />
              <Button onClick={() => registryFileInputRef.current?.click()} disabled={isImportingRegistry}
                className="w-full h-12 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 border border-border/50">
                <Upload className="w-5 h-5 mr-2" />
                {isImportingRegistry ? "Importing..." : "Select Registry JSON/CSV"}
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Imports a CSV (same format as export) or a JSON array of registry commands. Appends to existing registry commands.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glass rounded-2xl border-destructive/20 shadow-sm overflow-hidden bg-destructive/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Permanently delete all commands, chains, and registry commands from local storage. Demo data reloads on next visit.
              </p>
            </div>
            <Button variant="destructive" onClick={handleClearData}
              className="rounded-xl px-6 w-full sm:w-auto shadow-lg shadow-destructive/20 hover-elevate">
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
