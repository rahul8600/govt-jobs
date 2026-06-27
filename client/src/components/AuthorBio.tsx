import { User, Award, Calendar, BookOpen } from "lucide-react";

interface AuthorBioProps {
  authorName?: string;
  authorRole?: string;
  authorBio?: string;
  publishedDate?: string;
  updatedDate?: string;
  readTime?: string;
}

export default function AuthorBio({
  authorName = "Rahul Sharma",
  authorRole = "Government Job Expert & Editor",
  authorBio = "Rahul Sharma is a former banking professional with 5+ years of experience in government exam preparation guidance. He specializes in SSC, Railway, Banking, and State PSC recruitment analysis. He has helped thousands of aspirants find their dream government job through accurate and timely information.",
  publishedDate,
  updatedDate,
  readTime = "5 min read",
}: AuthorBioProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 my-8">
      {/* Author Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
          {authorName.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-800 text-lg">{authorName}</h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3" />
              Verified Expert
            </span>
          </div>
          <p className="text-blue-600 text-sm font-medium">{authorRole}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
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

      {/* Bio */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-slate-700 text-sm leading-relaxed">{authorBio}</p>
      </div>

      {/* Expertise Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {["SSC", "Railway", "Banking", "UPSC", "State PSC", "Police", "Teaching"].map((tag) => (
          <span key={tag} className="bg-white text-slate-600 text-xs font-medium px-3 py-1 rounded-full border border-slate-200">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
