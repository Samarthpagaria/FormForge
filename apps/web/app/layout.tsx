import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/src/trpc/provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "FormForge",
  description: "FormForge application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_dHJ1c3RlZC1tYWNhcXVlLTI5LmNsZXJrLmFjY291bnRzLmRldiQ"}>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </ClerkProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}


