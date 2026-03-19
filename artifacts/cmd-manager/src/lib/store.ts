import { v4 as uuidv4 } from 'uuid';

export type Command = {
  id: string;
  name: string;
  description: string;
  command: string;
  requiresAdmin: boolean;
  category: string;
  shell: string;
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
  category: string;
  shell: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  commandIds: string[];
  chainIds: string[];
  registryIds: string[];
};

export type AppData = {
  version: number;
  commands: Command[];
  chains: CommandChain[];
  registryCommands: Command[];
  groups: Group[];
};

const STORAGE_KEY = 'cmd-manager-data';
const DATA_VERSION = 6;

// Stable demo IDs so groups can reference them reliably
const D = {
  // Commands
  ipConfig:       'demo-cmd-ipconfig',
  flushDns:       'demo-cmd-flushdns',
  diskCheck:      'demo-cmd-diskcheck',
  sysInfo:        'demo-cmd-sysinfo',
  netStats:       'demo-cmd-netstats',
  tasklist:       'demo-cmd-tasklist',
  sfcScan:        'demo-cmd-sfcscan',
  dismRepair:     'demo-cmd-dismrepair',
  pingLocal:      'demo-cmd-pinglocal',
  arpCache:       'demo-cmd-arpcache',
  firewallStatus: 'demo-cmd-firewall',
  schedTasks:     'demo-cmd-schedtasks',
  batteryReport:  'demo-cmd-battery',
  startupProgs:   'demo-cmd-startup',
  envVars:        'demo-cmd-envvars',
  openPorts:      'demo-cmd-openports',
  diskSpace:      'demo-cmd-diskspace',
  driverList:     'demo-cmd-driverlist',
  cpuInfo:        'demo-cmd-cpuinfo',
  memInfo:        'demo-cmd-meminfo',
  // Chains
  netDiag:        'demo-chain-netdiag',
  sysHealth:      'demo-chain-syshealth',
  shadowClean:    'demo-chain-shadowclean',
  secAudit:       'demo-chain-secaudit',
  hwInventory:    'demo-chain-hwinventory',
  // Registry
  regStartupHklm: 'demo-reg-startup-hklm',
  regStartupHkcu: 'demo-reg-startup-hkcu',
  regEnableUac:   'demo-reg-enableuac',
  regFastStartup: 'demo-reg-faststartup',
  regDarkSys:     'demo-reg-darksys',
  regLightSys:    'demo-reg-lightsys',
  regDarkApps:    'demo-reg-darkapps',
  regLightApps:   'demo-reg-lightapps',
  regCortana:     'demo-reg-cortana',
  regFileExt:     'demo-reg-fileext',
  regRdp:         'demo-reg-rdp',
  regBkupHkcu:    'demo-reg-bkup-hkcu',
  regBkupHklm:    'demo-reg-bkup-hklm',
  regHiddenFiles: 'demo-reg-hiddenfiles',
  regTelemetry:   'demo-reg-telemetry',
  // Groups
  grpDailyMaint:  'demo-grp-dailymaint',
  grpSysCheck:    'demo-grp-syscheck',
};

