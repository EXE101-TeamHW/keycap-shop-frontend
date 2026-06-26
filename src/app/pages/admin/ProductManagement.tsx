import { useState, useEffect, useRef } from "react";
import { Package, Plus, Edit, Trash2, Loader2, X, Upload, ImagePlus, CheckCircle, AlertCircle, Tag, Layout, Key } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { uploadApi } from "../../api/uploadApi";
import { toast } from "sonner";
import { LAYOUT_DISPLAY, PROFILE_DISPLAY, THEME_DISPLAY } from "../../api/productApi";
import type { Product, ProductTheme, LayoutType, KeyProfile, ProductStatus } from "../../types";
import { formatProductDescriptionToHtml, stripProductDescriptionHtml } from "../../utils/productDescription";

const THEMES: ProductTheme[] = ["COLORFUL", "RGB", "MINIMAL", "RETRO", "PASTEL", "DARK"];
const LAYOUTS: LayoutType[] = ["LAYOUT_60", "LAYOUT_65", "LAYOUT_75", "TKL", "FULL", "ISO", "ANSI", "CUSTOM"];
const PROFILES: KeyProfile[] = ["CHERRY", "OEM", "SA", "DSA", "XDA", "MT3"];
const STATUSES: ProductStatus[] = ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"];

const STATUS_STYLE: Record<ProductStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-500",
  OUT_OF_STOCK: "bg-amber-100 text-amber-700",
};

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  theme: ProductTheme;
  layoutType: LayoutType;
  keyProfile: KeyProfile;
  status: ProductStatus;
  images: string[];
}

const EMPTY_FORM: ProductForm = {
  name: "", description: "", price: "", stockQuantity: "",
  theme: "MINIMAL", layoutType: "TKL", keyProfile: "OEM",
  status: "ACTIVE", images: [],
};

