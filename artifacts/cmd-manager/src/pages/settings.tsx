import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { getStoreData, setStoreData, clearStoreData, AppData } from "@/lib/store";
import { Download, Upload, FileJson, FileSpreadsheet, Trash2, Database, DatabaseZap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function commandsToCsv(commands: AppData["commands"]) {
  return Papa.unparse(commands.map(c => ({
    id: c.id, name: c.name, description: c.description, command: c.command, requiresAdmin: c.requiresAdmin,
  })));
}

function chainsToCsv(chains: AppData["chains"]) {
  const rows: Record<string, string>[] = [];
  for (const chain of chains) {
    if (chain.steps.length === 0) {
      rows.push({ chain_id: chain.id, chain_name: chain.name, chain_description: chain.description, chain_suffix: chain.suffix, step_index: "0", step_prefix: "", step_command: "" });
    } else {
      chain.steps.forEach((step, i) => {
        rows.push({ chain_id: chain.id, chain_name: chain.name, chain_description: chain.description, chain_suffix: chain.suffix, step_index: String(i), step_prefix: step.prefix, step_command: step.command });
      });
    }
  }
  return Papa.unparse(rows);
}

export default function SettingsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const registryFileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingRegistry, setIsImportingRegistry] = useState(false);

  const date = new Date().toISOString().split('T')[0];

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

  const parseCsvRows = (rows: Record<string, string>[]) => {
    if (rows.length > 0 && 'chain_id' in rows[0]) {
      const chainMap = new Map<string, { id: string; name: string; description: string; suffix: string; steps: { id: string; prefix: string; command: string }[] }>();
      for (const row of rows) {
        if (!row.chain_id) continue;
        if (!chainMap.has(row.chain_id)) chainMap.set(row.chain_id, { id: row.chain_id, name: row.chain_name || "", description: row.chain_description || "", suffix: row.chain_suffix || "", steps: [] });
        if (row.step_command) chainMap.get(row.chain_id)!.steps.push({ id: uuidv4(), prefix: row.step_prefix || "", command: row.step_command });
      }
      return { type: "chains" as const, data: Array.from(chainMap.values()) };
    }
    return {
      type: "commands" as const,
      data: rows.filter(r => r.name && r.command).map(r => ({
        id: r.id || uuidv4(), name: r.name, description: r.description || "", command: r.command,
        requiresAdmin: r.requiresAdmin === "true" || r.requiresAdmin === "1",
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
            setStoreData(parsed);
            await queryClient.invalidateQueries();
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
      } catch (err) {
        toast({ variant: "destructive", title: "Import Failed", description: "Could not parse file." });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
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
      } catch (err) {
        toast({ variant: "destructive", title: "Registry Import Failed", description: "Could not parse file." });
      } finally {
        setIsImportingRegistry(false);
        if (registryFileInputRef.current) registryFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm("WARNING: This will delete ALL your commands, chains, and registry commands. This cannot be undone. Are you sure?")) {
      clearStoreData();
      await queryClient.invalidateQueries();
      toast({ title: "Data Cleared", description: "All local data has been removed. Demo data will reload on next visit." });
    }
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings & Data</h1>
        <p className="text-muted-foreground mt-1">Manage your local portable data.</p>
      </div>

      <div className="space-y-6">
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
                <FileSpreadsheet className="w-5 h-5 mr-3 text-green-500" />
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
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full h-12 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 border border-border/50"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isImporting ? "Importing..." : "Select File (JSON/CSV)"}
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                JSON import overwrites your entire library. CSV auto-detects Commands or Chains by column headers and appends.
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
              <Button
                onClick={() => registryFileInputRef.current?.click()}
                disabled={isImportingRegistry}
                className="w-full h-12 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 border border-border/50"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isImportingRegistry ? "Importing..." : "Select Registry CSV/JSON"}
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
            <Button
              variant="destructive"
              onClick={handleClearData}
              className="rounded-xl px-6 w-full sm:w-auto shadow-lg shadow-destructive/20 hover-elevate"
            >
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
