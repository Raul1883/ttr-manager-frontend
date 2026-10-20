import { pb } from "./PocketBase";
import type { CollectionName } from "./collections";

export const create = async <P, R>(
  collectionName: CollectionName,
  data: P,
): Promise<R> => {
  return await pb
    .collection(collectionName)
    .create<R>(data as Record<string, unknown>);
};

export const getAll = async <T>(collectionName: CollectionName): Promise<T[]> => {
  return await pb.collection(collectionName).getFullList<T>();
};

export const getById = async <T>(
  collectionName: CollectionName,
  id: string,
): Promise<T> => {
  return await pb.collection(collectionName).getOne<T>(id);
};

export const update = async <P, R>(
  collectionName: CollectionName,
  id: string,
  data: Partial<P>,
): Promise<R> => {
  return await pb
    .collection(collectionName)
    .update<R>(id, data as Record<string, unknown>);
};

export const deleteById = async (
  collectionName: CollectionName,
  id: string,
): Promise<boolean> => {
  return await pb.collection(collectionName).delete(id);
};
