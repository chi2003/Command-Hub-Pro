using System;
using System.Collections.Generic;
using System.IO;
using CmdManager.Models;
using Newtonsoft.Json;

namespace CmdManager.Data
{
    public static class Store
    {
        private static readonly string DataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "CmdManager", "data.json");

        private const int DataVersion = 1;

        public static AppData Load()
        {
            if (File.Exists(DataPath))
            {
                try
                {
                    var json = File.ReadAllText(DataPath);
                    var data = JsonConvert.DeserializeObject<AppData>(json);
                    if (data != null && data.Version == DataVersion)
                        return data;
                }
                catch { }
            }
            var demo = GetDemoData();
            Save(demo);
            return demo;
        }

        public static void Save(AppData data)
        {
            var dir = Path.GetDirectoryName(DataPath)!;
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            File.WriteAllText(DataPath, JsonConvert.SerializeObject(data, Formatting.Indented));
        }

        public static void Reset()
        {
            if (File.Exists(DataPath)) File.Delete(DataPath);
        }

        private static AppData GetDemoData() => new AppData
        {
            Version = DataVersion,
            Commands = new List<Command>
            {
                new() { Id = "demo-cmd-ipconfig",    Name = "IP Config",             CommandText = "ipconfig /all",                                 Description = "Show all IP configuration details including IPv4, IPv6, subnet mask, default gateway, and DNS servers for every adapter.",                        RequiresAdmin = false, Category = "network",     Shell = "both" },
                new() { Id = "demo-cmd-flushdns",    Name = "Flush DNS",             CommandText = "ipconfig /flushdns",                            Description = "Flush and reset the DNS resolver cache, forcing Windows to look up fresh DNS records on next request.",                                         RequiresAdmin = true,  Category = "network",     Shell = "both" },
                new() { Id = "demo-cmd-diskcheck",   Name = "Disk Check",            CommandText = "chkdsk C: /f /r",                               Description = "Scan the C: drive for file system errors, fix them automatically (/f), and locate bad sectors then recover readable data (/r).",               RequiresAdmin = true,  Category = "maintenance", Shell = "both" },
                new() { Id = "demo-cmd-sysinfo",     Name = "System Info",           CommandText = "systeminfo",                                    Description = "Display detailed system configuration including OS version, hotfixes installed, total physical memory, BIOS version, and network card information.", RequiresAdmin = false, Category = "info",        Shell = "both" },
                new() { Id = "demo-cmd-netstats",    Name = "Network Stats",         CommandText = "netstat -an",                                   Description = "Show all active TCP and UDP network connections and listening ports with their current state.",                                                   RequiresAdmin = false, Category = "network",     Shell = "both" },
                new() { Id = "demo-cmd-tasklist",    Name = "Tasklist",              CommandText = "tasklist /v",                                   Description = "List all currently running processes with verbose details including PID, session, memory usage, status, and window title.",                       RequiresAdmin = false, Category = "system",      Shell = "cmd" },
                new() { Id = "demo-cmd-sfcscan",     Name = "SFC Scan",              CommandText = "sfc /scannow",                                  Description = "Scan all protected Windows system files and replace corrupted or missing files with a cached copy.",                                              RequiresAdmin = true,  Category = "maintenance", Shell = "both" },
                new() { Id = "demo-cmd-dismrepair",  Name = "DISM Repair",           CommandText = "DISM /Online /Cleanup-Image /RestoreHealth",    Description = "Use Windows Update as a source to fix a corrupted Windows component store (WinSxS).",                                                            RequiresAdmin = true,  Category = "maintenance", Shell = "both" },
                new() { Id = "demo-cmd-pinglocal",   Name = "Ping Localhost",        CommandText = "ping 127.0.0.1 -n 4",                          Description = "Ping the local loopback address to verify the TCP/IP stack on this machine is working correctly.",                                               RequiresAdmin = false, Category = "network",     Shell = "both" },
                new() { Id = "demo-cmd-arpcache",    Name = "ARP Cache",             CommandText = "arp -a",                                       Description = "Display the Address Resolution Protocol (ARP) cache — the table mapping IP addresses to physical (MAC) addresses for all interfaces.",            RequiresAdmin = false, Category = "network",     Shell = "both" },
                new() { Id = "demo-cmd-firewall",    Name = "Firewall Status",       CommandText = "netsh advfirewall show allprofiles",            Description = "Show the current Windows Defender Firewall state for Domain, Private, and Public profiles.",                                                      RequiresAdmin = true,  Category = "security",    Shell = "both" },
                new() { Id = "demo-cmd-schedtasks",  Name = "Scheduled Tasks",       CommandText = "schtasks /query /fo LIST /v",                  Description = "List every scheduled task on this machine with verbose details: trigger, last run time, next run time, run-as user, and status.",                 RequiresAdmin = true,  Category = "system",      Shell = "cmd" },
                new() { Id = "demo-cmd-battery",     Name = "Battery Report",        CommandText = "powercfg /batteryreport /output C:\\battery-report.html", Description = "Generate a detailed HTML battery health report at C:\\battery-report.html.",                                                         RequiresAdmin = true,  Category = "hardware",    Shell = "cmd" },
                new() { Id = "demo-cmd-startup",     Name = "Startup Programs",      CommandText = "wmic startup list brief",                       Description = "List all programs configured to launch at Windows startup.",                                                                                      RequiresAdmin = false, Category = "system",      Shell = "cmd" },
                new() { Id = "demo-cmd-envvars",     Name = "Environment Variables", CommandText = "set",                                           Description = "Print all currently active environment variables for this process session.",                                                                      RequiresAdmin = false, Category = "system",      Shell = "cmd" },
                new() { Id = "demo-cmd-openports",   Name = "Open Ports",            CommandText = "netstat -b -n",                                 Description = "List all open network connections and listening ports along with the executable name responsible for each connection.",                            RequiresAdmin = true,  Category = "security",    Shell = "both" },
                new() { Id = "demo-cmd-diskspace",   Name = "Disk Space",            CommandText = "wmic logicaldisk get size,freespace,caption",   Description = "Show the total size and free space for every logical drive on the system.",                                                                       RequiresAdmin = false, Category = "storage",     Shell = "cmd" },
                new() { Id = "demo-cmd-driverlist",  Name = "Driver List",           CommandText = "driverquery /v /fo CSV",                        Description = "Output a CSV-formatted list of all installed device drivers.",                                                                                    RequiresAdmin = true,  Category = "hardware",    Shell = "cmd" },
                new() { Id = "demo-cmd-cpuinfo",     Name = "CPU Info",              CommandText = "wmic cpu get name,numberofcores,maxclockspeed", Description = "Display the CPU model name, number of physical cores, and maximum clock speed in MHz.",                                                          RequiresAdmin = false, Category = "hardware",    Shell = "cmd" },
                new() { Id = "demo-cmd-meminfo",     Name = "Memory Info",           CommandText = "wmic memorychip get capacity,speed,manufacturer",Description = "Show details for each installed RAM stick: capacity, speed in MHz, and manufacturer.",                                                           RequiresAdmin = false, Category = "hardware",    Shell = "cmd" },
            },
            Chains = new List<CommandChain>
            {
                new() {
                    Id = "demo-chain-netdiag", Name = "Network Diagnostic",
                    Description = "Full network troubleshooting — checks IP config, tests connectivity, traces routes.",
                    Category = "network", Shell = "both",
                    Steps = new List<CommandChainStep>
                    {
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Check current IP configuration on all adapters", CommandText = "ipconfig /all" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Ping Google DNS to test internet connectivity",   CommandText = "ping 8.8.8.8 -n 4" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Trace route to Google DNS to spot routing issues",CommandText = "tracert 8.8.8.8" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Paste to terminal — filter connections as needed", CommandText = "netstat -an | findstr" },
                    }
                },
                new() {
                    Id = "demo-chain-syshealth", Name = "System Health Check",
                    Description = "Check and repair Windows system files using SFC and DISM.",
                    Category = "maintenance", Shell = "both",
                    Steps = new List<CommandChainStep>
                    {
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Display full system configuration and OS details",           CommandText = "systeminfo" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Scan and attempt to repair protected system files",           CommandText = "sfc /scannow" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Paste to terminal — confirm before restoring component store",CommandText = "DISM /Online /Cleanup-Image /RestoreHealth" },
                    }
                },
                new() {
                    Id = "demo-chain-shadowclean", Name = "Shadow Copy Cleanup",
                    Description = "Lists all VSS shadow copies then pastes the delete command for you to fill in the ShadowID.",
                    Category = "storage", Shell = "cmd",
                    Steps = new List<CommandChainStep>
                    {
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "List all existing volume shadow copies and their IDs",         CommandText = "vssadmin list shadows" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Paste to terminal — replace {ShadowID} with the ID from above",CommandText = "vssadmin delete shadows /Shadow={ShadowID}" },
                    }
                },
                new() {
                    Id = "demo-chain-secaudit", Name = "Security Audit",
                    Description = "Reviews firewall state and open ports, then pastes the scheduled tasks query.",
                    Category = "security", Shell = "both",
                    Steps = new List<CommandChainStep>
                    {
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Check Windows Firewall state on all network profiles",          CommandText = "netsh advfirewall show allprofiles" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "List open ports and the executables that own them",             CommandText = "netstat -b -n" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Paste to terminal — confirm before listing scheduled tasks",    CommandText = "schtasks /query /fo LIST /v" },
                    }
                },
                new() {
                    Id = "demo-chain-hwinventory", Name = "Hardware Inventory",
                    Description = "Gathers CPU and RAM specs automatically, then pastes the driver export command.",
                    Category = "hardware", Shell = "cmd",
                    Steps = new List<CommandChainStep>
                    {
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Get CPU name, physical core count, and max clock speed",       CommandText = "wmic cpu get name,numberofcores,maxclockspeed" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Get installed RAM sticks: capacity, speed, manufacturer",      CommandText = "wmic memorychip get capacity,speed,manufacturer" },
                        new() { Id = Guid.NewGuid().ToString(), Prefix = "Paste to terminal — confirm output path before exporting",     CommandText = "driverquery /v /fo CSV > C:\\drivers.csv" },
                    }
                },
            },
            Groups = new List<Group>
            {
                new() {
                    Id = "demo-grp-dailymaint", Name = "Daily Maintenance",
                    Description = "Essential commands and chains for routine Windows upkeep.",
                    CommandIds = new List<string> { "demo-cmd-flushdns", "demo-cmd-diskcheck", "demo-cmd-sfcscan", "demo-cmd-dismrepair", "demo-cmd-diskspace" },
                    ChainIds = new List<string> { "demo-chain-syshealth", "demo-chain-shadowclean" },
                    RegistryIds = new List<string>(),
                },
                new() {
                    Id = "demo-grp-syscheck", Name = "System Check",
                    Description = "Quick diagnostic snapshot — gathers system info, network status, running processes, and hardware details.",
                    CommandIds = new List<string> { "demo-cmd-sysinfo", "demo-cmd-ipconfig", "demo-cmd-netstats", "demo-cmd-tasklist", "demo-cmd-cpuinfo", "demo-cmd-meminfo" },
                    ChainIds = new List<string> { "demo-chain-netdiag", "demo-chain-hwinventory" },
                    RegistryIds = new List<string>(),
                },
            },
            RegistryCommands = new List<Command>
            {
                new() { Id = "demo-reg-startup-hklm", Name = "List Startup (HKLM)",   CommandText = @"reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",                                                               Description = "List all programs set to auto-start for all users via the HKLM Run registry key.",                           RequiresAdmin = false, Category = "system",     Shell = "cmd" },
                new() { Id = "demo-reg-startup-hkcu", Name = "List Startup (HKCU)",   CommandText = @"reg query HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",                                                               Description = "List all programs set to auto-start for the current user via the HKCU Run registry key.",                    RequiresAdmin = false, Category = "system",     Shell = "cmd" },
                new() { Id = "demo-reg-enableuac",    Name = "Enable UAC",             CommandText = @"reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /v EnableLUA /t REG_DWORD /d 1 /f",                  Description = "Re-enable User Account Control (UAC) by setting EnableLUA to 1 in the System Policies key.",                  RequiresAdmin = true,  Category = "security",   Shell = "cmd" },
                new() { Id = "demo-reg-faststartup",  Name = "Disable Fast Startup",   CommandText = @"reg add HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Power /v HiberbootEnabled /t REG_DWORD /d 0 /f",              Description = "Disable Fast Startup (Hybrid Boot) which can cause issues with dual-boot systems.",                            RequiresAdmin = true,  Category = "system",     Shell = "cmd" },
                new() { Id = "demo-reg-darksys",      Name = "Dark Mode (System)",     CommandText = @"reg add HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize /v SystemUsesLightTheme /t REG_DWORD /d 0 /f",    Description = "Switch Windows system UI to Dark Mode.",                                                                      RequiresAdmin = false, Category = "appearance", Shell = "cmd" },
                new() { Id = "demo-reg-lightsys",     Name = "Light Mode (System)",    CommandText = @"reg add HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize /v SystemUsesLightTheme /t REG_DWORD /d 1 /f",    Description = "Switch Windows system UI to Light Mode.",                                                                     RequiresAdmin = false, Category = "appearance", Shell = "cmd" },
                new() { Id = "demo-reg-darkapps",     Name = "Dark Mode (Apps)",       CommandText = @"reg add HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize /v AppsUseLightTheme /t REG_DWORD /d 0 /f",       Description = "Switch apps that respect the Windows theme to Dark Mode.",                                                    RequiresAdmin = false, Category = "appearance", Shell = "cmd" },
                new() { Id = "demo-reg-lightapps",    Name = "Light Mode (Apps)",      CommandText = @"reg add HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize /v AppsUseLightTheme /t REG_DWORD /d 1 /f",       Description = "Switch apps that respect the Windows theme to Light Mode.",                                                   RequiresAdmin = false, Category = "appearance", Shell = "cmd" },
                new() { Id = "demo-reg-cortana",      Name = "Disable Cortana",        CommandText = @"reg add HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search /v AllowCortana /t REG_DWORD /d 0 /f",                      Description = "Disable Cortana via Group Policy registry key.",                                                              RequiresAdmin = true,  Category = "privacy",    Shell = "cmd" },
                new() { Id = "demo-reg-fileext",      Name = "Show File Extensions",   CommandText = @"reg add HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced /v HideFileExt /t REG_DWORD /d 0 /f",              Description = "Force File Explorer to show file extensions for all known file types.",                                       RequiresAdmin = false, Category = "system",     Shell = "cmd" },
                new() { Id = "demo-reg-rdp",          Name = "Enable Remote Desktop",  CommandText = @"reg add HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server /v fDenyTSConnections /t REG_DWORD /d 0 /f",                  Description = "Enable incoming Remote Desktop Protocol (RDP) connections.",                                                  RequiresAdmin = true,  Category = "network",    Shell = "cmd" },
                new() { Id = "demo-reg-bkup-hkcu",    Name = "Backup HKCU",            CommandText = @"reg export HKCU C:\HKCU_backup.reg",                                                                                        Description = "Export a full backup of the HKEY_CURRENT_USER hive to C:\\HKCU_backup.reg.",                                  RequiresAdmin = false, Category = "backup",     Shell = "cmd" },
                new() { Id = "demo-reg-bkup-hklm",    Name = "Backup HKLM",            CommandText = @"reg export HKLM C:\HKLM_backup.reg",                                                                                        Description = "Export a full backup of the HKEY_LOCAL_MACHINE hive to C:\\HKLM_backup.reg.",                                 RequiresAdmin = true,  Category = "backup",     Shell = "cmd" },
                new() { Id = "demo-reg-hiddenfiles",  Name = "Show Hidden Files",      CommandText = @"reg add HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced /v Hidden /t REG_DWORD /d 1 /f",                   Description = "Make hidden files and folders visible in File Explorer.",                                                     RequiresAdmin = false, Category = "system",     Shell = "cmd" },
                new() { Id = "demo-reg-telemetry",    Name = "Disable Telemetry",      CommandText = @"reg add HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection /v AllowTelemetry /t REG_DWORD /d 0 /f",                    Description = "Disable Windows diagnostic data and telemetry reporting via the Group Policy registry key.",                  RequiresAdmin = true,  Category = "privacy",    Shell = "cmd" },
            }
        };
    }
}