const DEMO_DATA: AppData = {
  version: DATA_VERSION,
  commands: [
    { id: D.ipConfig,       name: "IP Config",             command: "ipconfig /all",                                  description: "Show all IP configuration details including IPv4, IPv6, subnet mask, default gateway, and DNS servers for every adapter.",                                                                     requiresAdmin: false, category: "network",     shell: "both" },
    { id: D.flushDns,       name: "Flush DNS",             command: "ipconfig /flushdns",                             description: "Flush and reset the DNS resolver cache, forcing Windows to look up fresh DNS records on next request.",                                                                                      requiresAdmin: true,  category: "network",     shell: "both" },
    { id: D.diskCheck,      name: "Disk Check",            command: "chkdsk C: /f /r",                                description: "Scan the C: drive for file system errors, fix them automatically (/f), and locate bad sectors then recover readable data (/r). Requires reboot if drive is in use.",                       requiresAdmin: true,  category: "maintenance", shell: "both" },
    { id: D.sysInfo,        name: "System Info",           command: "systeminfo",                                     description: "Display detailed system configuration including OS version, hotfixes installed, total physical memory, BIOS version, domain, and network card information.",                               requiresAdmin: false, category: "info",        shell: "both" },
    { id: D.netStats,       name: "Network Stats",         command: "netstat -an",                                    description: "Show all active TCP and UDP network connections and listening ports with their current state (ESTABLISHED, LISTENING, TIME_WAIT, etc.).",                                                  requiresAdmin: false, category: "network",     shell: "both" },
    { id: D.tasklist,       name: "Tasklist",              command: "tasklist /v",                                    description: "List all currently running processes with verbose details including PID, session, memory usage, status, and window title.",                                                                 requiresAdmin: false, category: "system",      shell: "cmd"  },
    { id: D.sfcScan,        name: "SFC Scan",              command: "sfc /scannow",                                   description: "Scan all protected Windows system files and replace corrupted or missing files with a cached copy from a compressed folder at %WinDir%\\System32\\dllcache.",                             requiresAdmin: true,  category: "maintenance", shell: "both" },
    { id: D.dismRepair,     name: "DISM Repair",           command: "DISM /Online /Cleanup-Image /RestoreHealth",     description: "Use Windows Update as a source to fix a corrupted Windows component store (WinSxS). Run this before or after SFC if it reports it couldn't fix certain files.",                           requiresAdmin: true,  category: "maintenance", shell: "both" },
    { id: D.pingLocal,      name: "Ping Localhost",        command: "ping 127.0.0.1 -n 4",                           description: "Ping the local loopback address to verify the TCP/IP stack on this machine is working correctly. Does not test network connectivity.",                                                    requiresAdmin: false, category: "network",     shell: "both" },
    { id: D.arpCache,       name: "ARP Cache",             command: "arp -a",                                        description: "Display the Address Resolution Protocol (ARP) cache — the table mapping IP addresses to physical (MAC) addresses for all interfaces.",                                                     requiresAdmin: false, category: "network",     shell: "both" },
    { id: D.firewallStatus, name: "Firewall Status",       command: "netsh advfirewall show allprofiles",             description: "Show the current Windows Defender Firewall state (On/Off), inbound/outbound policy, and logging settings for Domain, Private, and Public profiles.",                                       requiresAdmin: true,  category: "security",    shell: "both" },
    { id: D.schedTasks,     name: "Scheduled Tasks",       command: "schtasks /query /fo LIST /v",                   description: "List every scheduled task on this machine with verbose details: trigger, last run time, next run time, run-as user, and status.",                                                          requiresAdmin: true,  category: "system",      shell: "cmd"  },
    { id: D.batteryReport,  name: "Battery Report",        command: "powercfg /batteryreport /output C:\\battery-report.html", description: "Generate a detailed HTML battery health report at C:\\battery-report.html, showing capacity history, recent usage, and estimated battery life.",                              requiresAdmin: true,  category: "hardware",    shell: "cmd"  },
    { id: D.startupProgs,   name: "Startup Programs",      command: "wmic startup list brief",                        description: "List all programs configured to launch at Windows startup, their location (registry or startup folder), and the user account they run under.",                                              requiresAdmin: false, category: "system",      shell: "cmd"  },
    { id: D.envVars,        name: "Environment Variables", command: "set",                                            description: "Print all currently active environment variables for this process session, including PATH, TEMP, USERNAME, COMPUTERNAME, and all user-defined variables.",                                 requiresAdmin: false, category: "system",      shell: "cmd"  },
    { id: D.openPorts,      name: "Open Ports",            command: "netstat -b -n",                                  description: "List all open network connections and listening ports along with the executable name responsible for each connection. Useful for spotting suspicious activity.",                            requiresAdmin: true,  category: "security",    shell: "both" },
    { id: D.diskSpace,      name: "Disk Space",            command: "wmic logicaldisk get size,freespace,caption",    description: "Show the total size and free space (in bytes) for every logical drive on the system. Useful for quickly identifying full disks.",                                                           requiresAdmin: false, category: "storage",     shell: "cmd"  },
    { id: D.driverList,     name: "Driver List",           command: "driverquery /v /fo CSV",                         description: "Output a CSV-formatted list of all installed device drivers, including module name, display name, driver type, state, start mode, and path.",                                             requiresAdmin: true,  category: "hardware",    shell: "cmd"  },
    { id: D.cpuInfo,        name: "CPU Info",              command: "wmic cpu get name,numberofcores,maxclockspeed",  description: "Display the CPU model name, number of physical cores, and maximum clock speed in MHz for all installed processors.",                                                                       requiresAdmin: false, category: "hardware",    shell: "cmd"  },
    { id: D.memInfo,        name: "Memory Info",           command: "wmic memorychip get capacity,speed,manufacturer", description: "Show details for each installed RAM stick: its capacity in bytes, speed in MHz, and manufacturer name.",                                                                               requiresAdmin: false, category: "hardware",    shell: "cmd"  },
  ],
  chains: [
    {
      id: D.netDiag,
      name: "Network Diagnostic",
      description: "Full network troubleshooting — checks IP config, tests connectivity, traces routes, then leaves netstat ready for manual review.",
      steps: [
        { id: uuidv4(), prefix: "Check current IP configuration on all adapters", command: "ipconfig /all" },
        { id: uuidv4(), prefix: "Ping Google DNS to test internet connectivity", command: "ping 8.8.8.8 -n 4" },
        { id: uuidv4(), prefix: "Trace route to Google DNS to spot routing issues", command: "tracert 8.8.8.8" },
        { id: uuidv4(), prefix: "Paste to terminal — filter connections as needed before running", command: "netstat -an | findstr" }
      ],
      category: "network",
      shell: "both"
    },
    {
      id: D.sysHealth,
      name: "System Health Check",
      description: "Check and repair Windows system files using SFC and DISM. Last step pastes RestoreHealth for review before executing.",
      steps: [
        { id: uuidv4(), prefix: "Display full system configuration and OS details", command: "systeminfo" },
        { id: uuidv4(), prefix: "Scan and attempt to repair protected system files", command: "sfc /scannow" },
        { id: uuidv4(), prefix: "Paste to terminal — confirm before restoring component store", command: "DISM /Online /Cleanup-Image /RestoreHealth" }
      ],
      category: "maintenance",
      shell: "both"
    },
    {
      id: D.shadowClean,
      name: "Shadow Copy Cleanup",
      description: "Lists all VSS shadow copies and their IDs, then pastes the delete command for you to fill in the target ShadowID before executing.",
      steps: [
        { id: uuidv4(), prefix: "List all existing volume shadow copies and their IDs", command: "vssadmin list shadows" },
        { id: uuidv4(), prefix: "Paste to terminal — replace {ShadowID} with the ID from above", command: "vssadmin delete shadows /Shadow={ShadowID}" }
      ],
      category: "storage",
      shell: "cmd"
    },
    {
      id: D.secAudit,
      name: "Security Audit",
      description: "Reviews firewall state and open ports, then pastes the scheduled tasks query for manual confirmation before listing.",
      steps: [
        { id: uuidv4(), prefix: "Check Windows Firewall state on all network profiles", command: "netsh advfirewall show allprofiles" },
        { id: uuidv4(), prefix: "List open ports and the executables that own them", command: "netstat -b -n" },
        { id: uuidv4(), prefix: "Paste to terminal — confirm before listing all scheduled tasks", command: "schtasks /query /fo LIST /v" }
      ],
      category: "security",
      shell: "both"
    },
    {
      id: D.hwInventory,
      name: "Hardware Inventory",
      description: "Gathers CPU and RAM specs automatically, then pastes the driver export command for you to confirm the output path before running.",
      steps: [
        { id: uuidv4(), prefix: "Get CPU name, physical core count, and max clock speed", command: "wmic cpu get name,numberofcores,maxclockspeed" },
        { id: uuidv4(), prefix: "Get installed RAM sticks: capacity, speed, manufacturer", command: "wmic memorychip get capacity,speed,manufacturer" },
        { id: uuidv4(), prefix: "Paste to terminal — confirm output path before exporting driver list", command: "driverquery /v /fo CSV > C:\\drivers.csv" }
      ],
      category: "hardware",
      shell: "cmd"
    }
  ],
  groups: [
    {
      id: D.grpDailyMaint,
      name: "Daily Maintenance",
      description: "Essential commands and chains for routine Windows upkeep — flushing DNS, checking disks, and running system file repairs.",
      commandIds: [D.flushDns, D.diskCheck, D.sfcScan, D.dismRepair, D.diskSpace],
      chainIds: [D.sysHealth, D.shadowClean],
      registryIds: [],
    },
    {
      id: D.grpSysCheck,
      name: "System Check",
      description: "Quick diagnostic snapshot — gathers system info, network status, running processes, and hardware details in one place.",
      commandIds: [D.sysInfo, D.ipConfig, D.netStats, D.tasklist, D.cpuInfo, D.memInfo],
      chainIds: [D.netDiag, D.hwInventory],
      registryIds: [],
    },
  ],
  registryCommands: [
    { id: D.regStartupHklm, name: "List Startup (HKLM)",    command: "reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",                                                                                          description: "List all programs set to auto-start for all users via the HKLM Run registry key.",                                              requiresAdmin: false, category: "system",     shell: "cmd" },
    { id: D.regStartupHkcu, name: "List Startup (HKCU)",    command: "reg query HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",                                                                                          description: "List all programs set to auto-start for the current user via the HKCU Run registry key.",                                       requiresAdmin: false, category: "system",     shell: "cmd" },
    { id: D.regEnableUac,   name: "Enable UAC",             command: "reg add HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v EnableLUA /t REG_DWORD /d 1 /f",                                            description: "Re-enable User Account Control (UAC) by setting EnableLUA to 1 in the System Policies key.",                                   requiresAdmin: true,  category: "security",   shell: "cmd" },
    { id: D.regFastStartup, name: "Disable Fast Startup",   command: "reg add HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power /v HiberbootEnabled /t REG_DWORD /d 0 /f",                                         description: "Disable Fast Startup (Hybrid Boot) which can cause issues with dual-boot systems or certain drivers.",                          requiresAdmin: true,  category: "system",     shell: "cmd" },
    { id: D.regDarkSys,     name: "Dark Mode (System)",     command: "reg add HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize /v SystemUsesLightTheme /t REG_DWORD /d 0 /f",                               description: "Switch Windows system UI (taskbar, Start menu, Action Center) to Dark Mode.",                                                    requiresAdmin: false, category: "appearance", shell: "cmd" },
    { id: D.regLightSys,    name: "Light Mode (System)",    command: "reg add HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize /v SystemUsesLightTheme /t REG_DWORD /d 1 /f",                               description: "Switch Windows system UI (taskbar, Start menu, Action Center) to Light Mode.",                                                   requiresAdmin: false, category: "appearance", shell: "cmd" },
    { id: D.regDarkApps,    name: "Dark Mode (Apps)",       command: "reg add HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize /v AppsUseLightTheme /t REG_DWORD /d 0 /f",                                  description: "Switch apps that respect the Windows theme setting to Dark Mode.",                                                               requiresAdmin: false, category: "appearance", shell: "cmd" },
    { id: D.regLightApps,   name: "Light Mode (Apps)",      command: "reg add HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize /v AppsUseLightTheme /t REG_DWORD /d 1 /f",                                  description: "Switch apps that respect the Windows theme setting to Light Mode.",                                                              requiresAdmin: false, category: "appearance", shell: "cmd" },
    { id: D.regCortana,     name: "Disable Cortana",        command: "reg add HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search /v AllowCortana /t REG_DWORD /d 0 /f",                                                  description: "Disable Cortana via Group Policy registry key. Takes effect after restarting Explorer or logging out.",                         requiresAdmin: true,  category: "privacy",    shell: "cmd" },
    { id: D.regFileExt,     name: "Show File Extensions",   command: "reg add HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced /v HideFileExt /t REG_DWORD /d 0 /f",                                         description: "Force File Explorer to show file extensions for all known file types. Restart Explorer to apply.",                              requiresAdmin: false, category: "system",     shell: "cmd" },
    { id: D.regRdp,         name: "Enable Remote Desktop",  command: "reg add HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server /v fDenyTSConnections /t REG_DWORD /d 0 /f",                                               description: "Enable incoming Remote Desktop Protocol (RDP) connections by setting fDenyTSConnections to 0.",                                  requiresAdmin: true,  category: "network",    shell: "cmd" },
    { id: D.regBkupHkcu,    name: "Backup HKCU",            command: "reg export HKCU C:\\HKCU_backup.reg",                                                                                                                         description: "Export a full backup of the HKEY_CURRENT_USER hive to C:\\HKCU_backup.reg. Safe to run without admin.",                        requiresAdmin: false, category: "backup",     shell: "cmd" },
    { id: D.regBkupHklm,    name: "Backup HKLM",            command: "reg export HKLM C:\\HKLM_backup.reg",                                                                                                                         description: "Export a full backup of the HKEY_LOCAL_MACHINE hive to C:\\HKLM_backup.reg. Requires elevation.",                              requiresAdmin: true,  category: "backup",     shell: "cmd" },
    { id: D.regHiddenFiles, name: "Show Hidden Files",      command: "reg add HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced /v Hidden /t REG_DWORD /d 1 /f",                                              description: "Make hidden files and folders visible in File Explorer by setting the Hidden attribute to 1.",                                  requiresAdmin: false, category: "system",     shell: "cmd" },
    { id: D.regTelemetry,   name: "Disable Telemetry",      command: "reg add HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection /v AllowTelemetry /t REG_DWORD /d 0 /f",                                                description: "Disable Windows diagnostic data and telemetry reporting via the Group Policy registry key.",                                     requiresAdmin: true,  category: "privacy",    shell: "cmd" },
  ]
};

export const getStoreData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as AppData;
      if (parsed.version === DATA_VERSION) {
        if (!parsed.registryCommands) parsed.registryCommands = DEMO_DATA.registryCommands;
        if (!parsed.groups) parsed.groups = [];
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored data", e);
    }
  }
  setStoreData(DEMO_DATA);
  return DEMO_DATA;
};

export const setStoreData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: DATA_VERSION }));
};

export const clearStoreData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
