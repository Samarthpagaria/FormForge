"use client";

import React from "react";
import { BookOpen, Rocket, Link as LinkIcon, Code } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="relative z-0 min-h-[calc(100vh-64px-2rem)] bg-[#f5f5f3] flex flex-col p-6 md:px-10 m-4 rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-dashed border-neutral-300 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">Documentation</h1>
          <p className="text-neutral-500 text-sm mt-1">Learn how to build, share, and analyze forms.</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        
        {/* Getting Started */}
        <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-3xl p-8 shadow-sm">
          <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-6">
            <Rocket size={24} />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-3">Getting Started</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-4">
            Welcome to FormForge! Our platform allows you to create beautiful, dynamic forms without writing a single line of code. Simply navigate to the Dashboard to see an overview of your activity, or jump straight into the Forms tab to create your first form.
          </p>
        </div>

        {/* Creating a Form */}
        <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-3xl p-8 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <BookOpen size={24} />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-3">Creating a Form</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-4">
            Click the "New Form" button anywhere in the app. You can either build one manually using our drag-and-drop Builder, or use our AI Generator to instantly spin up a form based on a simple text prompt. You can customize the schema, validations, and themes.
          </p>
        </div>

        {/* Sharing */}
        <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-3xl p-8 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <LinkIcon size={24} />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-3">Sharing & Publishing</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-4">
            Once your form is ready, click the "Share" tab within the form dashboard. From there, you must "Publish" the form to make it live. You'll receive a public link, an embed code for your website, and a QR code.
          </p>
        </div>

        {/* API Reference */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-md relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Code size={120} />
          </div>
          <div className="w-12 h-12 bg-neutral-800 text-neutral-300 rounded-xl flex items-center justify-center mb-6 relative z-10">
            <Code size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-3 relative z-10">API Reference</h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6 relative z-10">
            Explore the FormForge REST API with interactive Scalar documentation. Test endpoints, review schemas, and integrate programmatically.
          </p>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors relative z-10"
          >
            Open Scalar Docs
          </a>
        </div>

      </div>
    </div>
  );
}
