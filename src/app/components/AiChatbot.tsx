// src/app/components/AiChatbot.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  Send,
  X,
  RefreshCw,
  SlidersHorizontal,
  Bot,
  Star,
  Loader2,
  ChevronDown,
  DollarSign
} from "lucide-react";
import { aiApi } from "../api/aiApi";
import { AiRecommendation } from "../types";
import { toast } from "sonner";
import { getAiConversationKey, getAiMessagesKey } from "../utils/aiChatStorage";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  recommendations?: AiRecommendation[];
  followUpQuestions?: string[];
  createdAt: Date;
  requiresAuth?: boolean;
}

interface ActiveFollowUp {
  question: string;
  options: string[];
  customAnswer: string;
  selectedOption: string | null;
  isBudget?: boolean;
}

const parseOptions = (question: string): string[] => {
  const colonIndex = question.indexOf(":");
  if (colonIndex === -1) {
    const lowercase = question.toLowerCase();
    
    // Filter out open-ended questions that require custom descriptions instead of simple Yes/No
    const openQuestionKeywords = [
      "mô tả", "chia sẻ", "yêu cầu", "chi tiết", "nêu", "gì", "nào", 
      "như thế nào", "bổ sung", "thông tin", "tại sao", "lý do", 
      "ý tưởng", "đặc biệt", "sở thích", "thiết kế thế nào", "cụ thể",
      "bao nhiêu", "bao lâu"
    ];
    const isOpenQuestion = openQuestionKeywords.some(keyword => lowercase.includes(keyword));
    if (isOpenQuestion) {
      return [];
    }

    if (lowercase.includes("không") && (lowercase.includes("có") || lowercase.includes("chưa") || lowercase.includes("đã") || lowercase.includes("bạn đã"))) {
      return ["Có", "Không"];
    }
    return [];
  }
  
  const optionsPart = question.substring(colonIndex + 1).replace(/\?/g, "").trim();
  const normalized = optionsPart
    .replace(/\bhay\b/ig, ",")
    .replace(/\bhoặc\b/ig, ",");
  
  const rawParts = normalized.split(",");
  const options: string[] = [];
  
  for (let part of rawParts) {
    part = part.trim();
    if (!part) continue;
    
    if (part.includes("/")) {
      const subParts = part.split("/");
      for (const sp of subParts) {
        const cleaned = sp.trim().split(" ")[0];
        if (cleaned && cleaned.length > 0) {
          options.push(cleaned);
        }
      }
    } else {
      const words = part.split(/\s+/);
      if (words.length > 2) {
        options.push(words.slice(0, 2).join(" "));
      } else {
        options.push(part);
      }
    }
  }
  
  return options
    .map(opt => opt.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim())
    .filter(opt => opt.length > 0 && opt.length < 25);
};

