import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoreData, setStoreData, clearStoreData, AppData } from "@/lib/store";
import { Download, Upload, FileJson, FileSpreadsheet, Trash2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);

  const handleExportJson = () => {
    const data = getStoreData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cmd-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "JSON Exported Successfully" });
  };

  const handleExportCsv = () => {
    const data = getStoreData();
    // Only export commands for CSV as chains are too complex/nested
    if (data.commands.length === 0) {
      toast({ variant: "destructive", title: "No commands to export" });
      return;
    }
    
    const csv = Papa.unparse(data.commands);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cmd-manager-commands-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "CSV Exported Successfully", description: "Only individual commands were exported." });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
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
          } else {
            throw new Error("Invalid JSON structure");
          }
        } else if (file.name.endsWith('.csv')) {
           Papa.parse(content, {
            header: true,
            complete: async (results) => {
              const currentData = getStoreData();
              // Basic validation - assume valid if has required fields
              const newCommands = results.data.filter((item: any) => item.name && item.command) as any[];
              
              const mergedData = {
                ...currentData,
                commands: [...currentData.commands, ...newCommands]
              };
              setStoreData(mergedData);
              await queryClient.invalidateQueries();
              toast({ title: "CSV Import Successful", description: `Added ${newCommands.length} commands.` });
            },
            error: (error) => {
              throw error;
            }
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

  const handleClearData = async () => {
    if (window.confirm("WARNING: This will delete ALL your commands and chains. This cannot be undone. Are you sure?")) {
      clearStoreData();
      await queryClient.invalidateQueries();
      toast({ title: "Data Cleared", description: "All local data has been removed. Reloading will restore demo data." });
    }
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings & Data</h1>
        <p className="text-muted-foreground mt-1">Manage your local portable data.</p>
      </div>

      <div className="space-y-6">
        <Card className="glass rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-border/50 flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Data Management</CardTitle>
              <CardDescription className="text-base mt-1 text-foreground/70">
                All data is stored locally in your browser. Export it to keep it safe or move to another device.
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground">
                <Download className="w-4 h-4" /> Export Data
              </h3>
              <Button onClick={handleExportJson} variant="outline" className="w-full justify-start h-12 rounded-xl text-left border-border/50 hover:bg-secondary hover:text-foreground">
                <FileJson className="w-5 h-5 mr-3 text-primary" />
                <div className="flex flex-col items-start leading-tight">
                  <span>Export JSON Backup</span>
                  <span className="text-[10px] text-muted-foreground">Full library (Commands & Chains)</span>
                </div>
              </Button>
              <Button onClick={handleExportCsv} variant="outline" className="w-full justify-start h-12 rounded-xl text-left border-border/50 hover:bg-secondary hover:text-foreground">
                <FileSpreadsheet className="w-5 h-5 mr-3 text-green-500" />
                <div className="flex flex-col items-start leading-tight">
                  <span>Export Commands to CSV</span>
                  <span className="text-[10px] text-muted-foreground">Spreadsheet format (Commands only)</span>
                </div>
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground">
                <Upload className="w-4 h-4" /> Import Data
              </h3>
              <input 
                type="file" 
                accept=".json,.csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
              <Button 
                onClick={handleImportClick} 
                disabled={isImporting}
                className="w-full h-12 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 border border-border/50"
              >
                <Upload className="w-5 h-5 mr-2" /> 
                {isImporting ? "Importing..." : "Select File (JSON/CSV)"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Importing a JSON file will overwrite your current library. Importing a CSV will append commands to your existing library.
              </p>
            </div>

          </CardContent>
        </Card>

        <Card className="glass rounded-2xl border-destructive/20 shadow-sm overflow-hidden bg-destructive/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Permanently delete all commands and chains from local storage. This action cannot be undone.
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
