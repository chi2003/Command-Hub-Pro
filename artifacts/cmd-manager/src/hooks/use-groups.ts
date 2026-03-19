import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { getStoreData, setStoreData, Group } from "@/lib/store";

const QUERY_KEY = ["groups"];

export function useGroups() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getStoreData().groups ?? [],
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Group, "id">) => {
      const store = getStoreData();
      const group: Group = { ...data, id: uuidv4() };
      setStoreData({ ...store, groups: [...(store.groups ?? []), group] });
      return group;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Group) => {
      const store = getStoreData();
      setStoreData({ ...store, groups: (store.groups ?? []).map(g => g.id === data.id ? data : g) });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const store = getStoreData();
      setStoreData({ ...store, groups: (store.groups ?? []).filter(g => g.id !== id) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
