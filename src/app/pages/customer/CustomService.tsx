import { useState, useEffect } from "react";
import { Upload, FileText, Image, CheckCircle, Palette, Keyboard, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { customRequestApi } from "../../api/customRequestApi";
import { uploadApi } from "../../api/uploadApi";
import { orderApi } from "../../api/orderApi";
import { paymentApi } from "../../api/paymentApi";
import { authApi } from "../../api/authApi";
import axiosClient from "../../api/axiosClient";

export function CustomService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    layout: "LAYOUT_60",
    profile: "",
    theme: "COLORFUL",
    depositAmount: "1000000",
    description: "",
    designName: "",
  });

  // Bank account & User profile states
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bankAccount, setBankAccount] = useState("");
  const [hasBankAccount, setHasBankAccount] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authApi.me()
        .then((res: any) => {
          const profile = res?.data || res;
          setUserProfile(profile);
          setFormData(prev => ({
            ...prev,
            name: profile.fullName || prev.name,
            email: profile.email || prev.email,
            phone: profile.phone || prev.phone,
          }));
          if (profile.bankAccount) {
            setBankAccount(profile.bankAccount);
            setHasBankAccount(true);
          } else {
            setBankAccount("");
            setHasBankAccount(false);
          }
        })
        .catch(console.error);
    }
  }, []);
 
  // Address states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [street, setStreet] = useState("");

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(console.error);
  }, []);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const prov = provinces.find((p: any) => p.code == code);
    setSelectedProvince(prov);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    if (code) {
      fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts))
        .catch(console.error);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const dist = districts.find((d: any) => d.code == code);
    setSelectedDistrict(dist);
    setSelectedWard(null);
    setWards([]);
    if (code) {
      fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards))
        .catch(console.error);
    }
  };

  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để gửi yêu cầu custom.");
      navigate("/login");
      return;
    }

    if (!selectedProvince || !selectedDistrict || !selectedWard || !street.trim()) {
      alert("Vui lòng nhập đầy đủ địa chỉ nhận hàng.");
      return;
    }

    if (!bankAccount.trim()) {
      alert("Vui lòng nhập số tài khoản ngân hàng để tiếp tục và nhận tiền hoàn khi cần thiết.");
      return;
    }

    setUploading(true);

    const fullAddress = `${street}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;

    // Upload reference files to Cloudinary first
    let uploadedUrls: string[] = [];
    if (files.length > 0) {
      try {
        const uploadPromises = files.map(file => uploadApi.uploadFile(file));
        const results = await Promise.all(uploadPromises);
        uploadedUrls = results.map((res: any) => {
          const data = res?.data || res;
          return data?.url || data?.secure_url || data;
        }).filter((url: any) => typeof url === 'string' && url.length > 0);
      } catch (err) {
        console.error("Failed to upload files:", err);
        alert("Tải ảnh tham khảo thất bại. Vui lòng thử lại.");
        setUploading(false);
        return;
      }
    }

    const payload = {
      designName: formData.designName || "Custom Design",
      layout: formData.layout,
      theme: formData.theme,
      notes: `Tên: ${formData.name}\nSĐT: ${formData.phone}\nProfile: ${formData.profile}\nTiền cọc: ${formData.depositAmount}đ\nĐịa chỉ: ${fullAddress}\n\nMô tả: ${formData.description}`,
      referenceImages: uploadedUrls,
    };

    try {
      // Update bank account in profile first
      if (!hasBankAccount || (userProfile && userProfile.bankAccount !== bankAccount)) {
        await axiosClient.put(`/auth/profile`, {
          fullName: formData.name || userProfile?.fullName || "",
          phone: formData.phone || userProfile?.phone || "",
          avatarUrl: userProfile?.avatarUrl || "",
          bankAccount: bankAccount,
        });
      }

      const customRes: any = await customRequestApi.create(payload);
      const ticketId = customRes?.data?.ticketId;

      if (ticketId) {
        const orderRes: any = await orderApi.createOrder({
          type: "CUSTOM",
          ticketId: ticketId,
          totalAmount: parseInt(formData.depositAmount.replace(/\D/g, "")),
          shippingAddress: fullAddress,
          paymentMethod: "PAYOS",
        });

        const orderId = orderRes?.data?.id;
        if (orderId) {
          const payRes: any = await paymentApi.createPayosLink({ orderId });
          const paymentUrl = payRes?.data?.paymentUrl;
          if (paymentUrl) {
            localStorage.setItem("latestOrderType", "CUSTOM");
            window.location.href = paymentUrl;
            return;
          }
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate("/my-tickets");
      }, 2500);
    } catch (err) {
      console.error("Failed to process custom request:", err);
      alert("Gửi yêu cầu thất bại. Vui lòng kiểm tra lại (tối thiểu 1,000,000đ).");
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-500" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Yêu cầu đã được gửi!</h2>
          <p className="text-gray-600 mb-2">Cảm ơn bạn đã yêu cầu thiết kế keycap tùy chỉnh.</p>
          <p className="text-gray-600">Đội ngũ của chúng tôi sẽ liên hệ với bạn trong vòng 24-48 giờ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">Dịch vụ Keycap Custom</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tạo ra bàn phím trong mơ với dịch vụ thiết kế tùy chỉnh của chúng tôi. Hãy chia sẻ ý tưởng của bạn, tải lên ảnh tham khảo và đội ngũ của chúng tôi sẽ biến nó thành hiện thực.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
          <Palette className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h3 className="font-semibold text-lg mb-2 text-gray-900">Tùy chọn thiết kế vô hạn</h3>
          <p className="text-gray-600 text-sm">Chọn bất kỳ màu sắc, hoa văn hoặc chủ đề nào bạn có thể tưởng tượng ra</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
          <Keyboard className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h3 className="font-semibold text-lg mb-2 text-gray-900">Mọi Layout</h3>
          <p className="text-gray-600 text-sm">Hỗ trợ các layout 60%, 65%, 75%, TKL, Full và tùy chỉnh</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h3 className="font-semibold text-lg mb-2 text-gray-900">Dịch vụ chuyên nghiệp</h3>
          <p className="text-gray-600 text-sm">Tư vấn chuyên gia và sản xuất chất lượng cao</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Biểu mẫu Yêu cầu</h2>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-medium mb-2 block text-gray-700">Tên của bạn *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="font-medium mb-2 block text-gray-700">Số điện thoại *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="0912 345 678"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Địa chỉ nhận hàng (Sau khi hoàn thành) *</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <select
                value={selectedProvince?.code || ""}
                onChange={handleProvinceChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white"
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  disabled={!selectedProvince}
                  value={selectedDistrict?.code || ""}
                  onChange={handleDistrictChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white"
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>

                <select
                  disabled={!selectedDistrict}
                  value={selectedWard?.code || ""}
                  onChange={(e) => {
                    const w = wards.find((w: any) => w.code == e.target.value);
                    setSelectedWard(w);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white"
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Số nhà, tên đường..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">*Tiền ship sẽ được thu khi đơn hàng hoàn thành.</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl space-y-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-purple-800 leading-normal">
                <strong>Lưu ý:</strong> Vui lòng cung cấp số tài khoản ngân hàng để phục vụ việc hoàn tiền tự động trong trường hợp thiết kế bị hủy hoặc có sự cố xảy ra.
              </div>
            </div>
            <div>
              <label className="font-semibold text-xs text-gray-700 block mb-1.5">Số tài khoản ngân hàng (Hoàn tiền) *</label>
              <input
                type="text"
                required
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Ví dụ: VCB 10123... - NGUYEN VAN A"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-medium mb-2 block text-gray-700">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="nguyenvana@example.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="font-medium mb-2 block text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="+84 123 456 789"
            />
          </div>

          {/* Keyboard Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="font-medium mb-2 block text-gray-700">Layout *</label>
              <select
                required
                value={formData.layout}
                onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="LAYOUT_60">60% (61 phím)</option>
                <option value="LAYOUT_65">65% (68 phím)</option>
                <option value="LAYOUT_75">75% (84 phím)</option>
                <option value="TKL">TKL (87 phím)</option>
                <option value="FULL">Full (104 phím)</option>
                <option value="ISO">ISO Layout</option>
                <option value="ANSI">ANSI Layout</option>
                <option value="CUSTOM">Custom Layout</option>
              </select>
            </div>
            <div>
              <label className="font-medium mb-2 block text-gray-700">Profile *</label>
              <select
                required
                value={formData.profile}
                onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="">Chọn profile</option>
                <option value="Cherry">Cherry Profile</option>
                <option value="OEM">OEM Profile</option>
                <option value="SA">SA Profile</option>
                <option value="DSA">DSA Profile</option>
                <option value="XDA">XDA Profile</option>
                <option value="MT3">MT3 Profile</option>
              </select>
            </div>
            <div>
              <label className="font-medium mb-2 block text-gray-700">Tiền cọc (VNĐ) - Tối thiểu 1.000.000đ *</label>
              <input
                type="text"
                required
                value={formData.depositAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, depositAmount: val ? Number(val).toLocaleString('vi-VN') : "" });
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="1.000.000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-medium mb-2 block text-gray-700">Tên Dự Án/Thiết Kế *</label>
              <input
                type="text"
                required
                value={formData.designName}
                onChange={(e) => setFormData({ ...formData, designName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="VD: Cyberpunk 2077 Vibe"
              />
            </div>
            <div>
              <label className="font-medium mb-2 block text-gray-700">Chủ đề cơ bản *</label>
              <select
                required
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="COLORFUL">Nhiều màu sắc</option>
                <option value="RGB">RGB/Gaming</option>
                <option value="MINIMAL">Tối giản</option>
                <option value="RETRO">Retro/Cổ điển</option>
                <option value="PASTEL">Pastel</option>
                <option value="DARK">Chủ đề tối</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="font-medium mb-2 block text-gray-700">Mô tả chi tiết *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              placeholder="Mô tả chi tiết tầm nhìn của bạn. Bao gồm màu sắc, hoa văn, yêu cầu cụ thể, nguồn cảm hứng, v.v."
            />
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="font-medium mb-2 block text-gray-700">Tải lên ảnh tham khảo/PDF</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-gray-700 font-medium hover:text-gray-900"
              >
                Nhấp để tải lên hoặc kéo thả vào đây
              </label>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG, PDF (tối đa 10MB mỗi tệp)</p>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      {file.type.includes("pdf") ? <FileText className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Thanh toán tiền cọc & Gửi yêu cầu"
            )}
          </button>
        </form>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Cách hoạt động</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <span>Điền vào biểu mẫu yêu cầu với các yêu cầu của bạn</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <span>Tải lên hình ảnh tham khảo hoặc file thiết kế</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <span>Đội ngũ sẽ xem xét và liên hệ trong vòng 48 giờ</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <span>Chúng tôi tạo mockup và tinh chỉnh thiết kế cùng bạn</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">5.</span>
                <span>Bắt đầu sản xuất sau khi được bạn phê duyệt</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">6.</span>
                <span>Giao hàng trong 4-6 tuần</span>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Bảng giá tham khảo</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Layout 60%-65%:</span>
                <span className="font-semibold">5.000.000đ - 10.000.000đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layout 75%-TKL:</span>
                <span className="font-semibold">7.500.000đ - 12.500.000đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layout Full:</span>
                <span className="font-semibold">10.000.000đ - 15.000.000đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Custom/Phức tạp:</span>
                <span className="font-semibold">Từ 12.500.000đ+</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">*Giá cả thay đổi dựa trên vật liệu, độ phức tạp và số lượng</p>
          </div>
        </div>
      </div>
    </div>
  );
}
