import { RandomIndex } from "./models/types.ts";

export const randomNumber: RandomIndex = () => 1;

export const reverseObject = <Type>(obj: { [key: string]: Type }) => {
  const reversedArray = Object.entries(obj).map(([k, v]) => [v, k]);

  return Object.fromEntries(reversedArray);
};

export function mapToObject<T>(map?: Map<string, T>) {
  if (!map) return {};

  return Object.fromEntries([...map.entries()]);
}
