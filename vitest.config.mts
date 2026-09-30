import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { loadTestEnv } from "./test/env.mts";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    env: loadTestEnv(),
    globalSetup: ["./test/global-setup.ts"],
    setupFiles: ["./test/setup.ts"],
    // 테스트들이 하나의 test 브랜치 DB를 공유하므로 파일을 순차 실행한다.
    fileParallelism: false,
    // 원격 Neon DB를 실제로 쓰므로 기본 5초보다 넉넉하게 둔다.
    testTimeout: 30_000,
  },
});
