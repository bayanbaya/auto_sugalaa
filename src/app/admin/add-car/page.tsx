'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car,
  ArrowLeft,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Hash,
  User,
  CreditCard,
  Link as LinkIcon,
  Sparkles,
  Power,
  EyeOff,
} from 'lucide-react';

interface FormData {
  img: string;
  iban: string;
  ibanName: string;
  price: string;
  fbLink: string;
  carName: string;
  total: number;
  sold: number;
  status: string;
}

interface FormErrors {
  iban?: string;
  ibanName?: string;
  price?: string;
  carName?: string;
  total?: string;
  fbLink?: string;
}

export default function AddCarPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    img: '',
    iban: '',
    ibanName: '',
    price: '',
    fbLink: '',
    carName: '',
    total: 0,
    sold: 0,
    status: 'active',
  });

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.carName.trim()) {
      errors.carName = 'Машины нэр шаардлагатай';
    }

    if (!formData.iban.trim()) {
      errors.iban = 'Дансны дугаар шаардлагатай';
    } else if (!/^\d+$/.test(formData.iban)) {
      errors.iban = 'Зөвхөн тоо оруулна уу';
    }

    if (!formData.ibanName.trim()) {
      errors.ibanName = 'Эзэмшигчийн нэр шаардлагатай';
    }

    if (!formData.price.trim()) {
      errors.price = 'Үнэ шаардлагатай';
    } else {
      const priceValue = formData.price.replace(/[,₮\s]/g, '');
      if (!/^\d+$/.test(priceValue) || parseInt(priceValue) <= 0) {
        errors.price = 'Буруу үнийн формат';
      }
    }

    if (!formData.total || formData.total <= 0) {
      errors.total = 'Нийт тоо эерэг тоо байх ёстой';
    }

    if (formData.fbLink && !formData.fbLink.startsWith('http')) {
      errors.fbLink = 'Холбоос http эсвэл https-ээр эхлэх ёстой';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  // Format price with commas
  const formatPriceInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Handle price input
  const handlePriceChange = (value: string) => {
    const formatted = formatPriceInput(value);
    handleInputChange('price', formatted);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Зургийн хэмжээ 5MB-аас бага байх ёстой');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Зөвхөн зургийн файл оруулна уу');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      handleInputChange('img', result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Бүх шаардлагатай талбаруудыг зөв бөглөнө үү');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/cars/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Алдаа гарлаа');
      }

      setSuccess('Машин амжилттай нэмэгдлээ!');

      // Reset form
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Машин нэмэхэд алдаа гарлаа';
      setError(errorMsg);
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-2xl p-6 mb-6 border border-yellow-400">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white">Машин нэмэх</h1>
                <p className="text-white/90 text-sm mt-1">Сугалаанд шинэ машин нэмэх</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Premium Form</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-500 rounded-2xl p-5 mb-6 animate-in slide-in-from-top">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-red-200 text-lg mb-1">Алдаа гарлаа</h3>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-500/20 backdrop-blur-sm border-2 border-green-500 rounded-2xl p-5 mb-6 animate-in slide-in-from-top">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-green-200 text-lg mb-1">Амжилттай</h3>
                <p className="text-green-300">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <label className="block text-lg font-bold text-yellow-400 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Машины зураг
              </label>
              <div className="flex gap-4 items-start">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-48 h-48 bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-600 hover:border-yellow-500 transition-all cursor-pointer flex items-center justify-center overflow-hidden group"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-12 h-12 text-gray-500 mx-auto mb-2 group-hover:text-yellow-400 transition-colors" />
                      <p className="text-sm text-gray-400">Зураг оруулах</p>
                      <p className="text-xs text-gray-500 mt-1">Макс 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex-1">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-sm text-blue-300 mb-2">💡 Зааварчилгаа:</p>
                    <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                      <li>Зургийн хэмжээ: Макс 5MB</li>
                      <li>Формат: JPG, PNG, WebP</li>
                      <li>Зөвлөмж: 800x600px эсвэл дээш</li>
                      <li className="text-green-300">✅ Зураг автоматаар /lotteryCars/{'{id}'}.jpg замд хадгалагдана</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Car Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                  <Car className="w-4 h-4 text-yellow-400" />
                  Машины нэр <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.carName}
                  onChange={(e) => handleInputChange('carName', e.target.value)}
                  placeholder="Жишээ: LEXUS 600"
                  className={`w-full px-4 py-3 bg-gray-700/50 border ${
                    formErrors.carName ? 'border-red-500' : 'border-gray-600'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all`}
                />
                {formErrors.carName && <p className="text-red-400 text-xs mt-1">{formErrors.carName}</p>}
              </div>

              {/* IBAN */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-yellow-400" />
                  Дансны дугаар <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => handleInputChange('iban', e.target.value)}
                  placeholder="Жишээ: 5168040333"
                  className={`w-full px-4 py-3 bg-gray-700/50 border ${
                    formErrors.iban ? 'border-red-500' : 'border-gray-600'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all font-mono`}
                />
                {formErrors.iban && <p className="text-red-400 text-xs mt-1">{formErrors.iban}</p>}
              </div>

              {/* IBAN Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-yellow-400" />
                  Эзэмшигчийн нэр <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ibanName}
                  onChange={(e) => handleInputChange('ibanName', e.target.value)}
                  placeholder="Жишээ: Б.Өлзийням"
                  className={`w-full px-4 py-3 bg-gray-700/50 border ${
                    formErrors.ibanName ? 'border-red-500' : 'border-gray-600'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all`}
                />
                {formErrors.ibanName && <p className="text-red-400 text-xs mt-1">{formErrors.ibanName}</p>}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  Үнэ (₮) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="Жишээ: 50,000"
                  className={`w-full px-4 py-3 bg-gray-700/50 border ${
                    formErrors.price ? 'border-red-500' : 'border-gray-600'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all`}
                />
                {formErrors.price && <p className="text-red-400 text-xs mt-1">{formErrors.price}</p>}
              </div>

              {/* Total */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-yellow-400" />
                  Нийт сугалааны тоо <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.total || ''}
                  onChange={(e) => handleInputChange('total', parseInt(e.target.value) || 0)}
                  placeholder="Жишээ: 9899"
                  min="1"
                  className={`w-full px-4 py-3 bg-gray-700/50 border ${
                    formErrors.total ? 'border-red-500' : 'border-gray-600'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all`}
                />
                {formErrors.total && <p className="text-red-400 text-xs mt-1">{formErrors.total}</p>}
              </div>
            </div>

            {/* Facebook Link - Full Width */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-yellow-400" />
                Facebook холбоос
              </label>
              <input
                type="url"
                value={formData.fbLink}
                onChange={(e) => handleInputChange('fbLink', e.target.value)}
                placeholder="https://www.facebook.com/..."
                className={`w-full px-4 py-3 bg-gray-700/50 border ${
                  formErrors.fbLink ? 'border-red-500' : 'border-gray-600'
                } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all`}
              />
              {formErrors.fbLink && <p className="text-red-400 text-xs mt-1">{formErrors.fbLink}</p>}
            </div>

            {/* Status Toggle */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                <Power className="w-4 h-4 text-yellow-400" />
                Төлөв
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'active')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 transition-all ${
                    formData.status === 'active'
                      ? 'bg-green-500/20 border-green-500 text-green-300'
                      : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Power className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-bold text-sm">Идэвхтэй</p>
                    <p className="text-xs opacity-75">Вэбсайт дээр харагдана</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'inactive')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 transition-all ${
                    formData.status === 'inactive'
                      ? 'bg-gray-500/20 border-gray-500 text-gray-300'
                      : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <EyeOff className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-bold text-sm">Идэвхгүй</p>
                    <p className="text-xs opacity-75">Нууцлагдсан</p>
                  </div>
                </button>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                <p className="text-xs text-yellow-300">
                  💡 "Идэвхгүй" төлөвтэй машинууд зөвхөн админд харагдана, хэрэглэгчид харагдахгүй
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-900/50 p-6 border-t border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-gray-400">
                <span className="text-red-400">*</span> Шаардлагатай талбарууд
              </p>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg hover:shadow-yellow-500/50 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Хадгалж байна...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Машин нэмэх
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
