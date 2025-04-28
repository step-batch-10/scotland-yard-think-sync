import { RandomIndex } from "./models/types.ts";

export const randomNumber: RandomIndex = () => 1;

export function mapToObject<T>(map?: Map<string, T>) {
  if (!map) return {};

  return Object.fromEntries([...map.entries()]);
}

export function assingnAccordingly<T1, T2>(
  keys: T1[],
  values: T2[],
): [T1, T2][] {
  if (values.length > keys.length) {
    throw new Error("Values cannot exceed keys.");
  }

  const result: [T1, T2][] = [];

  let keyIndex = 0;

  for (let index = 0; index < values.length; index++) {
    const remainingKeys = keys.length - keyIndex;
    const remainingValues = values.length - index;

    const chunkSize = Math.ceil(remainingKeys / remainingValues);

    for (let i = 0; i < chunkSize; i++) {
      const key = keys[keyIndex++];
      result.push([key, values[index]]);
    }
  }

  return result;
}
