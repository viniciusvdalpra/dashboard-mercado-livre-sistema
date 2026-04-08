import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getPriorityLabel, getStatusLabel, CATEGORIES, PRIORITIES, STATUSES } from "@/lib/constants";
import { Trash2, Edit } from "lucide-react";
import { useDeleteIssue } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListIssuesQueryKey, getGetIssueStatsQueryKey, getGetIssuesByCategoryQueryKey, getGetIssuesByPriorityQueryKey, getGetIssuesTrendQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function IssueTable({ data, onEdit }: { data: any[]; onEdit: (issue: any) => void }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const [issueToDelete, setIssueToDelete] = useState<number | null>(null);
  const deleteMutation = useDeleteIssue();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: getListIssuesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetIssueStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetIssuesByCategoryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetIssuesByPriorityQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetIssuesTrendQueryKey() });
  };

  const confirmDelete = () => {
    if (!issueToDelete) return;
    deleteMutation.mutate(
      { id: issueToDelete },
      {
        onSuccess: () => {
          toast({ title: "Problema excluído com sucesso!" });
          invalidateQueries();
          setIssueToDelete(null);
        },
        onError: () => {
          toast({ title: "Erro ao excluir", variant: "destructive" });
          setIssueToDelete(null);
        },
      }
    );
  };

  const filteredData = useMemo(() => {
    return data.filter((issue) => {
      if (statusFilter !== "all" && issue.status !== statusFilter) return false;
      if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
      if (priorityFilter !== "all" && issue.priority !== priorityFilter) return false;
      return true;
    });
  }, [data, statusFilter, categoryFilter, priorityFilter]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    { accessorKey: "category", header: "Categoria" },
    {
      accessorKey: "priority",
      header: "Prioridade",
      cell: ({ row }) => {
        const val = row.original.priority;
        const colorMap: any = { critical: "bg-red-100 text-red-800", high: "bg-orange-100 text-orange-800", medium: "bg-yellow-100 text-yellow-800", low: "bg-gray-100 text-gray-800" };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${colorMap[val] || "bg-gray-100"}`}>{getPriorityLabel(val)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const val = row.original.status;
        const colorMap: any = { open: "bg-blue-100 text-blue-800", in_progress: "bg-amber-100 text-amber-800", resolved: "bg-green-100 text-green-800" };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${colorMap[val] || "bg-gray-100"}`}>{getStatusLabel(val)}</span>;
      },
    },
    {
      accessorKey: "responsible",
      header: "Responsável",
      cell: ({ row }) => row.original.responsible || <span className="text-muted-foreground text-sm italic">Não atribuído</span>,
    },
    {
      accessorKey: "dueDate",
      header: "Data Prevista",
      cell: ({ row }) => {
        if (!row.original.dueDate) return <span className="text-muted-foreground">-</span>;
        try {
          // Add timezone offset to prevent day shift
          const [y, m, d] = row.original.dueDate.split("-");
          return format(new Date(Number(y), Number(m) - 1, Number(d)), "dd/MM/yyyy");
        } catch {
          return row.original.dueDate;
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => {
        try {
          return format(new Date(row.original.createdAt), "dd/MM/yyyy");
        } catch {
          return row.original.createdAt;
        }
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(row.original); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setIssueToDelete(row.original.id); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()} className="cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onEdit(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum problema encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}{" "}
          de {table.getFilteredRowModel().rows.length} resultados
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próxima</Button>
        </div>
      </div>

      <AlertDialog open={!!issueToDelete} onOpenChange={(open) => !open && setIssueToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Problema?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente este problema do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
