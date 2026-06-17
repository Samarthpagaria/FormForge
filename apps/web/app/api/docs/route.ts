import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  spec: { url: "/api/openapi" },
  theme: "purple",
  darkMode: true,
  layout: "modern",
  customCss: `
    :root {
      --scalar-color-accent: #5B21B6;
      --scalar-background-1: #0a0a0f;
      --scalar-background-2: #111118;
      --scalar-color-1: #ffffff;
      --scalar-color-2: #a0a0b0;
      --scalar-font: 'Geist', system-ui, sans-serif;
      --scalar-radius: 10px;
    }
    .scalar-card {
      border-radius: 12px !important;
    }
    .section-header {
      font-size: 11px !important;
      letter-spacing: 0.1em !important;
      text-transform: uppercase !important;
    }
  `,
});
