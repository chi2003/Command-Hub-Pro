import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoreData, setStoreData, Command } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

// Simulate network delay for a more realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCommands() {
  return useQuery({
    queryKey: ["commands"],
    queryFn: async () => {
      await delay(300);
      const data = getStoreData();
      return data.commands;
    },
  });
}

export function useCreateCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commandData: Omit<Command, "id">) => {
      await delay(400);
      const data = getStoreData();
      const newCommand: Command = { ...commandData, id: uuidv4() };
      data.commands.push(newCommand);
      setStoreData(data);
      return newCommand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commands"] });
    },
  });
}

export function useUpdateCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (command: Command) => {
      await delay(400);
      const data = getStoreData();
      const index = data.commands.findIndex(c => c.id === command.id);
      if (index !== -1) {
        data.commands[index] = command;
        setStoreData(data);
      }
      return command;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commands"] });
    },
  });
}

export function useDeleteCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(400);
      const data = getStoreData();
      data.commands = data.commands.filter(c => c.id !== id);
      setStoreData(data);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commands"] });
    },
  });
}
