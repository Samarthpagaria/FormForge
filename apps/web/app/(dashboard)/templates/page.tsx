"use client";

import React, { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";

// Static categories for now
const CATEGORIES = ["All", "Feedback", "Events", "HR", "Sales"];

// Sample template images from public/templates
const TEMPLATES_IMAGES = [
  "163cd3adf4e0090bc60f98ebd9d9f475.jpg",
  "1ddc1703374fabb5fd617462254c1ffe.jpg",
  "31cef82ad7e7c2a396dee744e37d0532.jpg",
  "3a19281d2cefdc62a6b0eea323a075fa.jpg",
  "iage10.jpg",
  "image11.jpg",
  "image12.jpg",
  "image13.jpg",
  "image2.jpg",
  "image3.jpg",
  "image4.jpg"
];

// Helper to shuffle or pick random images
function getRandomImage(index: number) {
  // Using index ensures it's stable across re-renders for the same item
  return `/templates/${TEMPLATES_IMAGES[index % TEMPLATES_IMAGES.length]}`;
}

const TEMPLATES = [
  { id: 1, name: "Customer Feedback" },
  { id: 2, name: "Event Registration" },
  { id: 3, name: "Job Application" },
  { id: 4, name: "Contact Form" },
  { id: 5, name: "Survey Form" },
  { id: 6, name: "Order Form" },
  { id: 7, name: "Support Ticket" },
  { id: 8, name: "Bug Report" },
];

export default function TemplatesPage() {
  return (
    <div className="relative z-0 min-h-[calc(100vh-64px-2rem)] bg-[#f5f5f3] flex flex-col p-6 md:px-10 m-4 rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden">
      
      {/* ── Background Decorative Blobs ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-[#f0ecd6] rounded-full blur-[90px] -z-10 pointer-events-none opacity-50" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-dashed border-neutral-300 gap-4">
        <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">Templates</h1>
        
        {/* Category Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {CATEGORIES.map((cat, idx) => (
            <button 
              key={cat} 
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                idx === 0 
                  ? "bg-[#2d351e] text-white shadow-md shadow-[#2d351e]/20" 
                  : "bg-transparent text-neutral-600 hover:bg-neutral-200 border border-neutral-300 border-dashed"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container with Outer Dashed Border */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border border-dashed border-neutral-300 rounded-[3rem] overflow-hidden bg-white/30 backdrop-blur-sm">
        
        {TEMPLATES.map((template, idx) => (
          // Inner Grid Cells with Dashed Borders
          // Using a subtle dashed border on the bottom/right to create the grid effect inside
          <div 
            key={template.id} 
            className="p-6 border-b border-r border-dashed border-neutral-300 flex justify-center items-center hover:bg-white/50 transition-colors"
          >
            
            {/* User's Custom Product Card */}
            <div className="relative w-full max-w-[240px] bg-[#2d351e] rounded-[2rem] p-1.5 flex flex-col font-sans shadow-[0_25px_50px_-12px_rgba(45,53,30,0.25)] transition-all duration-300 hover:translate-y-[-4px]">
              
              {/* Top Image Section */}
              <div className="relative w-full h-[200px] bg-[#a8ba8d] rounded-[1.5rem] overflow-hidden z-20 group">
                <img 
                  src={getRandomImage(idx)} 
                  alt={template.name}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110"
                />
                {/* Subtle dark gradient overlay over image bottom for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Bottom Details Section */}
              <div className="pt-2 pb-2 px-3 flex items-center justify-between mt-1">
                
                {/* Left Side: Title */}
                <div className="flex flex-col flex-1 pr-2">
                  <h3 className="text-white text-base font-semibold tracking-tight truncate" title={template.name}>
                    {template.name}
                  </h3>
                </div>

                {/* Right Side: Action Badge */}
                <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md py-1 pl-2.5 pr-2 rounded-full cursor-pointer group shrink-0">
                  <span className="text-white font-medium text-[10px] tracking-tight">Use</span>
                  <ArrowUpRight size={12} className="text-white/80 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

              </div>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}