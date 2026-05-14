import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Eye, Tag, ArrowLeft, Share2 } from "lucide-react";
import { Link } from "wouter";

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  tags: string;
  author: string;
  views: number;
  created_at: string;
}

export default function BlogDetail() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: blog, isLoading } = useQuery<Blog>({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/${slug}`);
      if (!res.ok) throw new Error("Blog not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!blog) return (
    <div className="text-center py-16">
      <p className="text-slate-400 text-lg font-medium">Blog not found</p>
      <Link href="/blog"><button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm">Go Back</button></Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back */}
      <Link href="/blog">
        <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>
      </Link>

      {/* Article */}
      <article className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Image */}
        {blog.image_url ? (
          <img src={blog.image_url} alt={blog.title} className="w-full object-contain bg-white" style={{maxHeight: "600px"}} />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="text-6xl">📋</span>
          </div>
        )}

        <div className="p-5 md:p-8">
          {/* Category Badge */}
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            blog.category === 'job' ? 'bg-blue-100 text-blue-700' :
            blog.category === 'result' ? 'bg-red-100 text-red-700' :
            blog.category === 'admit-card' ? 'bg-green-100 text-green-700' :
            'bg-purple-100 text-purple-700'
          }`}>{blog.category?.toUpperCase()}</span>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-3 leading-snug">{blog.title}</h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 pb-4 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Eye className="w-3.5 h-3.5" /> {blog.views} views
            </span>
            <button onClick={handleShare}
              className="ml-auto flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {/* Content */}
          <div
            className="prose prose-sm max-w-none mt-5 text-slate-700 leading-relaxed"
            style={{ lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: blog.content || blog.excerpt || '' }}
          />

          {/* Tags */}
          {blog.tags && (
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100">
              <Tag className="w-4 h-4 text-slate-400" />
              {blog.tags.split(',').map(tag => (
                <span key={tag} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
