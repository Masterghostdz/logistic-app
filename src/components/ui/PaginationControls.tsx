import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  perPage: number;
  onPageChange: (next: number) => void;
  onPerPageChange: (n: number) => void;
  // optional: total number of items to compute last page (client-side)
  totalItems?: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ page, perPage, onPageChange, onPerPageChange, totalItems }) => {
  const totalPages = totalItems ? Math.max(1, Math.ceil(totalItems / perPage)) : undefined;
  const isFirst = page <= 1;
  const isLast = typeof totalPages === 'number' ? page >= totalPages : false;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Page précédente"
        title="Page précédente"
        onClick={() => !isFirst && onPageChange(Math.max(1, page - 1))}
        className={`p-1 rounded ${isFirst ? 'text-muted-foreground opacity-50 pointer-events-none' : 'text-muted-foreground hover:text-foreground'}`}
        aria-disabled={isFirst}
        style={{ background: 'transparent', border: 'none' }}
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>

      <span className="text-base text-muted-foreground px-1">{page}</span>

      <button
        type="button"
        aria-label="Page suivante"
        title="Page suivante"
        onClick={() => !isLast && onPageChange(page + 1)}
        className={`p-1 rounded ${isLast ? 'text-muted-foreground opacity-50 pointer-events-none' : 'text-muted-foreground hover:text-foreground'}`}
        aria-disabled={isLast}
        style={{ background: 'transparent', border: 'none' }}
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>

      <select value={perPage} onChange={e => onPerPageChange(Number(e.target.value))} className="border rounded px-2 py-0.5 text-xs bg-background ml-3">
        <option value={20}>20</option>
        <option value={30}>30</option>
        <option value={40}>40</option>
        <option value={50}>50</option>
      </select>
    </div>
  );
};

export default PaginationControls;
