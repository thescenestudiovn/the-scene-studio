import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDB(): D1Database {
  const { env } = getCloudflareContext();
  return env.the_scene_studio_db;
}

export async function getDBAsync(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.the_scene_studio_db;
}
