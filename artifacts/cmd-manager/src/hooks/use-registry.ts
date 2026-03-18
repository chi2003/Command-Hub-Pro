import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoreData, setStoreData, Command } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useRegistryCommands() {
  return useQuery({
    queryKey: ["registry"],
    queryFn: async () => {
      await delay(300);
      const data = getStoreData();
      return data.registryCommands;
    },
  });
}

export function useCreateRegistryCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commandData: Omit<Command, "id">) => {
      await delay(400);
      const data = getStoreData();
      const newCommand: Command = { ...commandData, id: uuidv4() };
      data.registryCommands.push(newCommand);
      setStoreData(data);
      return newCommand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registry"] });
    },
  });
}

export function useUpdateRegistryCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (command: Command) => {
      await delay(400);
      const data = getStoreData();
      const index = data.registryCommands.findIndex(c => c.id === command.id);
      if (index !== -1) {
        data.registryCommands[index] = command;
        setStoreData(data);
      }
      return command;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registry"] });
    },
  });
}

export function useDeleteRegistryCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(400);
      const data = getStoreData();
      data.registryCommands = data.registryCommands.filter(c => c.id !== id);
      setStoreData(data);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registry"] });
    },
  });
}
