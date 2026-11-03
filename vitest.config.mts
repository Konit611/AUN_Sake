import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// lib/ の純粋なロジックと content/ の整合性だけをテストする（コンポーネントの描画は対象外）
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL("./", import.meta.url)) },
      // Next.js の外では "server-only" を解決できないので空のモジュールに置き換える
      { find: "server-only", replacement: fileURLToPath(new URL("./test/server-only.ts", import.meta.url)) },
    ],
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "test/**/*.test.ts"],
  },
});
