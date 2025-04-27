import { RandomIndex } from "./models/types.ts";

export const randomNumber: RandomIndex = () => 1;

export function mapToObject<T>(map?: Map<string, T>) {
  if (!map) return {};

  return Object.fromEntries([...map.entries()]);
}
