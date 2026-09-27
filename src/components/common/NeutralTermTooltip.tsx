import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface NeutralTermTooltipProps {
  term: string;
  className?: string;
  description?: string;
}

export const NeutralTermTooltip: React.FC<NeutralTermTooltipProps> = ({
  term,
  className = '',
  description = 'Law enforcement guidelines dictate neutral evidence-based terminology until judicial determination.'
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-1.5" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-slate-800 text-sky-300 border border-sky-800/60 flex items-center gap-1 ${className}`}>
        {term}
        <Info className="w-3 h-3 text-sky-400 cursor-help opacity-80" />
      </span>

      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded shadow-xl z-50 pointer-events-none backdrop-blur-md">
          <div className="font-semibold text-sky-400 mb-1 flex items-center gap-1">
            <Info className="w-3 h-3" /> Neutral Legal Terminology Standard
          </div>
          <p className="leading-tight text-slate-300">{description}</p>
          <div className="mt-1 text-[10px] text-slate-400 italic border-t border-slate-800 pt-1">
            MHA Standard OSINT / Graph Analytics Guideline
          </div>
        </div>
      )}
    </div>
  );
};
