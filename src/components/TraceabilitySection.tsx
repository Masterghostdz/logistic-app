import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TraceabilitySectionProps {
  traces?: any[] | null;
  label?: string;
  emptyText?: string;
}

const TraceabilitySection: React.FC<TraceabilitySectionProps> = ({ traces = [], label, emptyText }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const list = Array.isArray(traces) ? traces : [];
  const ordered = [...list].sort((a, b) => {
    const da = a?.date ? new Date(a.date).getTime() : 0;
    const db = b?.date ? new Date(b.date).getTime() : 0;
    return da - db;
  });

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold text-sm text-muted-foreground">
          <button type="button" aria-expanded={expanded} onClick={() => setExpanded(v => !v)} className="p-1 rounded hover:bg-muted">
            {expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.656a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 5.23a.75.75 0 01.02 1.06L3.57 10l3.66 3.71a.75.75 0 11-1.08 1.04L1.06 10.52a.75.75 0 010-1.04L6.15 4.19a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
            )}
          </button>
          <div>{label || t('declarations.history') || 'Historique'}</div>
        </div>
        <div>
          {!expanded && ordered.length > 0 && <div className="text-xs text-muted-foreground">{ordered.length}</div>}
        </div>
      </div>

      {expanded ? (
        <div className="space-y-2 text-xs text-muted-foreground max-h-64 overflow-auto pr-2">
          {ordered.map((trace, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="font-semibold min-w-[120px]">{trace.userName || trace.userId || '—'}</div>
              <div className="text-[10px] text-muted-foreground">({trace.date ? new Date(trace.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + new Date(trace.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''})</div>
              <div className="ml-2">: {trace.action}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground mt-2">
          {ordered.length > 0 ? ordered.slice(-1).map((tr, i) => (
            <div key={i} className="truncate">{tr.action} — {tr.userName || tr.userId || '—'} {tr.date ? `(${new Date(tr.date).toLocaleDateString()})` : ''}</div>
          )) : (
            <div>{emptyText || t('traceability.none') || 'Aucune trace'}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TraceabilitySection;
