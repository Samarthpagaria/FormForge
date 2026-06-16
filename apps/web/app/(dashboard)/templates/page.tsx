"use client";

import React, { useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { trpc } from "@/src/trpc/client";
import { useRouter } from "next/navigation";

// Sample template images from public/templates
const TEMPLATES_IMAGES = [
  "163cd3adf4e0090bc60f98ebd9d9f475.jpg",
  "1ddc1703374fabb5fd617462254c1ffe.jpg",
  "31cef82ad7e7c2a396dee744e37d0532.jpg",
  "3a19281d2cefdc62a6b0eea323a075fa.jpg",
  "3ffbbd1f81cdd606d049635a6c74fc21.jpg",
  "4274f1654027b7e409b2bb09d71a61d3.jpg",
  "628e2610a3e174740a14a350a11e88f8.jpg",
  "74e7847000ae46cc2b4a111ed94578bf.jpg",
  "775bc2f2983313dbd87e60683fa57575.jpg",
  "78bc5ddb1ae40c453058a3850946904f.jpg",
  "7b1d7c0099f4a47f3ff60f673ca76d60.jpg",
  "862348e9fc788c556cc2e3171e5aa54f.jpg",
  "915c799818cd242893285b25e865aac5.jpg",
  "94c742110ef29612384e8eaa36003e5c.jpg",
  "a8323fdbe1bad8d35cf0b36060af1834.jpg",
  "a8861988525237d0d8ed462426d81592.jpg",
  "abd389d19bce9a72046897eff20acd57.jpg",
  "d5176c47761d105078e752d669d11e07.jpg",
  "fbfb9c5fd3fe5eb2800bcccc8b2d47b0.jpg",
  "iage10.jpg",
  "image11.jpg",
  "image12.jpg",
  "image13.jpg",
  "image14.jpg",
  "image15.jpg",
  "image16.jpg",
  "image17.jpg",
  "image18.jpg",
  "image19.jpg",
  "image2.jpg",
  "image20.jpg",
  "image3.jpg",
  "image4.jpg",
  "image5.jpg",
  "image5.png",
  "image6.jpg",
  "image7.jpg",
  "image8.jpg",
  "image9.jpg",
  "sceneray.jpg"
];

// Helper to shuffle or pick random images
function getRandomImage(index: number) {
  return `/templates/${TEMPLATES_IMAGES[index % TEMPLATES_IMAGES.length]}`;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const { data: categories, isLoading: loadingCategories } = trpc.templates.getAllCategories.useQuery();
  const { data: templates, isLoading: loadingTemplates } = trpc.templates.getAll.useQuery();
  
  const { mutate: createForm } = trpc.templates.createFormFromTemplate.useMutation({
    onSuccess: (data) => {
      router.push(`/forms/${data.id}/builder`);
    },
    onSettled: () => {
      setCreatingId(null);
    }
  });

  const handleUseTemplate = (templateId: string, name: string, description?: string | null) => {
    setCreatingId(templateId);
    createForm({ templateId, name, description: description || undefined });
  };

  const filteredTemplates = templates?.filter(t => 
    selectedCategory === "All" || t.categoryId === selectedCategory
  ) || [];

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
          {loadingCategories ? (
            <div className="h-8 w-48 bg-neutral-200/50 animate-pulse rounded-full" />
          ) : (
            <>
              <button 
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategory === "All" 
                    ? "bg-[#2d351e] text-white shadow-md shadow-[#2d351e]/20" 
                    : "bg-transparent text-neutral-600 hover:bg-neutral-200 border border-neutral-300 border-dashed"
                }`}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    selectedCategory === cat.id 
                      ? "bg-[#2d351e] text-white shadow-md shadow-[#2d351e]/20" 
                      : "bg-transparent text-neutral-600 hover:bg-neutral-200 border border-neutral-300 border-dashed"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Grid Container */}
      {loadingTemplates ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border border-dashed border-neutral-300 rounded-[3rem] overflow-hidden bg-white/30 backdrop-blur-sm">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-6 border-b border-r border-dashed border-neutral-300 flex justify-center items-center">
              <div className="w-full h-[240px] bg-neutral-200/50 animate-pulse rounded-[2rem]" />
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] border border-dashed border-neutral-300 rounded-[3rem] bg-white/30 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">No templates in this category</h3>
          <p className="text-sm text-neutral-500">Check back later or browse another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border border-dashed border-neutral-300 rounded-[3rem] overflow-hidden bg-white/30 backdrop-blur-sm">
          {filteredTemplates.map((template, idx) => (
            <div 
              key={template.id} 
              className="p-6 border-b border-r border-dashed border-neutral-300 flex justify-center items-center hover:bg-white/50 transition-colors"
            >
              {/* Custom Template Card */}
              <div className="relative w-full max-w-[240px] bg-[#2d351e] rounded-[2rem] p-1.5 flex flex-col font-sans shadow-[0_25px_50px_-12px_rgba(45,53,30,0.25)] transition-all duration-300 hover:translate-y-[-4px]">
                
                {/* Top Image Section */}
                <div className="relative w-full h-[200px] bg-[#a8ba8d] rounded-[1.5rem] overflow-hidden z-20 group">
                  <img 
                    src={getRandomImage(idx)} 
                    alt={template.name}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110"
                  />
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
                  <button 
                    disabled={!!creatingId}
                    onClick={() => handleUseTemplate(template.id, template.name, template.description)}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md py-1 pl-2.5 pr-2 rounded-full cursor-pointer group shrink-0 disabled:opacity-50 disabled:cursor-wait"
                  >
                    <span className="text-white font-medium text-[10px] tracking-tight">
                      {creatingId === template.id ? "Using..." : "Use"}
                    </span>
                    {creatingId === template.id ? (
                      <Loader2 size={12} className="text-white animate-spin" />
                    ) : (
                      <ArrowUpRight size={12} className="text-white/80 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}