import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import App from "./App";
import "./style.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <Theme accentColor="blue" grayColor="slate" radius="medium" scaling="95%">
      <App />
    </Theme>
  </StrictMode>
);
