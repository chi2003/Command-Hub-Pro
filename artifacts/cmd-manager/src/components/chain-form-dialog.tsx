import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CommandChain } from "@/lib/store";
import { useCreateChain, useUpdateChain } from "@/hooks/use-chains";
import { Layers, Save, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { v4 as uuidv4 } from "uuid";

const stepSchema = z.object({
  id: z.string().optional(),
  prefix: z.string().min(1, "Prefix description required"),
  command: z.string().min(1, "Command required"),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  steps: z.array(stepSchema).min(1, "At least one step is required."),
  suffix: z.string().optional().default(""),
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
      name: "",
      description: "",
      steps: [{ prefix: "", command: "" }],
      suffix: "",
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    name: "steps",
    control: form.control,
  });

  useEffect(() => {
    if (open) {
      if (chain) {
        form.reset({
          name: chain.name,
          description: chain.description,
          steps: chain.steps.length > 0 ? chain.steps : [{ prefix: "", command: "" }],
          suffix: chain.suffix || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          steps: [{ prefix: "", command: "" }],
          suffix: "",
        });
      }
    }
  }, [chain, open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && chain) {
        await updateMutation.mutateAsync({ ...values, id: chain.id, suffix: values.suffix || "" } as CommandChain);
        toast({ title: "Command Chain updated" });
      } else {
        await createMutation.mutateAsync({ ...values, suffix: values.suffix || "" } as Omit<CommandChain, "id">);
        toast({ title: "Command Chain created" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving chain" });
    }
  };

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
                {isEditing ? "Update multi-step workflow." : "Create a multi-step execution workflow."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-[600px] mx-auto pb-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chain Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Diagnostic Workflow" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="What does this do?" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">Execution Steps</h3>
                      <p className="text-sm text-muted-foreground">Define commands in order of execution.</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => append({ prefix: "", command: "" })}
                      className="rounded-lg gap-1 border-border/50"
                    >
                      <Plus className="w-4 h-4" /> Add Step
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="group relative flex gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors shadow-sm">
                        
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground transition-colors pt-6">
                           <GripVertical className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                           <span className="text-xs font-bold w-5 text-center">{index + 1}</span>
                        </div>

                        <div className="flex-1 space-y-3">
                          <FormField
                            control={form.control}
                            name={`steps.${index}.prefix`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Step Description (Prefix)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Ping google.com" className="h-9 rounded-lg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`steps.${index}.command`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Command string</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. ping 8.8.8.8" 
                                    className="h-9 rounded-lg font-mono text-sm bg-[#0D1117]/60 text-blue-300" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {form.formState.errors.steps?.root && (
                      <p className="text-[0.8rem] font-medium text-destructive">{form.formState.errors.steps.root.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <FormField
                    control={form.control}
                    name="suffix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixed Suffix (Optional)</FormLabel>
                        <FormDescription>Command to append at the very end of the execution chain.</FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. pause" 
                            className="rounded-xl resize-none bg-secondary/30 h-16 font-mono text-sm" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </div>
            </ScrollArea>

            <div className="p-6 border-t border-border/50 bg-background/50 flex justify-end gap-3 mt-auto">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
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
