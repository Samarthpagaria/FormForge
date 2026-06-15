"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#e5e5e5] flex items-center justify-center p-8">
      
      {/* Product Card */}
      <div className="relative w-[300px] bg-[#3a4427] rounded-[2rem] p-3 pb-6 flex flex-col font-sans shadow-2xl">
        
        {/* Top Image Section */}
        <div className="relative w-full h-[280px] bg-[#a8ba8d] rounded-[1.5rem] overflow-hidden z-20">
          <img 
            src="https://images.unsplash.com/photo-1622597467836-f38ec3175783?q=80&w=600&auto=format&fit=crop" 
            alt="Kiwi Juice"
            className="w-full h-full object-cover mix-blend-multiply opacity-90 scale-105"
          />
        </div>

        {/* Free Delivery Curved Banner */}
        <div className="relative h-10 bg-[#8b9e59] mx-0 rounded-b-[1.5rem] flex items-center justify-center z-10 shadow-sm -mt-4">
          <p className="text-[#f1f4e5] text-[10px] font-semibold tracking-wide pt-3">
            Free Delivery until 16/08/2026
          </p>
        </div>

        {/* Bottom Details Section */}
        <div className="pt-6 px-3 flex items-start justify-between">
          
          {/* Left Side: Title & Ingredients */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-white text-xl font-medium tracking-wide">Kiwi Juice</h3>
            <div className="flex gap-1.5">
              <span className="px-2 py-1 bg-white/10 text-white/80 text-[8px] rounded-md font-medium tracking-wider">Kiwi</span>
              <span className="px-2 py-1 bg-white/10 text-white/80 text-[8px] rounded-md font-medium tracking-wider">Ice Cream</span>
              <span className="px-2 py-1 bg-white/10 text-white/80 text-[8px] rounded-md font-medium tracking-wider">Milk</span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-10 bg-white/10 mx-4 mt-2" />

          {/* Right Side: Price & Action */}
          <div className="flex flex-col items-end shrink-0 pt-0.5">
            <p className="text-white text-3xl font-light mb-1 tracking-tight">12$</p>
            <button className="flex items-center gap-1 text-white/90 text-[10px] font-medium hover:text-white transition-colors group">
              Order Now 
              <ArrowUpRight size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
