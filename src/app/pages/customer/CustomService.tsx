import { useState, useEffect } from "react";
import { Upload, FileText, Image, CheckCircle, Palette, Keyboard, Loader2, AlertCircle, LocateFixed, X } from "lucide-react";
import { useNavigate } from "react-router";
import { customRequestApi } from "../../api/customRequestApi";
import { uploadApi } from "../../api/uploadApi";
import { authApi } from "../../api/authApi";
import axiosClient from "../../api/axiosClient";

export function CustomService() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<{ title: string; message: string; type?: "warning" | "error" | "success" } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    layout: "LAYOUT_60",
    profile: "",
    theme: "COLORFUL",
    depositAmount: "10000",
    description: "",
    designName: "",
  });

  // Bank account & User profile states
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bankAccount, setBankAccount] = useState("");
  const [hasBankAccount, setHasBankAccount] = useState(true);
  const usesProfileBankAccount = hasBankAccount && Boolean(bankAccount.trim());

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
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

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
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nextFiles = Array.from(e.target.files);
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
      setFiles(nextFiles);
      setFilePreviews(nextFiles.map((file) => file.type.startsWith("image/") ? URL.createObjectURL(file) : ""));
    }
  };

  const normalizeAddressName = (value?: string) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b(thanh pho|tinh|quan|huyen|thi xa|thi tran|phuong|xa|tp|q|city|province|district|ward|commune|town|county)\b/g, "")
      .replace(/[^a-z0-9]/g, "");

  const displayPartsByPattern = (displayName: string | undefined, pattern: RegExp) =>
    (displayName || "")
      .split(",")
      .map((part) => part.trim())
      .filter((part) => pattern.test(part));

  const uniqueTerms = (terms: Array<string | undefined | null>) =>
    Array.from(new Set(terms.filter(Boolean) as string[]));

  const getLocationTermsByLevel = (address: any, displayName?: string, extraTerms: string[] = []) => {
    const provinceTerms = uniqueTerms([
      address.state,
      address.city,
      address.province,
      address.region,
      ...extraTerms,
      ...extraTerms.filter((term) => /(thành phố|tỉnh|province|city)/i.test(term)),
      ...displayPartsByPattern(displayName, /(thành phố|tỉnh|tp\.?)/i),
    ]);
    const districtTerms = uniqueTerms([
      address.city_district,
      address.county,
      address.district,
      address.town,
      address.municipality,
      address.borough,
      ...extraTerms,
      ...extraTerms.filter((term) => /(quận|huyện|thị xã|district|county)/i.test(term)),
      ...displayPartsByPattern(displayName, /(quận|huyện|thị xã|thành phố thủ đức)/i),
    ]);
    const wardTerms = uniqueTerms([
      address.ward,
      address.suburb,
      address.quarter,
      address.neighbourhood,
      address.village,
      address.hamlet,
      ...extraTerms,
      ...extraTerms.filter((term) => /(phường|xã|thị trấn|ward|commune)/i.test(term)),
      ...displayPartsByPattern(displayName, /(phường|xã|thị trấn)/i),
    ]);

    return { provinceTerms, districtTerms, wardTerms };
  };

  const getBigDataCloudTerms = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=vi`
      );
      const data = await res.json();
      const administrative = data?.localityInfo?.administrative || [];
      const locality = data?.localityInfo?.informative || [];
      return uniqueTerms([
        data?.principalSubdivision,
        data?.city,
        data?.locality,
        data?.localityInfo?.name,
        ...administrative.map((item: any) => item?.name),
        ...locality.map((item: any) => item?.name),
      ]);
    } catch (err) {
      console.warn("BigDataCloud reverse geocode failed", err);
      return [];
    }
  };

  const findAddressMatch = (items: any[], terms: string[]) => {
    const normalizedTerms = terms.map(normalizeAddressName).filter(Boolean);
    let bestMatch: any = null;
    let bestScore = 0;

    items.forEach((item) => {
      const normalizedName = normalizeAddressName(item.name);
      normalizedTerms.forEach((term) => {
        if (/^\d+$/.test(normalizedName) && normalizedName !== term) return;
        let score = 0;
        if (normalizedName === term) score = 100;
        else if (term.length >= 3 && normalizedName.includes(term)) score = 70 + Math.min(term.length, 20);
        else if (normalizedName.length >= 3 && term.includes(normalizedName)) score = 60 + Math.min(normalizedName.length, 20);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      });
    });

    return bestMatch;
  };

  const findWardWithParentDistrict = (districtItems: any[], terms: string[]) => {
    for (const district of districtItems) {
      const matchedWard = findAddressMatch(district.wards || [], terms);
      if (matchedWard) {
        return { district, ward: matchedWard };
      }
    }
    return null;
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Trình duyệt của bạn chưa hỗ trợ định vị.");
      return;
    }

    setIsLocating(true);
    setLocationMessage("Đang lấy vị trí hiện tại...");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          let locationData: any = {};
          try {
            const locationRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=vi`
            );
            if (locationRes.ok) {
              locationData = await locationRes.json();
            }
          } catch (err) {
            console.warn("OpenStreetMap reverse geocode failed", err);
          }

          const address = locationData?.address || {};
          const extraTerms = await getBigDataCloudTerms(coords.latitude, coords.longitude);
          if (!locationData?.display_name && extraTerms.length === 0) {
            throw new Error("Reverse geocoding services returned no address data");
          }
          const { provinceTerms, districtTerms, wardTerms } = getLocationTermsByLevel(
            address,
            locationData?.display_name,
            extraTerms
          );
          const roadName = address.road || address.pedestrian || address.footway;
          const streetLine = address.house_number && roadName
            ? `${address.house_number} ${roadName}`
            : roadName || "";
          if (streetLine) {
            setStreet(streetLine);
          }

          const provinceTree = await fetch("https://provinces.open-api.vn/api/?depth=3").then((res) => res.json());
          const provinceList = provinceTree.map(({ districts: _districts, ...province }: any) => province);
          setProvinces(provinceList);

          const matchedProvinceTree = findAddressMatch(provinceTree, provinceTerms);
          const matchedProvince = matchedProvinceTree
            ? provinceList.find((province: any) => province.code === matchedProvinceTree.code)
            : null;

          if (!matchedProvince) {
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedWard(null);
            setDistricts([]);
            setWards([]);
            setLocationMessage("Đã lấy vị trí nhưng chưa tự khớp được Tỉnh/Thành phố. Vui lòng chọn thủ công.");
            return;
          }

          setSelectedProvince(matchedProvince);
          const nextDistricts = matchedProvinceTree.districts || [];
          setDistricts(nextDistricts);

          const wardParentMatch = findWardWithParentDistrict(nextDistricts, wardTerms);
          const matchedDistrict = findAddressMatch(nextDistricts, districtTerms) || wardParentMatch?.district;
          if (!matchedDistrict) {
            setSelectedDistrict(null);
            setSelectedWard(null);
            setWards([]);
            setLocationMessage("Đã điền Tỉnh/Thành phố. Vui lòng chọn thêm Quận/Huyện và Phường/Xã.");
            return;
          }

          setSelectedDistrict(matchedDistrict);
          const nextWards = matchedDistrict.wards || [];
          setWards(nextWards);

          const matchedWard = wardParentMatch?.district?.code === matchedDistrict.code
            ? wardParentMatch.ward
            : findAddressMatch(nextWards, wardTerms);
          setSelectedWard(matchedWard);
          const accuracyHint = coords.accuracy > 500
            ? " Vị trí GPS đang khá rộng, bạn nên kiểm tra lại địa chỉ."
            : "";
          const streetHint = streetLine
            ? ""
            : " Vui lòng nhập thêm số nhà/tên đường.";
          setLocationMessage(
            matchedWard
              ? `Đã tự điền Tỉnh/Thành phố, Quận/Huyện và Phường/Xã từ GPS.${accuracyHint}${streetHint}`
              : "Đã điền Tỉnh/Thành phố và Quận/Huyện. GPS chưa trả được Phường/Xã, vui lòng chọn thêm."
          );
        } catch (err) {
          console.error(err);
          setLocationMessage("Không thể lấy địa chỉ từ vị trí. Vui lòng nhập thủ công.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocationMessage("Không thể truy cập vị trí. Vui lòng cho phép quyền định vị hoặc nhập thủ công.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    return () => {
      filePreviews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [filePreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const showNotice = (message: string, title = "Cần kiểm tra lại", type: "warning" | "error" | "success" = "warning") => {
      setNotice({ title, message, type });
    };
    
    const token = localStorage.getItem("token");
    if (!token) {
      showNotice("Vui lòng đăng nhập để gửi yêu cầu custom.", "Bạn chưa đăng nhập");
      navigate("/login");
      return;
    }

    if (!selectedProvince || !selectedDistrict || !selectedWard || !street.trim()) {
      showNotice("Vui lòng nhập đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã và số nhà/tên đường.");
      return;
    }

    if (!bankAccount.trim()) {
      showNotice("Vui lòng nhập số tài khoản ngân hàng để tiếp tục và nhận tiền hoàn khi cần thiết.");
      return;
    }

    const baseDeposit = parseInt(formData.depositAmount.replace(/\D/g, "")) || 10000;
    if (baseDeposit < 10000) {
      showNotice("Tiền cọc tối thiểu cho đơn custom là 10.000đ. Vui lòng nhập lại trước khi gửi yêu cầu.");
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
        const apiMessage = (err as any)?.response?.data?.message;
        showNotice(apiMessage ? `Tải ảnh tham khảo thất bại: ${apiMessage}` : "Tải ảnh tham khảo thất bại. Vui lòng thử lại.", "Tải ảnh thất bại", "error");
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

      const checkoutRes: any = await customRequestApi.checkout({
        ...payload,
        shippingAddress: fullAddress,
        totalAmount: baseDeposit,
      });
      const paymentUrl = checkoutRes?.data?.paymentUrl;
      if (paymentUrl) {
        localStorage.setItem("latestOrderType", "CUSTOM");
        if (checkoutRes?.data?.orderId) {
          localStorage.setItem("latestPayosOrderId", String(checkoutRes.data.orderId));
        }
        window.location.href = paymentUrl;
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate("/my-tickets");
      }, 2500);
    } catch (err: any) {
      console.error("Failed to process custom request:", err);
      const apiMessage = err?.response?.data?.message || err?.message;
      showNotice(apiMessage || "Gửi yêu cầu thất bại. Vui lòng kiểm tra lại thông tin và thử lại.", "Không thể gửi yêu cầu", "error");
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
      {notice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-2xl" />
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              aria-label="Đóng thông báo"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${
                notice.type === "success"
                  ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                  : notice.type === "error"
                    ? "bg-rose-50 text-rose-600 ring-rose-100"
                    : "bg-amber-50 text-amber-600 ring-amber-100"
              }`}>
                {notice.type === "success" ? (
                  <CheckCircle className="h-7 w-7" />
                ) : (
                  <AlertCircle className="h-7 w-7" />
                )}
              </div>

              <h3 className="pr-10 text-xl font-black text-slate-950">{notice.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{notice.message}</p>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-700 hover:to-pink-700 active:scale-95"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <div className="custom-title-orbit mb-4">
          <span className="custom-title-orbit__ring custom-title-orbit__ring--one" aria-hidden="true" />
          <span className="custom-title-orbit__ring custom-title-orbit__ring--two" aria-hidden="true" />
          <h1 className="relative z-10 text-5xl font-bold text-gray-900">Dịch vụ Keycap Custom</h1>
        </div>
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

          {/* Design Details */}
          <div className="mb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            <div>
              <label className="font-medium mb-2 block text-gray-700">Tiền cọc (VNĐ) - Tối thiểu 10.000đ *</label>
              <input
                type="text"
                required
                value={formData.depositAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, depositAmount: val ? Number(val).toLocaleString("vi-VN") : "" });
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="10.000"
              />
            </div>
          </div>

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

          {/* Personal Info */}
          <div className="mb-6">
            <h3 className="mb-4 font-semibold text-gray-900">Thông tin liên hệ</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="font-medium mb-2 block text-gray-700">Họ và tên *</label>
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
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900">Địa chỉ nhận hàng (Sau khi hoàn thành) *</h3>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition hover:border-purple-200 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLocating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="h-3.5 w-3.5" />
                )}
                {isLocating ? "Đang định vị" : "Dùng vị trí"}
              </button>
            </div>
            {locationMessage && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                {locationMessage}
              </div>
            )}
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
            {usesProfileBankAccount ? (
              <div>
                <div className="text-xs font-semibold text-gray-700 block mb-1.5">Tài khoản hoàn tiền từ hồ sơ cá nhân</div>
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-emerald-700">Đã tự động sử dụng thông tin của bạn</div>
                    <div className="text-sm text-gray-700 mt-1">{bankAccount}</div>
                  </div>
                </div>
              </div>
            ) : (
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
            )}
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
                <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={filePreviews[index]}
                          alt={file.name}
                          className="h-32 w-full object-cover"
                        />
                      ) : (
                        <div className="h-32 w-full flex items-center justify-center bg-gray-50">
                          <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600">
                        {file.type.includes("pdf") ? <FileText className="w-4 h-4 flex-shrink-0" /> : <Image className="w-4 h-4 flex-shrink-0" />}
                        <span className="truncate" title={file.name}>{file.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="mb-6 p-5 bg-purple-50/50 rounded-xl border border-purple-100 text-sm space-y-2">
            <div className="font-bold text-gray-900 border-b border-purple-100 pb-2 mb-2 flex justify-between">
              <span>Tóm tắt chi phí thanh toán:</span>
              <span className="text-purple-700">PayOS Cổng thanh toán</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tiền cọc thiết kế:</span>
              <span className="font-semibold">{(parseInt(formData.depositAmount.replace(/\D/g, "")) || 10000).toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-950 pt-2 border-t border-purple-100 mt-2">
              <span>Tổng thanh toán cọc:</span>
              <span className="text-purple-600">
                {(parseInt(formData.depositAmount.replace(/\D/g, "")) || 10000).toLocaleString("vi-VN")}₫
              </span>
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-3 text-amber-900 flex items-center gap-1.5">
              🛡️ Chính sách cọc & Hoàn tiền
            </h3>
            <ul className="space-y-2 text-xs text-amber-800 list-disc list-inside leading-relaxed">
              <li>
                <strong>Trước giai đoạn thiết kế:</strong> Khách hàng có quyền hủy đơn hàng và được hoàn lại toàn bộ số tiền cọc.
              </li>
              <li>
                <strong>Khi thiết kế đã bắt đầu:</strong> Không thể tự hủy đơn hàng hoặc nhận hoàn tiền cọc, trừ trường hợp lỗi phát sinh từ phía shop.
              </li>
              <li>
                <strong>Từ giai đoạn thiết kế trở đi:</strong> Mọi yêu cầu hoàn tiền đặc biệt sẽ do nhân viên phụ trách xem xét và xử lý.
              </li>
            </ul>
          </div>

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
                <span className="font-semibold">1.000.000đ - 1.300.000đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layout 75%-TKL:</span>
                <span className="font-semibold">1.500.000đ - 2.000.000đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layout Full:</span>
                <span className="font-semibold">3.000.000đ - 4.000.000đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Custom/Phức tạp:</span>
                <span className="font-semibold">Khoảng trên 5.000.000đ+</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">*Giá cả thay đổi dựa trên vật liệu, độ phức tạp và số lượng</p>
          </div>
        </div>
      </div>
    </div>
  );
}
