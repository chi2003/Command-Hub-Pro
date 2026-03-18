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
    { id: uuidv4(), name: "DISM Repair", command: "DISM /Online /Cleanup-Image /RestoreHealth", description: "Restore Windows component store health", requiresAdmin: true },
    { id: uuidv4(), name: "Ping Localhost", command: "ping 127.0.0.1 -n 4", description: "Verify local TCP/IP stack is functional", requiresAdmin: false },
    { id: uuidv4(), name: "ARP Cache", command: "arp -a", description: "Display the ARP cache (IP-to-MAC mappings)", requiresAdmin: false },
    { id: uuidv4(), name: "Firewall Status", command: "netsh advfirewall show allprofiles", description: "Show Windows Firewall status for all profiles", requiresAdmin: true },
    { id: uuidv4(), name: "Scheduled Tasks", command: "schtasks /query /fo LIST /v", description: "List all scheduled tasks with details", requiresAdmin: true },
    { id: uuidv4(), name: "Battery Report", command: "powercfg /batteryreport /output C:\\battery-report.html", description: "Generate a full battery health report", requiresAdmin: true },
    { id: uuidv4(), name: "Startup Programs", command: "wmic startup list brief", description: "List programs that run at Windows startup", requiresAdmin: false },
    { id: uuidv4(), name: "Environment Variables", command: "set", description: "Print all current environment variables", requiresAdmin: false },
    { id: uuidv4(), name: "Open Ports", command: "netstat -b -n", description: "List open ports with their owning process", requiresAdmin: true },
    { id: uuidv4(), name: "Disk Space", command: "wmic logicaldisk get size,freespace,caption", description: "Show free and total space per drive", requiresAdmin: false },
    { id: uuidv4(), name: "Driver List", command: "driverquery /v /fo CSV", description: "List all installed device drivers", requiresAdmin: true },
    { id: uuidv4(), name: "CPU Info", command: "wmic cpu get name,numberofcores,maxclockspeed", description: "Display CPU name, cores, and clock speed", requiresAdmin: false },
    { id: uuidv4(), name: "Memory Info", command: "wmic memorychip get capacity,speed,manufacturer", description: "Show installed RAM sticks and specs", requiresAdmin: false },
  ],
  chains: [
    {
      id: uuidv4(),
      name: "Network Diagnostic",
      description: "Full network troubleshooting workflow",
      steps: [
        { id: uuidv4(), prefix: "Check current IP configuration", command: "ipconfig /all" },
        { id: uuidv4(), prefix: "Ping Google to test internet connectivity", command: "ping 8.8.8.8 -n 4" },
        { id: uuidv4(), prefix: "Trace route to Google DNS", command: "tracert 8.8.8.8" },
        { id: uuidv4(), prefix: "Show active network connections", command: "netstat -an" }
      ],
      suffix: "pause"
    },
    {
      id: uuidv4(),
      name: "System Health Check",
      description: "Check and repair Windows system files",
      steps: [
        { id: uuidv4(), prefix: "Display full system information", command: "systeminfo" },
        { id: uuidv4(), prefix: "Scan system files for corruption", command: "sfc /scannow" },
        { id: uuidv4(), prefix: "Restore Windows component store health", command: "DISM /Online /Cleanup-Image /RestoreHealth" }
      ],
      suffix: "pause & exit"
    },
    {
      id: uuidv4(),
      name: "Disk Maintenance",
      description: "Check disk health and clean up space",
      steps: [
        { id: uuidv4(), prefix: "Show free space on all drives", command: "wmic logicaldisk get size,freespace,caption" },
        { id: uuidv4(), prefix: "Run disk error check on C:", command: "chkdsk C: /f /r" }
      ],
      suffix: "pause"
    },
    {
      id: uuidv4(),
      name: "Security Audit",
      description: "Quick review of open ports and firewall",
      steps: [
        { id: uuidv4(), prefix: "Check firewall status on all profiles", command: "netsh advfirewall show allprofiles" },
        { id: uuidv4(), prefix: "List open ports and owning processes", command: "netstat -b -n" },
        { id: uuidv4(), prefix: "List all scheduled tasks", command: "schtasks /query /fo LIST /v" }
      ],
      suffix: "pause"
    },
    {
      id: uuidv4(),
      name: "Hardware Inventory",
      description: "Gather CPU, RAM, and driver details",
      steps: [
        { id: uuidv4(), prefix: "Get CPU name, cores, and clock speed", command: "wmic cpu get name,numberofcores,maxclockspeed" },
        { id: uuidv4(), prefix: "Get installed RAM sticks and specs", command: "wmic memorychip get capacity,speed,manufacturer" },
        { id: uuidv4(), prefix: "List all installed drivers", command: "driverquery /v /fo CSV" }
      ],
      suffix: "pause"
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
