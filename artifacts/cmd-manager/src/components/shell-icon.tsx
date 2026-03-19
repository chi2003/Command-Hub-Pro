type ShellIconProps = {
  shell?: string;
};

export function ShellIcon({ shell }: ShellIconProps) {
  if (shell === "powershell") {
    return (
      <div className="w-9 h-9 bg-[#012456] rounded-lg flex items-center justify-center border border-blue-900/50 shadow-sm shrink-0">
        <span className="text-[9px] font-extrabold text-[#2795d9] tracking-tight select-none">PS</span>
      </div>
    );
  }

  if (shell === "both") {
    return (
      <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 shadow-sm shrink-0 flex flex-col">
        <div className="flex-1 bg-[#1E1E1E] flex items-center justify-center">
          <span className="text-[7px] font-extrabold text-gray-300 tracking-tight select-none">CMD</span>
        </div>
        <div className="flex-1 bg-[#012456] flex items-center justify-center border-t border-blue-900/40">
          <span className="text-[7px] font-extrabold text-[#2795d9] tracking-tight select-none">PS</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-9 h-9 bg-[#1E1E1E] rounded-lg flex items-center justify-center border border-white/10 shadow-sm shrink-0">
      <span className="text-[9px] font-extrabold text-gray-300 tracking-tight select-none">CMD</span>
    </div>
  );
}
