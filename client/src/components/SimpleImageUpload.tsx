import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

interface SimpleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  index: number;
  onRemove?: () => void;
  canRemove?: boolean;
}

export function SimpleImageUpload({ value, onChange, index, onRemove, canRemove }: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة فقط');
      return;
    }

    // التحقق من حجم الملف (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.imageUrl);
      } else {
        alert('فشل في رفع الصورة: ' + (result.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('فشل في رفع الصورة');
    } finally {
      setUploading(false);
      // إعادة تعيين input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="رابط الصورة أو استخدم زر الرفع"
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
        />
        {canRemove && (
          <Button
            type="button"
            size="sm"
            onClick={onRemove}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
        >
          <Upload className="w-4 h-4 ml-2" />
          {uploading ? 'جاري الرفع...' : 'رفع صورة من الجهاز'}
        </Button>
      </div>

      {/* معاينة الصورة */}
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt={`معاينة الصورة ${index + 1}`}
            className="w-20 h-20 object-cover rounded-lg border"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}