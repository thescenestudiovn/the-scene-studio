import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDB(): D1Database {
  const { env } = getCloudflareContext();
  return env.the_scene_studio_db;
}
