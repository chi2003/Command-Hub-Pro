import { v4 as uuidv4 } from 'uuid';

export type Command = {
  id: string;
  name: string;
  description: string;
  command: string;
  requiresAdmin: boolean;
};

export type CommandChainStep = {
  id: string;
  prefix: string;
  command: string;
};

export type CommandChain = {
  id: string;
  name: string;
  description: string;
  steps: CommandChainStep[];
  suffix: string;
};

export type AppData = {
  commands: Command[];
  chains: CommandChain[];
};

const STORAGE_KEY = 'cmd-manager-data';

const DEMO_DATA: AppData = {
  commands: [
    { id: uuidv4(), name: "IP Config", command: "ipconfig /all", description: "Show all IP configuration details", requiresAdmin: false },
    { id: uuidv4(), name: "Flush DNS", command: "ipconfig /flushdns", description: "Flush the DNS resolver cache", requiresAdmin: true },
    { id: uuidv4(), name: "Disk Check", command: "chkdsk C: /f /r", description: "Check disk for errors and fix them", requiresAdmin: true },
    { id: uuidv4(), name: "System Info", command: "systeminfo", description: "Display detailed system configuration", requiresAdmin: false },
    { id: uuidv4(), name: "Network Stats", command: "netstat -an", description: "Show all active network connections", requiresAdmin: false },
    { id: uuidv4(), name: "Tasklist", command: "tasklist /v", description: "List all running processes with details", requiresAdmin: false },
    { id: uuidv4(), name: "SFC Scan", command: "sfc /scannow", description: "Scan and repair protected system files", requiresAdmin: true },
    { id: uuidv4(), name: "DISM Repair", command: "DISM /Online /Cleanup-Image /RestoreHealth", description: "Restore Windows component store health", requiresAdmin: true }
  ],
  chains: [
    {
      id: uuidv4(),
      name: "Network Diagnostic",
      description: "Full network troubleshooting workflow",
      steps: [
        { id: uuidv4(), prefix: "Check current IP configuration", command: "ipconfig /all" },
        { id: uuidv4(), prefix: "Ping Google to test connectivity", command: "ping 8.8.8.8 -n 4" },
        { id: uuidv4(), prefix: "Trace route to Google", command: "tracert 8.8.8.8" }
      ],
      suffix: "pause"
    },
    {
      id: uuidv4(),
      name: "System Health Check",
      description: "Check and repair Windows system files",
      steps: [
        { id: uuidv4(), prefix: "Check system info", command: "systeminfo" },
        { id: uuidv4(), prefix: "Scan system files for corruption", command: "sfc /scannow" }
      ],
      suffix: "pause & exit"
    }
  ]
};

export const getStoreData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as AppData;
    } catch (e) {
      console.error("Failed to parse stored data", e);
    }
  }
  
  // If no data, initialize with demo data
  setStoreData(DEMO_DATA);
  return DEMO_DATA;
};

export const setStoreData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const clearStoreData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
