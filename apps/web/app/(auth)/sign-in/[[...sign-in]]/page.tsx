"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignInPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/dashboard");
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    }
    // Success redirect handled by onAuthStateChange listener!
  };

  const handleOAuth = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
      },
    });
  };

  return (
    <div className="w-full sm:w-[400px] h-[600px] mx-auto flex flex-col justify-center gap-5 bg-white dark:bg-zinc-900/80 p-8 sm:p-10 rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-neutral-200/60 dark:border-zinc-800/60 backdrop-blur-xl shrink-0">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-zinc-50">Welcome back</h1>
        <p className="text-sm text-neutral-500 dark:text-zinc-400 mt-2">Sign in to your account.</p>
      </div>



      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-zinc-300">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-neutral-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-zinc-300">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-neutral-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500 dark:text-zinc-400">
        Don't have an account?{" "}
        <Link href="/sign-up" className="text-blue-600 hover:underline dark:text-blue-400">
          Sign Up
        </Link>
      </p>
    </div>
  );
}