function ProductModal({ open, onClose, editing, onSave }: { open: boolean; onClose: () => void; editing: Product | null; onSave: () => void; }) {
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name, description: editing.description || "", price: String(editing.price),
        stockQuantity: String(editing.stockQuantity), theme: editing.theme, layoutType: editing.layoutType,
        keyProfile: editing.keyProfile, status: editing.status || "ACTIVE", images: [...(editing.images || [])],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(""); setUrlInput("");
  }, [editing, open]);

  if (!open) return null;

  const set = (field: keyof ProductForm, value: any) => setForm((f) => ({ ...f, [field]: value }));
  const removeImage = (idx: number) => set("images", form.images.filter((_, i) => i !== idx));
  const addImageUrl = () => { const url = urlInput.trim(); if (!url) return; set("images", [...form.images, url]); setUrlInput(""); };
  const formatDescription = () => set("description", formatProductDescriptionToHtml(form.description));

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map((f) => uploadApi.uploadFile(f).then((res: any) => res.data?.url || res.url))
      );
      set("images", [...form.images, ...uploads.filter(Boolean)]);
    } catch { setError("Image upload failed. Please try again."); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 1000) { setError("Giá sản phẩm phải lớn hơn 1000 VND."); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(), description: formatProductDescriptionToHtml(form.description), price: Number(form.price),
      stockQuantity: Number(form.stockQuantity) || 0, theme: form.theme, layoutType: form.layoutType,
      keyProfile: form.keyProfile, status: form.status, images: form.images,
    };
    try {
      if (editing) { await adminApi.updateProduct(editing.id, payload); toast.success("Cập nhật sản phẩm thành công!"); } else { await adminApi.createProduct(payload); toast.success("Thêm sản phẩm thành công!"); }
      onSave(); onClose();
    } catch (err: any) { setError(err?.response?.data?.message || "Save failed. Please try again."); toast.error("Có lỗi xảy ra khi lưu sản phẩm."); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <p className="text-xs text-gray-500">{editing ? `ID: ${editing.id}` : "Đăng sản phẩm lên cửa hàng"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên sản phẩm *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: Tokyo Night Keycap Set" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá (VNĐ) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
                <input type="number" min="1000" step="1000" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-gray-700">Mô tả</label>
              <button
                type="button"
                onClick={formatDescription}
                className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-100"
              >
                Format HTML
              </button>
            </div>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={6} placeholder="- Tên keyword: Mô tả chi tiết..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono leading-relaxed" />
            <p className="mt-1.5 text-xs text-gray-500">Mỗi ý bắt đầu bằng dấu - sẽ được đưa xuống dòng riêng và keyword sẽ được bọc bằng &lt;strong&gt;...&lt;/strong&gt; trước khi lưu.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><Tag className="w-3.5 h-3.5" /> Theme</label>
              <select value={form.theme} onChange={(e) => set("theme", e.target.value as ProductTheme)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white">
                {THEMES.map((t) => (<option key={t} value={t}>{THEME_DISPLAY[t]}</option>))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><Layout className="w-3.5 h-3.5" /> Layout</label>
              <select value={form.layoutType} onChange={(e) => set("layoutType", e.target.value as LayoutType)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white">
                {LAYOUTS.map((l) => (<option key={l} value={l}>{LAYOUT_DISPLAY[l]}</option>))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><Key className="w-3.5 h-3.5" /> Key Profile</label>
              <select value={form.keyProfile} onChange={(e) => set("keyProfile", e.target.value as KeyProfile)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white">
                {PROFILES.map((p) => (<option key={p} value={p}>{PROFILE_DISPLAY[p]}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số lượng tồn kho</label>
              <input type="number" min="0" value={form.stockQuantity} onChange={(e) => set("stockQuantity", e.target.value)} placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as ProductStatus)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white">
                {STATUSES.map((s) => (<option key={s} value={s}>{s.replace("_", " ")}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Product Images</label>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-20">
                    <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-white" /></button>
                    {idx === 0 && <span className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] font-bold text-white bg-black/50 rounded-b-xl py-0.5">MAIN</span>}
                  </div>
                ))}
              </div>
            )}
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 hover:border-purple-400 rounded-xl p-5 text-center cursor-pointer transition-colors group mb-3">
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-purple-600"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm font-medium">Uploading...</span></div>
              ) : (
                <><Upload className="w-8 h-8 mx-auto mb-2 text-gray-300 group-hover:text-purple-400 transition-colors" /><p className="text-sm text-gray-500 group-hover:text-purple-500 transition-colors font-medium">Click to upload images</p><p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP supported</p></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
            <div className="flex gap-2">
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())} placeholder="Or paste image URL..." className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              <button type="button" onClick={addImageUrl} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1"><ImagePlus className="w-4 h-4" /> Add</button>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm">Hủy</button>
            <button type="submit" disabled={saving || uploading} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-purple-200">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : <><CheckCircle className="w-4 h-4" /> {editing ? "Lưu thay đổi" : "Thêm sản phẩm"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deactivating, setDeactivating] = useState<string | number | null>(null);

  const fetchProducts = () => {
    adminApi.getProducts().then((res: any) => {
      if (res?.data) setProducts(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => { setEditingProduct(null); setModalOpen(true); };
  const openEditModal = (p: Product) => { setEditingProduct(p); setModalOpen(true); };

  const handleDeactivate = async (p: Product) => {
    if (!confirm(`Deactivate "${p.name}"? It will be hidden from the shop.`)) return;
    setDeactivating(p.id);
    try {
      await adminApi.deactivateProduct(p.id, {
        name: p.name, description: p.description, price: p.price,
        stockQuantity: p.stockQuantity, theme: p.theme, layoutType: p.layoutType,
        keyProfile: p.keyProfile, images: p.images,
      });
      toast.success("Đã vô hiệu hóa sản phẩm!");
      fetchProducts();
    } catch { toast.error("Không thể vô hiệu hóa sản phẩm."); }
    setDeactivating(null);
  };

  return (
    <>
      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editingProduct} onSave={fetchProducts} />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quản lý sản phẩm</h3>
            <p className="text-sm text-gray-500 mt-0.5">Tổng cộng {products.length} sản phẩm</p>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-sm shadow-lg shadow-purple-200">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-medium">Chưa có sản phẩm nào</p>
              <button onClick={openAddModal} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors">
                Thêm sản phẩm
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {["", "Tên", "Chủ đề", "Layout", "Profile", "Giá", "Tồn kho", "Trạng thái", "Thao tác"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[140px]">{stripProductDescriptionHtml(product.description)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">{THEME_DISPLAY[product.theme] || product.theme}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600 font-medium">{LAYOUT_DISPLAY[product.layoutType] || product.layoutType}</td>
                    <td className="py-3 px-3 text-xs text-gray-600 font-medium">{PROFILE_DISPLAY[product.keyProfile] || product.keyProfile}</td>
                    <td className="py-3 px-3 font-bold text-gray-900 text-sm">{(product.price).toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stockQuantity === 0 ? "bg-red-100 text-red-700" : product.stockQuantity < 10 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {product.stockQuantity} units
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[product.status] || "bg-gray-100 text-gray-600"}`}>
                        {product.status?.replace("_", " ") || "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEditModal(product)} className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors" title="Edit product"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeactivate(product)} disabled={deactivating === product.id || product.status === "INACTIVE"} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" title={product.status === "INACTIVE" ? "Already inactive" : "Deactivate product"}>
                          {deactivating === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
