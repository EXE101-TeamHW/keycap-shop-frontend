// src/app/components/BannerCarousel.tsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { limitedEditions } from "../data/products";

export function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % limitedEditions.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % limitedEditions.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + limitedEditions.length) % limitedEditions.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative h-[600px] overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900">
      {/* Background Particles Effect */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Slides */}
      {limitedEditions.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-105"
          }`}
        >
          {/* Background Image with Parallax */}
          <div 
            className="absolute inset-0 transition-transform duration-1000"
            style={{
              transform: index === currentSlide ? 'scale(1)' : 'scale(1.1)',
            }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-2xl">
                {/* Limited Edition Badge */}
                <div 
                  className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-6 text-white text-sm font-bold border border-white/20 shadow-2xl transition-all duration-700 delay-100 ${
                    index === currentSlide 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-4 opacity-0'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Limited Edition
                </div>

                {/* Title */}
                <h2 
                  className={`text-7xl font-black mb-6 text-white leading-tight transition-all duration-700 delay-200 ${
                    index === currentSlide 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-4 opacity-0'
                  }`}
                  style={{
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  {slide.title}
                </h2>

                {/* Subtitle */}
                <p 
                  className={`text-2xl mb-8 text-gray-200 font-medium transition-all duration-700 delay-300 ${
                    index === currentSlide 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-4 opacity-0'
                  }`}
                >
                  {slide.subtitle}
                </p>

                {/* Price and CTA */}
                <div 
                  className={`flex items-center gap-6 transition-all duration-700 delay-400 ${
                    index === currentSlide 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-4 opacity-0'
                  }`}
                >
                  <span className="text-5xl font-black text-white">
                    {slide.price}
                  </span>
                  <button className="group relative px-8 py-4 bg-white text-gray-900 rounded-xl font-bold overflow-hidden shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
                    <span className="relative z-10">Shop Now</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                    <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
                      Shop Now
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-4 rounded-full hover:bg-white/20 transition-all z-10 shadow-2xl border border-white/20 group"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-4 rounded-full hover:bg-white/20 transition-all z-10 shadow-2xl border border-white/20 group"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {limitedEditions.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentSlide 
                ? "bg-white w-12 shadow-lg shadow-white/50" 
                : "bg-white/50 w-2 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{
            width: isAutoPlaying ? `${((currentSlide + 1) / limitedEditions.length) * 100}%` : '0%',
          }}
        />
      </div>
    </div>
  );
}
