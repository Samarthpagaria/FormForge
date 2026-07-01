"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      if (data.session) {
        toast.success("Account created successfully!");
        router.push("/dashboard");
        router.refresh();
      } else {
        setIsSubmitted(true);
      }
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
      },
    });
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6 text-center bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-zinc-50">Check your email</h1>
        <p className="text-sm text-neutral-500 dark:text-zinc-400 leading-relaxed">
          We sent a verification link to <span className="font-semibold text-neutral-800 dark:text-zinc-200">{email}</span>. Click the link inside to get started!
        </p>
        <button
          onClick={() => window.open("https://mail.google.com", "_blank")}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors"
        >
          Open Gmail
        </button>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[400px] h-[600px] mx-auto flex flex-col justify-center gap-5 bg-white dark:bg-zinc-900/80 p-8 sm:p-10 rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-neutral-200/60 dark:border-zinc-800/60 backdrop-blur-xl shrink-0">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-zinc-50">Create an account</h1>
        <p className="text-sm text-neutral-500 dark:text-zinc-400 mt-2">Enter your details to get started.</p>
      </div>



      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-zinc-300">Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-neutral-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>
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
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-blue-600 hover:underline dark:text-blue-400">
          Sign In
        </Link>
      </p>
    </div>
  );
}