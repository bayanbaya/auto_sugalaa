import { Car, Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CarListHeaderProps {
  filteredCars: any[];
  onRefresh: () => void;
}

export default function AdminHeader({ filteredCars, onRefresh }: CarListHeaderProps) {
  const router = useRouter();

  return (
    <div className="w-full bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-xl border-b border-gray-200/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-sm">
              <Car className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Машины жагсаалт
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {filteredCars.length} машин
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 group"
              title="Шинэчлэх"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/admin/add-car')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Нэмэх
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200/30 to-transparent" />
    </div>
  );
}