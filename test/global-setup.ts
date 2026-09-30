import { migrate } from "../scripts/migrate.mts";
import { loadTestEnv } from "./env.mts";

export default async function setup() {
  await migrate(loadTestEnv().DATABASE_URL);
}
