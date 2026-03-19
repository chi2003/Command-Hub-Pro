type ShellIconProps = {
  shell?: string;
};

export function ShellIcon({ shell }: ShellIconProps) {
  if (shell === "powershell") {
    return (
      <div className="w-11 h-11 bg-[#012456] rounded-lg flex items-center justify-center border border-blue-900/50 shadow-sm shrink-0 self-center">
        <span className="text-[15px] font-extrabold text-[#2795d9] tracking-tight select-none">&gt;_</span>
      </div>
    );
  }

  if (shell === "both") {
    return (
      <div className="w-11 h-11 rounded-lg overflow-hidden relative shrink-0 shadow-sm self-center" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="absolute inset-0 bg-[#1E1E1E]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)' }} />
        <div className="absolute inset-0 bg-[#012456]" style={{ clipPath: 'polygon(100% 0%, 100% 100%, 0% 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom right, transparent calc(50% - 0.5px), rgba(255,255,255,0.12) calc(50% - 0.5px), rgba(255,255,255,0.12) calc(50% + 0.5px), transparent calc(50% + 0.5px))'
        }} />
        <span className="absolute top-[6px] left-[5px] text-[13px] font-extrabold text-gray-300 tracking-tight select-none leading-none z-10">\_</span>
        <span className="absolute bottom-[5px] right-[4px] text-[13px] font-extrabold text-[#2795d9] tracking-tight select-none leading-none z-10">&gt;_</span>
      </div>
    );
  }

  return (
    <div className="w-11 h-11 bg-[#1E1E1E] rounded-lg flex items-center justify-center border border-white/10 shadow-sm shrink-0 self-center">
      <span className="text-[15px] font-extrabold text-gray-300 tracking-tight select-none">\_</span>
    </div>
  );
}
