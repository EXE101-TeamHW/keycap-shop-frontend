import { useState } from "react";
import { Upload, FileText, Image, CheckCircle, Palette, Keyboard } from "lucide-react";
import { useNavigate } from "react-router";

export function CustomService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    layout: "",
    profile: "",
    theme: "",
    budget: "",
    description: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-500" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Request Submitted!</h2>
          <p className="text-gray-600 mb-2">Thank you for your custom keyboard request.</p>
          <p className="text-gray-600">Our team will contact you within 24-48 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">Custom Keyboard Service</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create your dream keyboard with our custom design service. Share your vision, upload reference images, and our team will bring it to life.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
          <Palette className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h3 className="font-semibold text-lg mb-2 text-gray-900">Unlimited Design Options</h3>
          <p className="text-gray-600 text-sm">Choose any color, pattern, or theme you can imagine</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
          <Keyboard className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h3 className="font-semibold text-lg mb-2 text-gray-900">Any Layout</h3>
          <p className="text-gray-600 text-sm">Support for 60%, 65%, 75%, TKL, Full, and custom layouts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h3 className="font-semibold text-lg mb-2 text-gray-900">Professional Service</h3>
          <p className="text-gray-600 text-sm">Expert consultation and high-quality manufacturing</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Request Form</h2>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-medium mb-2 block text-gray-700">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="John Doe"
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
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="font-medium mb-2 block text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="+1 (555) 000-0000"
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
                <option value="">Select layout</option>
                <option value="60%">60% (61 keys)</option>
                <option value="65%">65% (68 keys)</option>
                <option value="75%">75% (84 keys)</option>
                <option value="TKL">TKL (87 keys)</option>
                <option value="FULL">Full (104 keys)</option>
                <option value="ISO">ISO Layout</option>
                <option value="ANSI">ANSI Layout</option>
                <option value="Custom">Custom Layout</option>
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
                <option value="">Select profile</option>
                <option value="Cherry">Cherry Profile</option>
                <option value="OEM">OEM Profile</option>
                <option value="SA">SA Profile</option>
                <option value="DSA">DSA Profile</option>
                <option value="XDA">XDA Profile</option>
                <option value="MT3">MT3 Profile</option>
              </select>
            </div>
            <div>
              <label className="font-medium mb-2 block text-gray-700">Budget (USD)</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="$200 - $500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="font-medium mb-2 block text-gray-700">Color Theme / Style *</label>
            <input
              type="text"
              required
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="e.g., Cyberpunk, Minimalist White, Pastel Pink..."
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="font-medium mb-2 block text-gray-700">Detailed Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              placeholder="Describe your vision in detail. Include colors, patterns, specific requirements, inspiration, etc."
            />
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="font-medium mb-2 block text-gray-700">Upload Reference Images/PDF</label>
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
                Click to upload or drag and drop
              </label>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG, PDF up to 10MB each</p>
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
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Submit Custom Request
          </button>
        </form>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">How It Works</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <span>Fill out the request form with your requirements</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <span>Upload reference images or design files</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <span>Our team reviews and contacts you within 48 hours</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <span>We create mockups and refine the design together</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">5.</span>
                <span>Manufacturing begins after approval</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">6.</span>
                <span>Delivery in 4-6 weeks</span>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Pricing Guide</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">60%-65% Layout:</span>
                <span className="font-semibold">$200-$400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">75%-TKL Layout:</span>
                <span className="font-semibold">$300-$500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Full Layout:</span>
                <span className="font-semibold">$400-$600</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Custom/Complex:</span>
                <span className="font-semibold">$500+</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">*Prices vary based on materials, complexity, and quantity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
