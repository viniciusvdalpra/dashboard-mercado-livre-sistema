import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCreateIssue, useUpdateIssue } from "@workspace/api-client-react";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import { getListIssuesQueryKey, getGetIssueStatsQueryKey, getGetIssuesByCategoryQueryKey, getGetIssuesByPriorityQueryKey, getGetIssuesTrendQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional().nullable(),
  category: z.string().min(1, "Categoria é obrigatória"),
  priority: z.string().min(1, "Prioridade é obrigatória"),
  status: z.string().min(1, "Status é obrigatório"),
  responsible: z.string().optional().nullable(),
  dueDate: z.date().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface IssueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueToEdit?: any;
}

export function IssueForm({ open, onOpenChange, issueToEdit }: IssueFormProps) {
  const isEditing = !!issueToEdit;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      status: "open",
      responsible: "",
      dueDate: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (issueToEdit) {
        form.reset({
          title: issueToEdit.title || "",
          description: issueToEdit.description || "",
          category: issueToEdit.category || "",
          priority: issueToEdit.priority || "medium",
          status: issueToEdit.status || "open",
          responsible: issueToEdit.responsible || "",
          dueDate: issueToEdit.dueDate ? new Date(issueToEdit.dueDate) : null,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          category: "",
          priority: "medium",
          status: "open",
          responsible: "",
          dueDate: null,
        });
      }
    }
  }, [open, issueToEdit, form]);

  const createMutation = useCreateIssue();
  const updateMutation = useUpdateIssue();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: getListIssuesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetIssueStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetIssuesByCategoryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetIssuesByPriorityQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetIssuesTrendQueryKey() });
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      dueDate: data.dueDate ? format(data.dueDate, "yyyy-MM-dd") : null,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: issueToEdit.id, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Problema atualizado com sucesso!" });
            invalidateQueries();
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Erro ao atualizar problema", variant: "destructive" });
          },
        }
      );
    } else {
      createMutation.mutate(
        { data: payload as any },
        {
          onSuccess: () => {
            toast({ title: "Problema criado com sucesso!" });
            invalidateQueries();
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Erro ao criar problema", variant: "destructive" });
          },
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Problema" : "Novo Problema"}</SheetTitle>
          <SheetDescription>
            Preencha os detalhes do problema abaixo.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...form.register("title")} placeholder="Resumo do problema" />
            {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Detalhes completos..." rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.watch("category")} onValueChange={(val) => form.setValue("category", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={form.watch("priority")} onValueChange={(val) => form.setValue("priority", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.watch("status")} onValueChange={(val) => form.setValue("status", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input {...form.register("responsible")} placeholder="Nome do responsável" />
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Data Prevista</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`w-full justify-start text-left font-normal ${!form.watch("dueDate") && "text-muted-foreground"}`}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("dueDate") ? format(form.watch("dueDate")!, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch("dueDate") || undefined}
                  onSelect={(d) => form.setValue("dueDate", d || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