export function AiChatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<ActiveFollowUp | null>(null);

  // Budget settings
  const [showBudget, setShowBudget] = useState(false);
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const getCurrentUserId = () => localStorage.getItem("userId");
  const isAuthenticated = () => Boolean(localStorage.getItem("token") && getCurrentUserId());

  const buildAuthRequiredMessage = (): Message => ({
    id: `auth-required-${Date.now()}`,
    sender: "ai",
    text: "Bạn cần đăng nhập để trò chuyện với trợ lý AI của HWShop. Nếu chưa có tài khoản, bạn có thể đăng ký tài khoản mới rất nhanh.",
    createdAt: new Date(),
    requiresAuth: true,
  });

  // Load conversation ID and initial welcome message
  useEffect(() => {
    if (!isAuthenticated()) {
      setConversationId(null);
      setMessages([buildAuthRequiredMessage()]);
      return;
    }

    const userId = getCurrentUserId();
    const conversationKey = getAiConversationKey(userId);
    const messagesKey = getAiMessagesKey(userId);
    const cachedId = conversationKey ? localStorage.getItem(conversationKey) : null;
    if (cachedId) {
      setConversationId(Number(cachedId));
    }

    const cachedMessages = messagesKey ? localStorage.getItem(messagesKey) : null;
    if (cachedMessages) {
      try {
        const parsed = JSON.parse(cachedMessages);
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
          }))
        );
      } catch (e) {
        loadDefaultWelcome();
      }
    } else {
      loadDefaultWelcome();
    }
  }, []);

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (messages.length > 0 && isAuthenticated()) {
      const messagesKey = getAiMessagesKey(getCurrentUserId());
      if (messagesKey) {
        localStorage.setItem(messagesKey, JSON.stringify(messages));
      }
    }
  }, [messages]);

  // Scroll to bottom when messages or open state changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    const handleLogout = () => {
      setConversationId(null);
      setMinBudget("");
      setMaxBudget("");
      setShowBudget(false);
      setInputValue("");
      setMessages([buildAuthRequiredMessage()]);
    };

    window.addEventListener("auth-logout", handleLogout);
    return () => window.removeEventListener("auth-logout", handleLogout);
  }, []);

  const loadDefaultWelcome = () => {
    const welcomeMsg: Message = {
      id: "welcome",
      sender: "ai",
      text: "Xin chào! Mình là **HWShop AI Assistant** 🤖. Mình có thể giúp bạn chọn keycap phù hợp với bàn phím của bạn, tư vấn về layout (60%, TKL, Full...), key profile (Cherry, OEM, SA...), hoặc hỗ trợ quy trình thiết kế custom. Bạn cần mình tư vấn gì hôm nay?",
      followUpQuestions: [
        "Tư vấn keycap layout 75%",
        "Profile SA và OEM khác gì nhau?",
        "Tìm keycap giá dưới 1 triệu",
        "Cách đặt thiết kế custom keycap?"
      ],
      createdAt: new Date(),
    };
    setMessages([welcomeMsg]);
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    const userId = getCurrentUserId();
    const conversationKey = getAiConversationKey(userId);
    const messagesKey = getAiMessagesKey(userId);
    if (conversationKey) localStorage.removeItem(conversationKey);
    if (messagesKey) localStorage.removeItem(messagesKey);
    setConversationId(null);
    setMinBudget("");
    setMaxBudget("");
    setShowBudget(false);
    setShowClearConfirm(false);
    if (isAuthenticated()) {
      loadDefaultWelcome();
    } else {
      setMessages([buildAuthRequiredMessage()]);
    }
    toast.success("Đã làm mới cuộc hội thoại");
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    if (!isAuthenticated()) {
      setMessages((prev) => [...prev, buildAuthRequiredMessage()]);
      setInputValue("");
      return;
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const minB = minBudget ? Number(minBudget) : undefined;
      const maxB = maxBudget ? Number(maxBudget) : undefined;

      const response = await aiApi.chat({
        conversationId,
        message: textToSend,
        minBudget: minB,
        maxBudget: maxB,
      });

      const data = response.data;
      if (data) {
        if (data.conversationId) {
          setConversationId(data.conversationId);
          const conversationKey = getAiConversationKey(getCurrentUserId());
          if (conversationKey) {
            localStorage.setItem(conversationKey, String(data.conversationId));
          }
        }

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.reply,
          recommendations: data.recommendations,
          followUpQuestions: data.followUpQuestions,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error: any) {
      console.error("AI Chat error:", error);

      const errorMsg: Message = {
        id: `ai-error-${Date.now()}`,
        sender: "ai",
        text: "Xin lỗi bạn, kết nối tới hệ thống AI đang gặp chút sự cố. Bạn vui lòng thử lại sau vài giây nha!",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpClick = (q: string) => {
    const lowercaseQ = q.toLowerCase();
    const isBudgetQuestion = 
      lowercaseQ.includes("ngân sách") ||
      lowercaseQ.includes("giá") ||
      lowercaseQ.includes("tiền") ||
      lowercaseQ.includes("budget");

    if (isBudgetQuestion) {
      setActiveFollowUp({
        question: q,
        options: [],
        customAnswer: "",
        selectedOption: null,
        isBudget: true,
      });
      return;
    }

    const parsedOpts = parseOptions(q);
    if (parsedOpts.length > 0) {
      setActiveFollowUp({
        question: q,
        options: parsedOpts,
        customAnswer: "",
        selectedOption: null,
        isBudget: false,
      });
    } else {
      // If there are no options, directly autofill into the main chat input and focus
      setInputValue(q + " ");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const formatInlineMarkdown = (text: string, keyPrefix: string) => {
    const nodes: React.ReactNode[] = [];
    const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(text.slice(lastIndex, match.index));
      }

      const token = match[0];
      const content = token.startsWith("**")
        ? token.slice(2, -2)
        : token.slice(1, -1);

      nodes.push(
        token.startsWith("**") ? (
          <strong key={`${keyPrefix}-${match.index}`}>{content}</strong>
        ) : (
          <em key={`${keyPrefix}-${match.index}`}>{content}</em>
        )
      );

      lastIndex = match.index + token.length;
    }

    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }

    return nodes;
  };

  // Helper to parse simple markdown bold **text**, italic *text* and linebreaks
  const formatMessageText = (text: string) => {
    if (!text) return "";

    const lines = text.split("\n");
    return lines.map((line, idx) => (
      <span key={idx}>
        {formatInlineMarkdown(line, `line-${idx}`)}
        {idx < lines.length - 1 && <br />}
      </span>
    ));
  };

  const isBudgetActive = minBudget || maxBudget;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ${isOpen ? "rotate-90" : "animate-bounce"
          }`}
        style={{
          animationDuration: "3s",
          boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.4)"
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <Sparkles className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-purple-600 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-purple-600"></span>
          </div>
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 animate-fade-in-up"
          style={{
            boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.15)",
          }}
        >
          {activeFollowUp && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 px-5 backdrop-blur-sm">
              <div className="w-full max-w-[340px] overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl animate-fade-in-up">
                <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 px-5 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
                      <Bot className="h-5 w-5 text-purple-400" />
                    </span>
                    <div>
                      <h4 className="text-sm font-black">Trả lời trợ lý AI</h4>
                      <p className="mt-0.5 text-xs font-medium text-slate-300">
                        {activeFollowUp.isBudget ? "Thiết lập khoảng giá tư vấn" : "Nhấp chọn một câu trả lời dưới đây"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed animate-fade-in">
                    {activeFollowUp.question}
                  </div>

                  {activeFollowUp.isBudget ? (
                    <div className="space-y-3.5 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giá tối thiểu (VND)</label>
                          <input
                            type="number"
                            placeholder="Ví dụ: 500000"
                            value={minBudget}
                            onChange={(e) => setMinBudget(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giá tối đa (VND)</label>
                          <input
                            type="number"
                            placeholder="Ví dụ: 2000000"
                            value={maxBudget}
                            onChange={(e) => setMaxBudget(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition text-slate-800"
                          />
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-relaxed italic">
                        * Mức giá này sẽ được lưu trực tiếp vào bộ lọc tìm kiếm sản phẩm của AI.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chọn câu trả lời:</label>
                      <div className="flex flex-wrap gap-2">
                        {activeFollowUp.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const finalMessage = `Trả lời câu hỏi: "${activeFollowUp.question}"\n-> Đáp án: ${opt}`;
                              handleSendMessage(finalMessage);
                              setActiveFollowUp(null);
                            }}
                            className="px-3 py-2 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-600 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveFollowUp(null)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                    {activeFollowUp.isBudget && (
                      <button
                        type="button"
                        onClick={() => {
                          const minStr = minBudget ? Number(minBudget).toLocaleString("vi-VN") + "đ" : "0đ";
                          const maxStr = maxBudget ? Number(maxBudget).toLocaleString("vi-VN") + "đ" : "vô cực";
                          const finalMessage = `Trả lời câu hỏi: "${activeFollowUp.question}"\n-> Đáp án: Ngân sách từ ${minStr} đến ${maxStr}`;
                          handleSendMessage(finalMessage);
                          setActiveFollowUp(null);
                        }}
                        className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02] active:scale-95"
                      >
                        Xác nhận & Gửi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showClearConfirm && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 px-5 backdrop-blur-sm">
              <div className="w-full max-w-[340px] overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
                <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 px-5 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
                      <RefreshCw className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-black">Bắt đầu chat mới?</h4>
                      <p className="mt-0.5 text-xs font-medium text-slate-300">Cuộc hội thoại hiện tại sẽ được xóa.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-slate-600">
                    Bạn có chắc muốn làm mới trợ lý AI và xóa nội dung trò chuyện cũ không?
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      Giữ lại
                    </button>
                    <button
                      type="button"
                      onClick={confirmClearChat}
                      className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02] active:scale-95"
                    >
                      Xóa & chat mới
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Bot className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Trợ lý ảo HWShop</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-slate-300 font-medium">Đang trực tuyến</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Làm mới đoạn chat"
                className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  setIsOpen(false);
                }}
                className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 shadow-sm border border-purple-200/50">
                    <Bot className="w-4.5 h-4.5 text-purple-600" />
                  </div>
                )}

                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${msg.sender === "user"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-tr-none"
                        : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                      }`}
                  >
                    {formatMessageText(msg.text)}
                  </div>

                  {msg.requiresAuth && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/login");
                        }}
                        className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-purple-600"
                      >
                        Đăng nhập
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/login?mode=signup");
                        }}
                        className="rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-bold text-purple-600 transition hover:bg-purple-50"
                      >
                        Đăng ký tài khoản
                      </button>
                    </div>
                  )}

                  {/* Recommendations scroll list */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="flex overflow-x-auto gap-3.5 py-2 mt-2 w-[340px] max-w-full snap-x scrollbar-thin scrollbar-thumb-slate-200">
                      {msg.recommendations.map((prod) => (
                        <div
                          key={prod.productId}
                          className="bg-white border border-slate-150 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all duration-300 w-52 shrink-0 snap-start flex flex-col justify-between"
                        >
                          <div>
                            {/* Image */}
                            <div className="relative rounded-xl overflow-hidden h-28 bg-slate-100 mb-2">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                  <Sparkles className="w-8 h-8" />
                                </div>
                              )}
                              {/* Stock status */}
                              {prod.stockQuantity === 0 && (
                                <div className="absolute top-1.5 right-1.5 bg-gray-500/90 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                                  Hết hàng
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            <div className="flex gap-1 mb-1.5 flex-wrap">
                              {prod.layoutType && (
                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-bold">
                                  {prod.layoutType.replace("LAYOUT_", "")}
                                </span>
                              )}
                              {prod.keyProfile && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">
                                  {prod.keyProfile}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h4 className="font-bold text-xs text-slate-800 line-clamp-1 mb-1">
                              {prod.name}
                            </h4>

                            {/* Price / Star Rating */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-black text-slate-900">
                                {prod.price.toLocaleString("vi-VN")}đ
                              </span>
                              <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{prod.averageRating ? prod.averageRating.toFixed(1) : "N/A"}</span>
                              </div>
                            </div>

                            {/* AI Reason */}
                            {prod.reason && (
                              <p className="text-[10px] text-purple-700 bg-purple-50/70 border border-purple-100 rounded-xl p-1.5 leading-relaxed italic line-clamp-2">
                                {prod.reason}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigate(`/product/${prod.productId}`);
                            }}
                            className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-purple-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render inline follow-up questions from response */}
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.followUpQuestions.map((q, qidx) => (
                        <button
                          key={qidx}
                          onClick={() => {
                            if (msg.id === "welcome") {
                              handleSendMessage(q);
                            } else {
                              handleFollowUpClick(q);
                            }
                          }}
                          className="bg-white hover:bg-purple-50 text-purple-600 border border-purple-200 hover:border-purple-300 text-xs px-3 py-1.5 rounded-full transition-all text-left shadow-sm"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* AI Typing Loader */}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200/50 shadow-sm animate-pulse">
                  <Bot className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-400 flex items-center gap-2 shadow-sm font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  AI đang phân tích sản phẩm...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Budget Setting Panel (Collapsible) */}
          {showBudget && (
            <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 animate-slide-up flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  Giới hạn ngân sách tư vấn
                </span>
                <button
                  onClick={() => setShowBudget(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Giá tối thiểu (VND)</label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 500000"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Giá tối đa (VND)</label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 1500000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-slate-100 bg-white flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* Budget Toggle Button */}
              <button
                onClick={() => setShowBudget(!showBudget)}
                className={`p-2.5 rounded-xl border transition-all relative ${isBudgetActive
                    ? "bg-purple-50 border-purple-300 text-purple-600"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                title="Thiết lập bộ lọc ngân sách tư vấn"
              >
                <SlidersHorizontal className="w-4.5 h-4.5" />
                {isBudgetActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border border-white"></span>
                )}
              </button>

              {/* Chat Input */}
              <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-white focus-within:border-purple-300 transition-all flex items-center gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    !isAuthenticated()
                      ? "Đăng nhập để chat với trợ lý AI..."
                      : isBudgetActive ? "Chat tư vấn kèm ngân sách..." : "Hỏi AI tư vấn keycap..."
                  }
                  className="flex-1 bg-transparent resize-none focus:outline-none text-sm text-slate-800 placeholder-slate-400 font-medium"
                  style={{ maxHeight: "80px" }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 rounded-xl bg-slate-900 hover:bg-purple-600 disabled:opacity-40 disabled:hover:bg-slate-900 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Active budget hint */}
            {isBudgetActive && !showBudget && (
              <div className="text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded-lg flex items-center justify-between">
                <span>
                  Đang bật bộ lọc ngân sách:{" "}
                  <strong>
                    {minBudget ? Number(minBudget).toLocaleString("vi-VN") : "0"}đ -{" "}
                    {maxBudget ? Number(maxBudget).toLocaleString("vi-VN") : "vô cực"}đ
                  </strong>
                </span>
                <button
                  onClick={() => {
                    setMinBudget("");
                    setMaxBudget("");
                  }}
                  className="hover:underline font-bold"
                >
                  Xóa lọc
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
