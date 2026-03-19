import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommandChain } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";
import { useCreateChain, useUpdateChain } from "@/hooks/use-chains";
import { Layers, Save, Loader2, Plus, Trash2, GripVertical, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";

const SHELLS = [
  { value: "cmd", label: "CMD" },
  { value: "powershell", label: "PowerShell" },
  { value: "both", label: "Both" },
];

const stepSchema = z.object({
  id: z.string().optional(),
  prefix: z.string().min(1, "Description required"),
  command: z.string().min(1, "Command required"),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  steps: z.array(stepSchema).min(1, "At least one step is required."),
  category: z.string().default("system"),
  shell: z.string().default("cmd"),
});

type FormValues = z.infer<typeof formSchema>;

type ChainFormDialogProps = {
  chain?: CommandChain | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChainFormDialog({ chain, open, onOpenChange }: ChainFormDialogProps) {
  const isEditing = !!chain;
  const { toast } = useToast();
  const createMutation = useCreateChain();
  const updateMutation = useUpdateChain();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", description: "", steps: [{ prefix: "", command: "" }], category: "system", shell: "cmd",
    },
  });

  const { fields, append, remove } = useFieldArray({ name: "steps", control: form.control });

  useEffect(() => {
    if (open) {
      if (chain) {
        form.reset({
          name: chain.name,
          description: chain.description,
          steps: chain.steps.length > 0 ? chain.steps : [{ prefix: "", command: "" }],
          category: chain.category || "system",
          shell: chain.shell || "cmd",
        });
      } else {
        form.reset({ name: "", description: "", steps: [{ prefix: "", command: "" }], category: "system", shell: "cmd" });
      }
    }
  }, [chain, open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && chain) {
        await updateMutation.mutateAsync({ ...values, id: chain.id } as CommandChain);
        toast({ title: "Command Chain updated" });
      } else {
        await createMutation.mutateAsync(values as Omit<CommandChain, "id">);
        toast({ title: "Command Chain created" });
      }
      onOpenChange(false);
    } catch {
      toast({ variant: "destructive", title: "Error saving chain" });
    }
  };

  const lastIndex = fields.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 glass rounded-2xl border-border/50 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-accent-foreground rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>{isEditing ? "Edit Command Chain" : "New Command Chain"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update multi-step workflow." : "Create a multi-step execution workflow. The last step is pasted to the terminal for manual review before running."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-[600px] mx-auto pb-8">

                <div className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chain Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Network Diagnostic" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="What does this chain do?" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl bg-background/50">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass rounded-xl border-border/50">
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat} className="rounded-lg cursor-pointer capitalize">
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="shell" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shell</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl bg-background/50">
                              <SelectValue placeholder="Shell" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass rounded-xl border-border/50">
                            {SHELLS.map(s => (
                              <SelectItem key={s.value} value={s.value} className="rounded-lg cursor-pointer">
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">Execution Steps</h3>
                      <p className="text-sm text-muted-foreground">
                        Steps 1 to {Math.max(fields.length - 1, 1)} run automatically. The <strong>last step</strong> is pasted to the terminal for manual completion.
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ prefix: "", command: "" })} className="rounded-lg gap-1 border-border/50">
                      <Plus className="w-4 h-4" /> Add Step
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => {
                      const isLast = index === lastIndex;
                      return (
                        <div key={field.id} className={`group relative flex gap-3 p-4 rounded-xl border transition-colors shadow-sm ${isLast ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50' : 'border-border/50 bg-card hover:border-primary/30'}`}>
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground pt-6">
                            <GripVertical className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                            {isLast && fields.length > 1
                              ? <Pencil className="w-4 h-4 text-amber-400" />
                              : <span className="text-xs font-bold w-5 text-center">{index + 1}</span>
                            }
                          </div>

                          <div className="flex-1 space-y-3">
                            {isLast && fields.length > 1 && (
                              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Paste step — not auto-executed</p>
                            )}
                            <FormField control={form.control} name={`steps.${index}.prefix`} render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Step Description</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Check active connections" className="h-9 rounded-lg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name={`steps.${index}.command`} render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Command string</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. netstat -an" className={`h-9 rounded-lg font-mono text-sm ${isLast && fields.length > 1 ? 'bg-amber-500/5 text-amber-200 border-amber-500/20' : 'bg-[#0D1117]/60 text-blue-300'}`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          <Button type="button" variant="ghost" size="icon"
                            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => remove(index)} disabled={fields.length === 1}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                    {form.formState.errors.steps?.root && (
                      <p className="text-[0.8rem] font-medium text-destructive">{form.formState.errors.steps.root.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-border/50 bg-background/50 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={isPending} className="rounded-xl bg-primary shadow-lg shadow-primary/20 hover-elevate">
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isEditing ? "Save Chain" : "Create Chain"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
