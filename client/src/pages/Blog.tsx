import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Eye, Tag, ChevronRight, Search } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  category: string;
  tags: string;
  author: string;
  views: number;
  created_at: string;
  featured: boolean;
}

export default function BlogList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ["blogs"],
    queryFn: async () => {
      const res = await fetch("/api/blogs");
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return res.json();
    },
  });

  const filtered = blogs.filter(b => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || b.category === category;
    return matchSearch && matchCat;
  });

  const featured = blogs.filter(b => b.featured).slice(0, 3);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-center">
        <h1 className="text-white font-black text-2xl mb-1">सरकारी Job Blog</h1>
        <p className="text-blue-200 text-sm">Latest Sarkari Job News & Updates</p>
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 mt-4 max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Blog search karo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 font-medium"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "job", "result", "admit-card", "answer-key", "admission"].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
              category === cat ? "bg-blue-700 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}>
            {cat === "all" ? "All" : cat === "job" ? "Jobs" : cat === "result" ? "Results" :
             cat === "admit-card" ? "Admit Card" : cat === "answer-key" ? "Answer Key" : "Admission"}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && category === "all" && !search && (
        <div>
          <h2 className="font-black text-slate-800 text-base mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map(blog => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
                  {blog.image_url ? (
                    <img src={blog.image_url} alt={blog.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-4xl">📋</span>
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">Featured</span>
                    <h3 className="font-bold text-slate-800 text-sm mt-2 line-clamp-2 group-hover:text-blue-700 transition-colors">{blog.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(blog.created_at).toLocaleDateString('en-IN')}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.views}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Blogs */}
      <div>
        <h2 className="font-black text-slate-800 text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          {category === "all" ? "Latest Articles" : `${category} Articles`} ({filtered.length})
        </h2>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <p className="text-slate-400 font-medium">Koi blog nahi mila</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(blog => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group flex">
                  {blog.image_url ? (
                    <img src={blog.image_url} alt={blog.title}
                      className="w-32 h-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-32 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-3xl">📋</span>
                    </div>
                  )}
                  <div className="p-4 flex-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      blog.category === 'job' ? 'bg-blue-100 text-blue-700' :
                      blog.category === 'result' ? 'bg-red-100 text-red-700' :
                      blog.category === 'admit-card' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>{blog.category}</span>
                    <h3 className="font-bold text-slate-800 text-sm mt-1.5 line-clamp-2 group-hover:text-blue-700 transition-colors">{blog.title}</h3>
                    {blog.excerpt && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{blog.excerpt}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(blog.created_at).toLocaleDateString('en-IN')}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.views}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
