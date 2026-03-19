import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";
import { useCreateCommand, useUpdateCommand } from "@/hooks/use-commands";
import { TerminalSquare, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SHELLS = [
  { value: "cmd", label: "CMD (Command Prompt)" },
  { value: "powershell", label: "PowerShell" },
  { value: "both", label: "Both (CMD & PowerShell)" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  command: z.string().min(2, "Command is required."),
  requiresAdmin: z.boolean().default(false),
  category: z.string().default("system"),
  shell: z.string().default("cmd"),
});

type FormValues = z.infer<typeof formSchema>;

type CommandFormDialogProps = {
  command?: Command | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (data: Omit<Command, "id">) => Promise<Command>;
  onUpdate?: (data: Command) => Promise<Command>;
};

export function CommandFormDialog({ command, open, onOpenChange, onCreate, onUpdate }: CommandFormDialogProps) {
  const isEditing = !!command;
  const { toast } = useToast();
  const [isPendingOverride, setIsPendingOverride] = useState(false);

  const createMutation = useCreateCommand();
  const updateMutation = useUpdateCommand();
  const isPending = (onCreate || onUpdate) ? isPendingOverride : (createMutation.isPending || updateMutation.isPending);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", command: "", requiresAdmin: false, category: "system", shell: "cmd" },
  });

  useEffect(() => {
    if (open) {
      if (command) {
        form.reset({
          name: command.name,
          description: command.description,
          command: command.command,
          requiresAdmin: command.requiresAdmin,
          category: command.category || "system",
          shell: command.shell || "cmd",
        });
      } else {
        form.reset({ name: "", description: "", command: "", requiresAdmin: false, category: "system", shell: "cmd" });
      }
    }
  }, [command, open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && command) {
        const fn = onUpdate ?? updateMutation.mutateAsync.bind(updateMutation);
        if (onUpdate) setIsPendingOverride(true);
        await fn({ ...values, id: command.id });
        toast({ title: "Command updated successfully" });
      } else {
        const fn = onCreate ?? createMutation.mutateAsync.bind(createMutation);
        if (onCreate) setIsPendingOverride(true);
        await fn(values);
        toast({ title: "Command created successfully" });
      }
      onOpenChange(false);
    } catch {
      toast({ variant: "destructive", title: "Error saving command" });
    } finally {
      setIsPendingOverride(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass rounded-2xl border-border/50">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <TerminalSquare className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>{isEditing ? "Edit Command" : "New Command"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update command details." : "Add a new reusable command to your library."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Flush DNS" className="rounded-xl bg-background/50" {...field} />
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
            
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="What does this command do?" className="rounded-xl resize-none bg-background/50 h-20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="command" render={({ field }) => (
              <FormItem>
                <FormLabel>Command String</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. ipconfig /flushdns" className="rounded-xl font-mono text-sm bg-[#0D1117]/80 text-blue-300 border-gray-800 focus:border-primary/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="requiresAdmin" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border/50 p-4 bg-secondary/30">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Run as Administrator</FormLabel>
                  <FormDescription>This command requires elevated privileges to execute.</FormDescription>
                </div>
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={isPending} className="rounded-xl bg-primary shadow-lg shadow-primary/20 hover-elevate">
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isEditing ? "Save Changes" : "Create Command"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
