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
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-4 sm:p-6">
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 
        rounded-2xl p-6 mb-6
        shadow-[0_20px_40px_-15px_rgba(234,179,8,0.6)]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>

            <div className="p-3 bg-white/20 rounded-xl">
              <Car className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-white">Машин нэмэх</h1>
              <p className="text-white/90 text-sm mt-1">
                Сугалаанд шинэ машин нэмэх
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Premium Form</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-5 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="font-bold text-red-300">Алдаа гарлаа</h3>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-500/15 border border-green-500/40 rounded-2xl p-5 mb-6">
          <div className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="font-bold text-green-300">Амжилттай</h3>
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
        shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        <div className="p-8 space-y-8">

          {/* Image Upload */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <label className="text-lg font-bold text-yellow-400 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Машины зураг
            </label>

            <div className="flex gap-4 items-start">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-44 h-44 rounded-xl border-2 border-dashed border-white/20
                hover:border-yellow-400 cursor-pointer flex items-center justify-center
                overflow-hidden group"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover group-hover:scale-110 transition"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Зураг оруулах</p>
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

              <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                  <li>Макс хэмжээ: 5MB</li>
                  <li>JPG, PNG, WebP</li>
                  <li className="text-green-300">
                    /lotteryCars/{'{id}'}.jpg замд хадгалагдана
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Машины нэр', key: 'carName', icon: <Car className="w-4 h-4 text-yellow-400" />, placeholder: 'LEXUS 600' },
              { label: 'Дансны дугаар', key: 'iban', icon: <CreditCard className="w-4 h-4 text-yellow-400" />, placeholder: '5168040333' },
              { label: 'Эзэмшигчийн нэр', key: 'ibanName', icon: <User className="w-4 h-4 text-yellow-400" />, placeholder: 'Б.Өлзийням' },
              { label: 'Үнэ (₮)', key: 'price', icon: <DollarSign className="w-4 h-4 text-yellow-400" />, placeholder: '50,000' },
            ].map((item) => (
              <div key={item.key} className="space-y-2">
                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  {item.icon} {item.label} <span className="text-red-400">*</span>
                </label>
                <input
                  value={(formData as any)[item.key]}
                  onChange={(e) =>
                    item.key === 'price'
                      ? handlePriceChange(e.target.value)
                      : handleInputChange(item.key as any, e.target.value)
                  }
                  placeholder={item.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                  text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400/30
                  focus:border-yellow-400 outline-none transition"
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <Hash className="w-4 h-4 text-yellow-400" />
                Нийт сугалааны тоо <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.total || ''}
                onChange={(e) =>
                  handleInputChange('total', parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                text-white focus:ring-2 focus:ring-yellow-400/30 outline-none"
              />
            </div>
          </div>

          {/* FB */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-yellow-400" />
              Facebook холбоос
            </label>
            <input
              value={formData.fbLink}
              onChange={(e) => handleInputChange('fbLink', e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
              text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/30 p-6 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            <span className="text-red-400">*</span> Шаардлагатай талбарууд
          </p>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl font-bold text-gray-900
            bg-gradient-to-r from-yellow-400 to-amber-500
            hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]
            active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? 'Хадгалж байна...' : 'Машин нэмэх'}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}
