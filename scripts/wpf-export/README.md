# CMD Manager — WPF Desktop App (C#)

A Windows desktop application for managing and copying Windows commands, command chains, and registry tweaks.

## Requirements

- Windows 10 / 11
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)

## Build & Run (Development)

```bat
cd CmdManager
dotnet restore
dotnet run
```

## Build as a Single .exe

Run this in the `CmdManager` folder:

```bat
dotnet publish -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
```

The `.exe` will be at:
```
CmdManager\bin\Release\net8.0-windows\win-x64\publish\CmdManager.exe
```

## Data Storage

User data is saved automatically to:
```
%APPDATA%\CmdManager\data.json
```

On first launch, the app loads built-in demo data (20 commands, 5 chains, 15 registry tweaks, 2 groups).

## Features

- **Commands** — Browse, search, filter, add, edit, delete individual Windows commands
- **Command Chains** — Multi-step workflows; last step is auto-copied to clipboard on Run
- **Registry Manager** — Registry commands with safety warning
- **Groups** — Organize commands, chains, and registry items into named collections
- **Run Dialog** — Terminal-style preview with one-click copy to clipboard
- **Persistent Storage** — All data survives app restarts (JSON in AppData)
