"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Edit2, 
  BarChart2, 
  Share2, 
  Trash2,
  Loader2,
  Eye
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";

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

function getRandomImage(index: number) {
  return `/templates/${TEMPLATES_IMAGES[index % TEMPLATES_IMAGES.length]}`;
}

export default function FormsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: forms, isLoading, isError, refetch } = trpc.forms.getAllForms.useQuery();

  const { mutate: deleteForm } = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted successfully");
      utils.forms.getAllForms.invalidate();
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete form");
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    deleteForm({ id });
  };

  const filteredForms = forms?.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                          (f.description && f.description.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "All" || f.status === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()) || [];

  return (
    <div className="relative z-0 min-h-[calc(100vh-64px-2rem)] bg-[#f5f5f3] dark:bg-zinc-950 flex flex-col p-6 md:px-10 m-4 rounded-[2rem] border border-neutral-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
      
      {/* ── Background Decorative Blobs ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] dark:bg-emerald-900/10 rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] dark:bg-emerald-900/5 rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-[#f0ecd6] dark:bg-yellow-900/5 rounded-full blur-[90px] -z-10 pointer-events-none opacity-50" />

      {/* ── Header Area ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-dashed border-neutral-300 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-zinc-100 tracking-tight">Your Forms</h1>
          <p className="text-neutral-500 dark:text-zinc-400 text-sm mt-1">Manage and track all your form submissions</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/create-form">
            <button className="flex items-center gap-2 bg-[#2d351e] hover:bg-[#3a4427] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md shadow-[#2d351e]/20 hover:-translate-y-0.5">
              <Plus size={16} /> New Form
            </button>
          </Link>
        </div>
      </div>

      {/* ── Toolbar (Search, Filter) ── */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        
        {/* Search */}
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input 
            type="text" 
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/50 dark:bg-zinc-900/50 border border-dashed border-neutral-300 dark:border-zinc-800 text-neutral-900 dark:text-zinc-100 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d351e]/20 dark:focus:ring-zinc-700 transition-all backdrop-blur-sm"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            {["All", "Published", "Draft"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === f 
                    ? "bg-[#2d351e] dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md shadow-[#2d351e]/20" 
                    : "bg-transparent text-neutral-600 dark:text-zinc-400 hover:bg-neutral-200 dark:hover:bg-zinc-800 border border-neutral-300 dark:border-zinc-700 border-dashed"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dynamic Content Area ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-[235px] bg-neutral-200/50 dark:bg-zinc-800/50 animate-pulse rounded-[1.5rem] border border-dashed border-neutral-300" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full flex-1">
          <p className="text-red-500 dark:text-red-400 font-medium mb-4">Failed to load forms.</p>
          <button 
            onClick={() => refetch()} 
            className="px-6 py-2 bg-neutral-200 dark:bg-zinc-800 rounded-full hover:bg-neutral-300 dark:hover:bg-zinc-700 transition-colors font-semibold"
          >
            Retry
          </button>
        </div>
      ) : forms?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center flex-1">
          <div className="w-16 h-16 bg-[#e3ecd6] rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-[#8ba059]">
            <Search className="text-[#3a4427]" size={24} />
          </div>
          <h3 className="text-xl font-bold text-neutral-800 mb-2">No forms yet</h3>
          <p className="text-neutral-500 mb-6 max-w-sm">You haven't created any forms yet. Start building your first form to collect data!</p>
          <Link href="/create-form">
            <button className="flex items-center gap-2 bg-[#2d351e] hover:bg-[#3a4427] text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md shadow-[#2d351e]/20 hover:-translate-y-0.5">
              <Plus size={18} /> Create your first form
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0 border border-dashed border-neutral-300 dark:border-zinc-800 rounded-[3rem] overflow-hidden bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm">
          {filteredForms.map((form, idx) => (
            <div 
              key={form.id} 
              className="border-b border-r border-dashed border-neutral-300 dark:border-zinc-800 flex justify-center items-center hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-colors group relative p-1.5"
            >
              {/* Custom Form Card */}
              <div className="relative w-full max-w-[240px] bg-[#2d351e] dark:bg-zinc-800 rounded-[1.5rem] p-1.5 flex flex-col font-sans shadow-[0_15px_30px_-10px_rgba(45,53,30,0.25)] dark:shadow-none transition-all duration-300 hover:translate-y-[-2px]">
                
                {/* Top Image Section */}
                <div className="relative w-full h-[150px] bg-[#a8ba8d] dark:bg-zinc-700 rounded-[1rem] overflow-hidden z-20 group-hover:shadow-inner">
                  <img 
                    src={getRandomImage(idx + 5)}
                    alt={form.name}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1 backdrop-blur-md ${
                      form.status === 'published' 
                        ? 'bg-emerald-500/80 text-white' 
                        : 'bg-white/20 text-white/90 border border-white/10'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${form.status === 'published' ? 'bg-white' : 'bg-white/50'}`} />
                      {form.status}
                    </span>
                  </div>
                </div>

                {/* Bottom Details Section */}
                <div className="pt-2 pb-1.5 px-2 flex flex-col mt-0.5">
                  <h3 className="text-white text-sm font-semibold tracking-tight truncate mb-0.5" title={form.name}>
                    {form.name}
                  </h3>
                  
                  {form.description ? (
                    <p className="text-white/60 text-[10px] line-clamp-1 mb-1" title={form.description}>
                      {form.description}
                    </p>
                  ) : (
                    <p className="text-white/40 text-[10px] italic line-clamp-1 mb-1">
                      No description
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 truncate w-[60%]">
                      <span className="text-white/60 text-[10px] font-medium truncate">/{form.slug}</span>
                    </div>
                    <p className="text-white/40 text-[9px] font-medium shrink-0">
                      {new Date(form.createdAt as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-[1px] bg-white/10 my-2" />

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Link href={`/forms/${form.id}`}>
                        <button className="p-1 bg-white/5 hover:bg-white/20 rounded-md transition-colors text-white/70 hover:text-white" title="View Form Details">
                          <Eye size={12} />
                        </button>
                      </Link>
                      <Link href={`/forms/${form.id}/builder`}>
                        <button className="p-1 bg-white/5 hover:bg-white/20 rounded-md transition-colors text-white/70 hover:text-white" title="Edit Form">
                          <Edit2 size={12} />
                        </button>
                      </Link>
                      <Link href={`/forms/${form.id}/share`}>
                        <button className="p-1 bg-white/5 hover:bg-white/20 rounded-md transition-colors text-white/70 hover:text-white" title="Share Form">
                          <Share2 size={12} />
                        </button>
                      </Link>
                      <Link href={`/forms/${form.id}/responses`}>
                        <button className="p-1 bg-white/5 hover:bg-white/20 rounded-md transition-colors text-white/70 hover:text-white" title="Analytics">
                          <BarChart2 size={12} />
                        </button>
                      </Link>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDelete(form.id, form.name); }}
                      disabled={deletingId === form.id}
                      className="flex items-center gap-1 bg-white/10 hover:bg-red-500/80 transition-colors backdrop-blur-md py-1 pl-1.5 pr-2 rounded-full cursor-pointer text-white/80 hover:text-white shrink-0 disabled:opacity-50"
                    >
                      {deletingId === form.id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                      <span className="text-[9px] font-medium tracking-tight">{deletingId === form.id ? "Deleting..." : "Delete"}</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
          
          {/* Create New Form Placeholder */}
          <div className="border-b border-r border-dashed border-neutral-300 dark:border-zinc-800 flex justify-center items-center hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-colors p-1.5">
            <Link href="/create-form">
              <div className="w-full min-w-[200px] max-w-[240px] h-[235px] bg-[#e3ecd6]/30 dark:bg-zinc-800/30 rounded-[1.5rem] border-2 border-dashed border-[#8ba059]/40 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-[#d9e5c9]/50 dark:hover:bg-zinc-700/50 hover:border-[#8ba059] dark:hover:border-zinc-500 hover:translate-y-[-2px] cursor-pointer group">
                <div className="w-10 h-10 bg-white/60 dark:bg-zinc-700/60 rounded-full flex items-center justify-center border border-white dark:border-zinc-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="text-[#3a4427] dark:text-zinc-400 group-hover:text-[#2d351e] dark:group-hover:text-zinc-200 transition-colors" size={20} />
                </div>
                <p className="text-sm font-semibold text-[#3a4427] dark:text-zinc-400 group-hover:text-[#2d351e] dark:group-hover:text-zinc-200 transition-colors">Create New Form</p>
              </div>
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
