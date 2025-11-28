import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Column<T> {
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => React.ReactNode
  cell?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
}

export function DataTable<T>({ 
  data, 
  columns, 
  emptyMessage = 'No hay datos disponibles' 
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border border-neutral-200">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, i) => (
              <TableHead key={i}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="text-center py-8 text-neutral-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((column, j) => (
                  <TableCell key={j}>
                    {column.cell 
                      ? column.cell(row)
                      : column.accessorFn
                      ? column.accessorFn(row)
                      : column.accessorKey
                      ? String(row[column.accessorKey as keyof T])
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
