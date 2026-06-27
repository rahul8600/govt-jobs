import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        <li>
          <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4 text-slate-400" />
            {item.href ? (
              <Link 
                href={item.href} 
                className="text-slate-500 hover:text-blue-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-800 font-semibold" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
