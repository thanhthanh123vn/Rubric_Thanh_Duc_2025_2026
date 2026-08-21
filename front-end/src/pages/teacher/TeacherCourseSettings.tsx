import { useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, Palette, Save, Trash2, Upload } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Banner from '@/components/common/Banner';
import courseService from '@/pages/admin/api/courseService';
import type { CourseOfferingResponse } from '@/pages/admin/api/type';
import { bannerColorClasses, bannerColors, resolveBannerColor, type BannerColor } from '@/utils/colorUtils';

const colorLabels: Record<BannerColor, string> = {
  blue: 'Xanh dương', emerald: 'Xanh ngọc', purple: 'Tím', pink: 'Hồng',
  orange: 'Cam', cyan: 'Xanh cyan', indigo: 'Chàm', red: 'Đỏ',
};

export default function TeacherCourseSettings() {
  const { id = '' } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseOfferingResponse | null>(null);
  const [selectedColor, setSelectedColor] = useState<BannerColor>(() => resolveBannerColor(id));
  const [savedColor, setSavedColor] = useState<BannerColor>(() => resolveBannerColor(id));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    courseService.getOffering(id)
      .then((data) => {
        if (!active) return;
        const color = resolveBannerColor(id, data.bannerColor);
        setCourse(data);
        setSelectedColor(color);
        setSavedColor(color);
        setImagePreview(data.bannerImageUrl || null);
        setSavedImageUrl(data.bannerImageUrl || null);
      })
      .catch(() => toast.error('Không thể tải cài đặt lớp học.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const selectImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh banner không được vượt quá 5 MB.');
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(objectUrlRef.current);
    setImageRemoved(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(Boolean(savedImageUrl));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      let updated = await courseService.updateBannerColor(id, selectedColor);
      if (imageFile) updated = await courseService.uploadBannerImage(id, imageFile);
      else if (imageRemoved) updated = await courseService.removeBannerImage(id);

      setCourse(updated);
      setSavedColor(selectedColor);
      setSavedImageUrl(updated.bannerImageUrl || null);
      setImagePreview(updated.bannerImageUrl || null);
      setImageFile(null);
      setImageRemoved(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      window.dispatchEvent(new CustomEvent('course-banner-updated', { detail: updated }));
      toast.success('Đã cập nhật giao diện lớp học.');
    } catch {
      toast.error('Không thể lưu giao diện lớp học. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[360px] items-center justify-center text-sm text-slate-500">Đang tải cài đặt...</div>;
  }

  const courseName = course?.course?.courseName || 'Lớp học';
  const description = `Giảng viên: ${course?.lecturers?.map((item) => item.lecturerName).join(', ') || 'Chưa cập nhật'} - Mã lớp: ${id}`;
  const hasChanges = selectedColor !== savedColor || Boolean(imageFile) || imageRemoved;

  return (
    <section className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Palette className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Cài đặt lớp học</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Giao diện học phần</h1>
          <p className="mt-1 text-sm text-slate-500">Tùy chỉnh banner sinh viên sẽ nhìn thấy trong lớp {courseName}.</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-900">Màu banner</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {bannerColors.map((color) => {
            const selected = color === selectedColor;
            return (
              <button key={color} type="button" aria-pressed={selected} onClick={() => setSelectedColor(color)}
                className={`rounded-2xl border p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${selected ? 'border-emerald-600 bg-emerald-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                <span className={`flex h-14 items-center justify-center rounded-xl bg-gradient-to-r ${bannerColorClasses[color]}`}>
                  {selected ? <Check className="h-6 w-6 text-white" /> : null}
                </span>
                <span className="mt-2 block px-1 text-sm font-medium text-slate-700">{colorLabels[color]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-7">
        <div className="flex items-start gap-3">
          <ImagePlus className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Ảnh banner</h2>
            <p className="mt-1 text-sm text-slate-500">Ảnh JPG, PNG hoặc WebP, tối đa 5 MB. Ảnh được ưu tiên hiển thị thay cho màu nền.</p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
          onChange={(event) => selectImage(event.target.files?.[0])} className="hidden" />
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
            <Upload className="h-4 w-4" />
            {imagePreview ? 'Thay ảnh khác' : 'Tải ảnh lên'}
          </button>
          {imagePreview ? (
            <button type="button" onClick={removeImage}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100">
              <Trash2 className="h-4 w-4" /> Xóa ảnh
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-7">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Xem trước</h2>
        <Banner title={courseName} description={description} color={selectedColor} imageUrl={imagePreview} />
      </div>

      <div className="mt-2 flex justify-end">
        <button type="button" onClick={saveSettings} disabled={saving || !hasChanges}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </section>
  );
}
