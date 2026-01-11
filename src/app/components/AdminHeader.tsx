import { LayoutGrid, Plus, RefreshCw, Search } from "lucide-react";

type AdminHeaderProps = {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onRefresh: () => void;
  totalCars: number;
  onAddClick: () => void;
};

export const AdminHeader = ({
  searchTerm,
  setSearchTerm,
  onRefresh,
  totalCars,
  onAddClick,
}: AdminHeaderProps) => {

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Title Area */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Админ удирдлага
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                {totalCars} машин бүртгэлтэй
              </p>
            </div>
          </div>

          {/* Actions Area */}
          <div className="flex items-center gap-3 flex-1 md:justify-end">
            <div className="relative flex-1 md:max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                placeholder="Машин, эзэмшигч, дансаар хайх..."
              />
            </div>

            <button
              onClick={onRefresh}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
              title="Шинэчлэх"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 font-medium active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Нэмэх</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
