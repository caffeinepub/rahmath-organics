import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "../backend";
import { useActor } from "./useActor";

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductsFromAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsFromAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrder(orderId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && !!orderId,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProductWithoutVendor(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      vendorId,
    }: { productId: string; vendorId: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(productId, vendorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useKvGetAll() {
  const { actor } = useActor();
  return useQuery<Array<[string, string]>>({
    queryKey: ["kv-store"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.kvGetAll();
    },
    enabled: !!actor,
    staleTime: 0, // always consider data stale so refetch is triggered
    refetchInterval: 10000, // poll every 10 seconds so other devices see new products
  });
}

export function useKvSet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.kvSet(key, value);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["kv-store"] });
    },
  });
}

export function useKvDelete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.kvDelete(key);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["kv-store"] });
    },
  });
}
