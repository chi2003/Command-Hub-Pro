import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoreData, setStoreData, CommandChain } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useChains() {
  return useQuery({
    queryKey: ["chains"],
    queryFn: async () => {
      await delay(300);
      const data = getStoreData();
      return data.chains;
    },
  });
}

export function useCreateChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chainData: Omit<CommandChain, "id">) => {
      await delay(400);
      const data = getStoreData();
      
      const stepsWithIds = chainData.steps.map(step => ({
        ...step,
        id: step.id || uuidv4()
      }));

      const newChain: CommandChain = { 
        ...chainData, 
        steps: stepsWithIds,
        id: uuidv4() 
      };
      
      data.chains.push(newChain);
      setStoreData(data);
      return newChain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chains"] });
    },
  });
}

export function useUpdateChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chain: CommandChain) => {
      await delay(400);
      const data = getStoreData();
      const index = data.chains.findIndex(c => c.id === chain.id);
      if (index !== -1) {
        const stepsWithIds = chain.steps.map(step => ({
          ...step,
          id: step.id || uuidv4()
        }));
        
        data.chains[index] = { ...chain, steps: stepsWithIds };
        setStoreData(data);
      }
      return chain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chains"] });
    },
  });
}

export function useDeleteChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(400);
      const data = getStoreData();
      data.chains = data.chains.filter(c => c.id !== id);
      setStoreData(data);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chains"] });
    },
  });
}

export function useReorderChains() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOrder: CommandChain[]) => {
      const data = getStoreData();
      data.chains = newOrder;
      setStoreData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chains"] });
    },
  });
}
