import * as io from "../utils/io";
import { LoadedDatum } from "./types";

function tryFind(data: unknown): LoadedDatum[] | undefined {
  if (!data) return undefined;
  if (typeof data !== 'object') return undefined;
  if (Array.isArray(data) && data.length > 0) { // TODO: message on 0 length?
    return data as LoadedDatum[];
  }
  if ('entries' in data) {
    return tryFind((data as any).entries);
  }
  if ('data' in data) {
    return tryFind((data as any).data);
  }

  // eslint-disable-next-line consistent-return
  Object.values(data).forEach(subData => {
    if (typeof subData === 'object') {
      const found = tryFind(subData);
      if (found) return found;
    }
  });

  throw new Error("Could not find data. JSON is expected to be an object with a property 'data' containing an array of data objects.");
}

/**
 * Try to extract an array of data points from a JSON object.
 * Expect it to be an object with a property `data` or `entries`.
 * Looks for the array recursively. <-- TODO: is this needed?
 */
function findEntries(data: Record<string, any> | any[]): LoadedDatum[] {
  const found = tryFind(data);
  if (!found) {
    throw new Error("Could not find data. JSON is expected to be an object with a property 'data' containing an array of data objects.");
  }
  return found;
}

export default async function loadData(filesOrPath: string | FileList): Promise<LoadedDatum[]> {
  const raw = await io.loadFile(filesOrPath);
  return findEntries(raw);
}
