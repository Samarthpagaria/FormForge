import React from "react";
import { User, Mail, MessageSquare, Lock, Star, Bell, Send } from "lucide-react";

export type FormVariant = "contact" | "registration" | "feedback" | "newsletter" | "login";

interface AestheticFormCardProps {
  variant?: FormVariant;
}

export function AestheticFormCard({ variant = "contact" }: AestheticFormCardProps) {
  const variantStyles = {
    contact: "bg-blue-50/90 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/60",
    registration: "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/60",
    feedback: "bg-amber-50/90 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/60",
    newsletter: "bg-violet-50/90 dark:bg-violet-950/30 border-violet-200/60 dark:border-violet-800/60",
    login: "bg-rose-50/90 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/60",
  };

  return (
    <div className={`w-[320px] rounded-2xl backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity duration-300 border ${variantStyles[variant]}`}>
      
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-zinc-100">
          {variant === "contact" && "Get in touch"}
          {variant === "registration" && "Create an account"}
          {variant === "feedback" && "Share your thoughts"}
          {variant === "newsletter" && "Stay updated"}
          {variant === "login" && "Welcome back"}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">
          {variant === "contact" && "We'd love to hear from you. Please fill out this form."}
          {variant === "registration" && "Join thousands of users building forms today."}
          {variant === "feedback" && "Your feedback helps us improve our product."}
          {variant === "newsletter" && "Subscribe to our newsletter for the latest updates."}
          {variant === "login" && "Sign in to your FormForge account to continue."}
        </p>
      </div>

      <div className="space-y-4 mt-2">
        {/* Contact Variant */}
        {variant === "contact" && (
          <>
            <Field label="Full Name" icon={<User size={14} />} value="John Doe" />
            <Field label="Email Address" icon={<Mail size={14} />} value="john@example.com" />
            <Field label="Message" icon={<MessageSquare size={14} />} value="How can we help?" isTextarea />
          </>
        )}

        {/* Registration Variant */}
        {variant === "registration" && (
          <>
            <Field label="Full Name" icon={<User size={14} />} value="Jane Smith" />
            <Field label="Email Address" icon={<Mail size={14} />} value="jane@company.com" />
            <Field label="Password" icon={<Lock size={14} />} value="••••••••" />
          </>
        )}

        {/* Feedback Variant */}
        {variant === "feedback" && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-600 dark:text-zinc-300">How would you rate us?</label>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} className={star <= 4 ? "text-amber-400 fill-amber-400" : "text-neutral-200 dark:text-zinc-700"} />
                ))}
              </div>
            </div>
            <Field label="What can we improve?" icon={<MessageSquare size={14} />} value="More templates would be nice." isTextarea />
          </>
        )}

        {/* Newsletter Variant */}
        {variant === "newsletter" && (
          <>
            <Field label="Email Address" icon={<Mail size={14} />} value="alex@example.com" />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-600 dark:text-zinc-300">Topics of interest</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {["Product Updates", "Design Tips", "Engineering"].map((tag, i) => (
                  <span key={tag} className={`text-[10px] px-2 py-1 rounded-full border ${i === 0 ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400" : "border-neutral-200 text-neutral-500 dark:border-zinc-700 dark:text-zinc-400"}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Login Variant */}
        {variant === "login" && (
          <>
            <Field label="Email Address" icon={<Mail size={14} />} value="user@formforge.app" />
            <Field label="Password" icon={<Lock size={14} />} value="••••••••" />
          </>
        )}
      </div>

      <div className="mt-2 pt-4 border-t border-neutral-100 dark:border-zinc-800/50">
        <div className="h-10 w-full rounded-lg bg-neutral-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-sm font-medium hover:bg-neutral-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer gap-2">
          {variant === "contact" && "Send Message"}
          {variant === "registration" && "Sign Up"}
          {variant === "feedback" && "Submit Feedback"}
          {variant === "newsletter" && "Subscribe"}
          {variant === "login" && "Sign In"}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, value, isTextarea = false }: { label: string; icon: React.ReactNode; value: string; isTextarea?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-neutral-600 dark:text-zinc-300">{label}</label>
      <div className="relative">
        <div className={`absolute left-3 ${isTextarea ? "top-3" : "top-1/2 -translate-y-1/2"} text-neutral-400`}>
          {icon}
        </div>
        <div className={`w-full rounded-lg border border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-800/20 pl-9 pr-3 flex ${isTextarea ? "h-20 pt-2.5 items-start" : "h-9 items-center"}`}>
          <span className="text-xs text-neutral-400 dark:text-zinc-500">{value}</span>
        </div>
      </div>
    </div>
  );
}

