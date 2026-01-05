'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Car,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Hash,
  User,
  CreditCard,
  Link as LinkIcon,
  X,
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

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddCarModal = ({ isOpen, onClose, onSuccess }: AddCarModalProps) => {
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
      const timer = setTimeout(() => {
        setSuccess('');
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose, onSuccess]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
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
      setImagePreview('');
      setError('');
      setSuccess('');
      setFormErrors({});
    }
  }, [isOpen]);

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

    if (file.size > 5 * 1024 * 1024) {
      setError('Зургийн хэмжээ 5MB-аас бага байх ёстой');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Зөвхөн зургийн файл оруулна уу');
      return;
    }

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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Машин нэмэхэд алдаа гарлаа';
      setError(errorMsg);
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-2xl shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-t-2xl p-6 shadow-[0_10px_30px_-10px_rgba(234,179,8,0.6)]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Машин нэмэх</h2>
                  <p className="text-white/90 text-sm mt-1">
                    Сугалаанд шинэ машин нэмэх
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-6 mt-6 bg-red-500/15 border border-red-500/40 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-300 text-sm">Алдаа гарлаа</h3>
                    <p className="text-red-200 text-xs">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mx-6 mt-6 bg-green-500/15 border border-green-500/40 rounded-xl p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-300 text-sm">Амжилттай</h3>
                    <p className="text-green-200 text-xs">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6 max-h-[calc(100vh-20rem)] overflow-y-auto px-1">
                {/* Image Upload */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                  <label className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Машины зураг
                  </label>

                  <div className="flex gap-4 items-start">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 rounded-xl border-2 border-dashed border-white/20
                      hover:border-yellow-400 cursor-pointer flex items-center justify-center
                      overflow-hidden group transition-all"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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

                    <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                      <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                        <li>Макс хэмжээ: 5MB</li>
                        <li>JPG, PNG, WebP</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Машины нэр', key: 'carName', icon: <Car className="w-4 h-4 text-yellow-400" />, placeholder: 'LEXUS 600' },
                    { label: 'Дансны дугаар', key: 'iban', icon: <CreditCard className="w-4 h-4 text-yellow-400" />, placeholder: '5168040333' },
                    { label: 'Эзэмшигчийн нэр', key: 'ibanName', icon: <User className="w-4 h-4 text-yellow-400" />, placeholder: 'Б.Өлзийням' },
                    { label: 'Үнэ (₮)', key: 'price', icon: <DollarSign className="w-4 h-4 text-yellow-400" />, placeholder: '50,000' },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
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
                        className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm
                          text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400/30
                          focus:border-yellow-400 outline-none transition ${
                            formErrors[item.key as keyof FormErrors]
                              ? 'border-red-500/50'
                              : 'border-white/10'
                          }`}
                      />
                      {formErrors[item.key as keyof FormErrors] && (
                        <p className="text-xs text-red-400">
                          {formErrors[item.key as keyof FormErrors]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-yellow-400" />
                      Нийт сугалааны тоо <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.total || ''}
                      onChange={(e) =>
                        handleInputChange('total', parseInt(e.target.value) || 0)
                      }
                      className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm
                        text-white focus:ring-2 focus:ring-yellow-400/30 outline-none transition ${
                          formErrors.total ? 'border-red-500/50' : 'border-white/10'
                        }`}
                    />
                    {formErrors.total && (
                      <p className="text-xs text-red-400">{formErrors.total}</p>
                    )}
                  </div>
                </div>

                {/* FB Link */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-yellow-400" />
                    Facebook холбоос
                  </label>
                  <input
                    value={formData.fbLink}
                    onChange={(e) => handleInputChange('fbLink', e.target.value)}
                    placeholder="https://facebook.com/..."
                    className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm
                      text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400/30 transition ${
                        formErrors.fbLink ? 'border-red-500/50' : 'border-white/10'
                      }`}
                  />
                  {formErrors.fbLink && (
                    <p className="text-xs text-red-400">{formErrors.fbLink}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  <span className="text-red-400">*</span> Шаардлагатай талбарууд
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl font-medium text-sm text-gray-300
                    bg-white/5 hover:bg-white/10 border border-white/10
                    transition-all"
                  >
                    Болих
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-xl font-bold text-sm text-gray-900
                    bg-gradient-to-r from-yellow-400 to-amber-500
                    hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]
                    active:scale-[0.98] transition disabled:opacity-50
                    disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Хадгалж байна...' : 'Машин нэмэх'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
