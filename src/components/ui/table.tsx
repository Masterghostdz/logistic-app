
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { 'data-rtl'?: boolean }
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto border rounded-lg">
    <table
      ref={ref}
      // use table-auto so columns grow to fit content (prevents truncation/ellipsis)
      className={cn("w-full caption-bottom text-sm border-collapse table-auto", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-muted/50", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    // keep only horizontal separators between rows
    className={cn("[&_tr:last-child]:border-0 [&_tr]:border-b border-border", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 border-border",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { 'data-rtl'?: boolean }
>(({ className, 'data-rtl': dataRtlProp, ...props }, ref) => {
  // If the consumer doesn't provide data-rtl, fallback to the document direction
  // so tables align correctly in Arabic without updating every usage.
  const isRtl = typeof dataRtlProp === 'boolean' ? dataRtlProp : (typeof document !== 'undefined' && document.documentElement?.dir === 'rtl');
  return (
    <th
      ref={ref}
      className={cn(
        // If isRtl is true we want borders on the left instead of right
        isRtl
          ? // Right-align headers in RTL and add slightly larger horizontal padding for breathing room between columns
            "px-[12px] p-[12px] text-right align-middle font-semibold text-muted-foreground [&:has([role=checkbox])]:pl-0 whitespace-normal"
          : "px-4 p-4 text-left align-middle font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-normal",
        className
      )}
      {...props}
    />
  )
})
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { 'data-rtl'?: boolean }
>(({ className, 'data-rtl': dataRtlProp, ...props }, ref) => {
  const isRtl = typeof dataRtlProp === 'boolean' ? dataRtlProp : (typeof document !== 'undefined' && document.documentElement?.dir === 'rtl');
  return (
    <td
      ref={ref}
      className={cn(
        isRtl
          ? // Slightly larger horizontal padding in RTL to increase spacing between columns
            "p-[12px] align-middle [&:has([role=checkbox])]:pl-0 text-sm whitespace-normal"
          : "p-4 align-middle [&:has([role=checkbox])]:pr-0 text-sm whitespace-normal",
        className
      )}
      {...props}
    />
  )
})
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
