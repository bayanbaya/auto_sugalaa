import { LayoutGrid } from "lucide-react";

interface ReportHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const ReportHeader = ({ title, description, icon }: ReportHeaderProps) => {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
       <div className="mr-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            {/* {icon || <LayoutGrid className="w-6 h-6 text-white" />} */}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
