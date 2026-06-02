// src/app/pages/Cart.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader2, ShoppingCart, AlertCircle } from "lucide-react";
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

export function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PAYOS");

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
    cartApi.removeItem(itemId).then(() => {
      // Re-add with new quantity — since backend only has add/remove
      // If backend supports quantity update, replace this with that call
      fetchCart();
    });
    // Optimistic UI update
    setCartItems(items =>
      items.map(item => item.id === itemId ? { ...item, quantity: next } : item)
    );
  };

  const removeItem = (itemId: number) => {
    cartApi.removeItem(itemId).then(() => fetchCart()).catch(console.error);
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const handlePlaceOrder = async () => {
    if (!selectedProvince || !selectedDistrict || !selectedWard || !street.trim()) {
      alert("Vui lòng nhập đầy đủ địa chỉ giao hàng");
      return;
    }
    if (!bankAccount.trim()) {
      alert("Vui lòng nhập số tài khoản ngân hàng để tiếp tục đặt hàng và nhận tiền hoàn khi cần thiết.");
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
          window.location.href = paymentRes.data.paymentUrl;
          return;
        }
      }

      alert("Đặt hàng thành công! 🎉");
      setShowCheckout(false);
      navigate("/orders");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
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
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white"
                    >
                      <option value="PAYOS">Thanh toán chuyển khoản (PayOS)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="font-semibold text-sm text-gray-700 block mb-2">Địa chỉ giao hàng *</label>
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
