// src/app/pages/Cart.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader2, ShoppingCart, AlertCircle, WalletCards, LocateFixed, CheckCircle2, X } from "lucide-react";
import { cartApi } from "../../api/cartApi";
import axiosClient from "../../api/axiosClient";
import { mapProduct } from "../../api/productApi";
import { paymentApi } from "../../api/paymentApi";
import { authApi } from "../../api/authApi";
import { motion } from "motion/react";
interface CartItemData {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productTheme: string;
  price: number;
  quantity: number;
  stockQuantity: number;
}

interface CartDialog {
  type: "success" | "warning" | "error";
  title: string;
  message: string;
  actionLabel?: string;
  onConfirm?: () => void;
}

export function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod] = useState("PAYOS");
  const [cartDialog, setCartDialog] = useState<CartDialog | null>(null);

  // Bank account states
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bankAccount, setBankAccount] = useState("");
  const [hasBankAccount, setHasBankAccount] = useState(true);

  useEffect(() => {
    if (showCheckout) {
      authApi.me()
        .then((res: any) => {
          const profile = res?.data || res;
          setUserProfile(profile);
          if (profile?.bankAccount) {
            setBankAccount(profile.bankAccount);
            setHasBankAccount(true);
          } else {
            setBankAccount("");
            setHasBankAccount(false);
          }
        })
        .catch(console.error);
    }
  }, [showCheckout]);

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
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=vi`
          );
          const data = await res.json();
          const address = data?.address || {};
          const extraTerms = await getBigDataCloudTerms(coords.latitude, coords.longitude);
          const { provinceTerms, districtTerms, wardTerms } = getLocationTermsByLevel(address, data?.display_name, extraTerms);
          const roadName = address.road || address.pedestrian || address.footway;
          const streetLine = address.house_number && roadName
            ? `${address.house_number} ${roadName}`
            : "";
          if (streetLine) {
            setStreet(streetLine);
          } else if (!street.trim()) {
            setStreet("");
          }

          const provinceTree = await fetch("https://provinces.open-api.vn/api/?depth=3").then(res => res.json());
          const provinceList = provinceTree.map(({ districts: _districts, ...province }: any) => province);
          setProvinces(provinceList);

          const matchedProvinceInTree = findAddressMatch(provinceTree, provinceTerms);
          const matchedProvince = matchedProvinceInTree
            ? provinceList.find((province: any) => province.code === matchedProvinceInTree.code)
            : null;
          if (!matchedProvince) {
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedWard(null);
            setDistricts([]);
            setWards([]);
            setLocationMessage("Đã lấy vị trí nhưng chưa tự khớp được Tỉnh/Thành phố. Bạn vui lòng chọn thủ công.");
            return;
          }

          setSelectedProvince(matchedProvince);
          const nextDistricts = matchedProvinceInTree.districts || [];
          setDistricts(nextDistricts);

          const wardParentMatch = findWardWithParentDistrict(nextDistricts, wardTerms);
          const matchedDistrict = findAddressMatch(nextDistricts, districtTerms) || wardParentMatch?.district;
          if (!matchedDistrict) {
            setSelectedDistrict(null);
            setSelectedWard(null);
            setWards([]);
            setLocationMessage("Đã điền Tỉnh/Thành phố nhưng trình duyệt chưa trả vị trí đủ cụ thể. Bạn vui lòng bật định vị chính xác hoặc chọn thêm Quận/Huyện và Phường/Xã.");
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
            ? " Vị trí trình duyệt đang khá rộng, bạn nên kiểm tra lại số nhà/tên đường."
            : "";
          const streetHint = streetLine
            ? ""
            : " Bạn nhập thêm số nhà/tên đường để địa chỉ giao hàng chính xác hơn.";
          setLocationMessage(
            matchedWard
              ? `Đã tự điền Tỉnh/Thành phố, Quận/Huyện, Phường/Xã từ vị trí hiện tại.${accuracyHint}${streetHint}`
              : "Đã điền Tỉnh/Thành phố và Quận/Huyện. Dữ liệu định vị chưa có Phường/Xã, bạn vui lòng chọn thêm."
          );
        } catch (err) {
          console.error(err);
          setLocationMessage("Không thể lấy địa chỉ từ vị trí. Bạn vui lòng nhập thủ công nhé.");
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

  const fetchCart = () => {
    cartApi.getCart()
      .then((res: any) => {
        // Backend returns { items: [...] } or an array
        const raw = res?.data?.items || res?.data || [];
        setCartItems(Array.isArray(raw) ? raw.map((item: any) => ({
          id: item.id,
          productId: item.productId || item.product?.id,
          productName: item.productName || item.product?.name || "Unknown",
          productImage: item.productImage || (item.product ? mapProduct(item.product).image : ""),
          productTheme: item.productTheme || item.product?.theme || "",
          price: item.unitPrice || item.price || item.product?.price || 0,
          quantity: item.quantity,
          stockQuantity: item.stockQuantity || item.product?.stockQuantity || 99,
        })) : []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchCart();
  }, [navigate]);

  const updateQuantity = (itemId: number, delta: number, current: number, max: number) => {
    const next = Math.max(1, Math.min(max, current + delta));
    if (next === current) return;
    setCartItems(items =>
      items.map(item => item.id === itemId ? { ...item, quantity: next } : item)
    );
    cartApi.updateQuantity(itemId, next)
      .then(() => fetchCart())
      .catch((err) => {
        console.error(err);
        fetchCart();
      });
  };

  const removeItem = (itemId: number) => {
    cartApi.removeItem(itemId).then(() => fetchCart()).catch(console.error);
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const handlePlaceOrder = async () => {
    if (!selectedProvince || !selectedDistrict || !selectedWard || !street.trim()) {
      setCartDialog({
        type: "warning",
        title: "Thiếu địa chỉ giao hàng",
        message: "Vui lòng nhập đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã và số nhà/tên đường trước khi thanh toán.",
      });
      return;
    }
    if (!bankAccount.trim()) {
      setCartDialog({
        type: "warning",
        title: "Thiếu tài khoản hoàn tiền",
        message: "Vui lòng nhập số tài khoản ngân hàng để tiếp tục đặt hàng và nhận tiền hoàn khi cần thiết.",
      });
      return;
    }
    const fullAddress = `${street}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setPlacingOrder(true);
    try {
      // Update bank account in profile first
      if (!hasBankAccount || (userProfile && userProfile.bankAccount !== bankAccount)) {
        await axiosClient.put(`/auth/profile`, {
          fullName: userProfile?.fullName || "",
          phone: userProfile?.phone || "",
          avatarUrl: userProfile?.avatarUrl || "",
          bankAccount: bankAccount,
        });
      }
      const res = await axiosClient.post("/orders", {
        type: "SHOP",
        shippingAddress: fullAddress,
        shippingFee: shipping,
        paymentMethod: paymentMethod, // COD or PAYOS
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      
      const orderData = res.data; // order response
      
      if (paymentMethod === "PAYOS" && orderData && orderData.id) {
        // Fetch PayOS url
        const paymentRes: any = await paymentApi.createPayosLink({ orderId: orderData.id });
        if (paymentRes.data && paymentRes.data.paymentUrl) {
          localStorage.setItem("latestOrderType", "SHOP");
          localStorage.setItem("latestPayosOrderId", String(paymentRes.data.orderId || orderData.id));
          window.location.href = paymentRes.data.paymentUrl;
          return;
        }
      }

      setShowCheckout(false);
      setCartDialog({
        type: "success",
        title: "Đặt hàng thành công",
        message: "Đơn hàng của bạn đã được tạo thành công. Bạn có thể theo dõi trạng thái trong mục đơn hàng.",
        actionLabel: "Xem đơn hàng",
        onConfirm: () => navigate("/orders"),
      });
    } catch (err: any) {
      setCartDialog({
        type: "error",
        title: paymentMethod === "PAYOS" ? "Không thể tạo thanh toán PayOS" : "Đặt hàng thất bại",
        message: err?.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price) * item.quantity, 0);
  
  let shipping = 0;
  if (selectedProvince) {
    if (selectedProvince.name.includes("Hồ Chí Minh")) {
      shipping = 15000;
    } else {
      shipping = 30000;
    }
  }

  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const dialogTheme = cartDialog?.type === "success"
    ? {
        icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        glow: "from-emerald-500/20 to-teal-500/10",
        button: "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
      }
    : cartDialog?.type === "warning"
      ? {
          icon: "bg-amber-50 text-amber-600 ring-amber-100",
          glow: "from-amber-500/20 to-orange-500/10",
          button: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
        }
      : {
          icon: "bg-rose-50 text-rose-600 ring-rose-100",
          glow: "from-rose-500/20 to-pink-500/10",
          button: "from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600",
        };

  const closeCartDialog = () => {
    const onConfirm = cartDialog?.onConfirm;
    setCartDialog(null);
    onConfirm?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-6 py-8"
    >
      {cartDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl"
          >
            <div className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${dialogTheme.glow} blur-2xl`} />
            <button
              type="button"
              onClick={() => setCartDialog(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              aria-label="Đóng thông báo"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${dialogTheme.icon}`}>
                {cartDialog.type === "success" ? (
                  <CheckCircle2 className="h-7 w-7" />
                ) : (
                  <AlertCircle className="h-7 w-7" />
                )}
              </div>
              <h3 className="pr-10 text-xl font-black text-slate-950">{cartDialog.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{cartDialog.message}</p>

              <div className="mt-6 flex items-center justify-end gap-3">
                {cartDialog.onConfirm && (
                  <button
                    type="button"
                    onClick={() => setCartDialog(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    Để sau
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeCartDialog}
                  className={`rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-black text-white shadow-lg transition active:scale-95 ${dialogTheme.button}`}
                >
                  {cartDialog.actionLabel || "Đã hiểu"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Tiếp tục mua sắm</span>
      </button>

      <h1 className="text-4xl font-bold mb-8 text-gray-900">Giỏ hàng của bạn</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Giỏ hàng của bạn đang trống!</h2>
          <p className="text-gray-600 mb-8">Thêm những bộ keycap tuyệt vời vào giỏ hàng ngay</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg"
          >
            Bắt đầu mua sắm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-5">
                  {/* Image */}
                  <div
                    className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3
                          className="font-semibold text-lg mb-1 cursor-pointer hover:text-purple-600 transition-colors text-gray-900"
                          onClick={() => navigate(`/product/${item.productId}`)}
                        >
                          {item.productName}
                        </h3>
                        {item.productTheme && (
                          <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full inline-block text-xs font-semibold">
                            {item.productTheme}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1, item.quantity, item.stockQuantity)}
                          className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center font-bold"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1, item.quantity, item.stockQuantity)}
                          className="w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center font-bold"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{(item.price).toLocaleString('vi-VN')}đ mỗi chiếc</div>
                        <div className="text-xl font-bold text-gray-900">
                          {((item.price) * item.quantity).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-xl mb-6 text-gray-900">Tổng đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                  <span className="font-semibold">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng:</span>
                  <span className="font-semibold text-green-600">{shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString('vi-VN')}đ`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Thuế (8%):</span>
                  <span className="font-semibold">{tax.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-black text-xl text-gray-900">
                    <span>Tổng cộng:</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      {total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              {showCheckout ? (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-sm text-gray-700 block mb-2">Phương thức thanh toán *</label>
                    <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm transition-all ring-emerald-500/10 hover:border-emerald-300 hover:shadow-md">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <WalletCards className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-gray-900">Thanh toán chuyển khoản</span>
                          <span className="block text-xs text-gray-500">Quét QR, chuyển khoản nhanh qua PayOS</span>
                        </span>
                      </div>
                      <span className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-black tracking-tight text-[#00b46f] ring-1 ring-emerald-100">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00b46f] text-[10px] font-black leading-none text-white">
                          p
                        </span>
                        payOS
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="font-semibold text-sm text-gray-700">Địa chỉ giao hàng *</label>
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

                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Số nhà, tên đường..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-3">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-purple-800 leading-normal">
                        <strong>Lưu ý:</strong> Vui lòng cung cấp số tài khoản ngân hàng để phục vụ việc hoàn tiền tự động trong trường hợp có phát sinh sự cố hoặc hủy đơn hàng.
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-xs text-gray-700 block mb-1">Số tài khoản ngân hàng (Hoàn tiền) *</label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Ví dụ: VCB 10123... - NGUYEN VAN A"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placingOrder}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-purple-200"
                    >
                      {placingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {placingOrder ? "Đang xử lý..." : (paymentMethod === "PAYOS" ? "Thanh toán qua PayOS" : "Xác nhận đặt hàng")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl mb-3 font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-200"
                  >
                    Tiến hành thanh toán
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Tiếp tục mua sắm
                  </button>
                </>
              )}

              {/* Promo Code */}
              <div className="mt-6">
                <label className="font-medium mb-2 block text-sm text-gray-700">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                  />
                  <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium">
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
