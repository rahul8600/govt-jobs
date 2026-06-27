import { Calendar, BookOpen, Shield } from "lucide-react";

interface AuthorBioProps {
  publishedDate?: string;
  updatedDate?: string;
  readTime?: string;
}

export default function AuthorBio({
  publishedDate,
  updatedDate,
  readTime = "5 min read",
}: AuthorBioProps) {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-5 border border-slate-200 my-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-bold text-slate-800 text-sm">SarkariJobSeva Editorial Team</p>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              Verified Information
            </span>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">
            Yeh information hamare team dwara official government websites se verify karke publish ki gayi hai. Apply karne se pehle official notification zaroor padhen.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
            {publishedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Published: {publishedDate}
              </span>
            )}
            {updatedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Updated: {updatedDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {readTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
