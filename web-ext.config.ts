import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
  binaries: {
    edge: String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge`,
  },
});
