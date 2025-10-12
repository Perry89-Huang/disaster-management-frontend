import React from 'react';
import { Users, HandHeart } from 'lucide-react';

export default function ShovelHeroHome() {
  const handleProviderClick = () => {
    console.log('導航到服務提供者註冊頁面');
    // TODO: 實作導航邏輯
  };

  const handleRequestClick = () => {
    console.log('導航到需求登錄頁面');
    // TODO: 實作導航邏輯
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo 和標題區域 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-full shadow-2xl p-4 transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="/images/shovel-hero-icon.png" 
                  alt="鏟子超人"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🦸‍♂️</div>';
                  }}
                />
              </div>
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-3xl">⛏️</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            花蓮 <span className="text-blue-600">鏟子超人</span>
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-600 font-medium">
            媒合系統
          </h2>
          <p className="text-gray-500 mt-4 text-lg">
            連結需求與服務，讓愛心遍布花蓮
          </p>
        </div>

        {/* 按鈕區域 */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 px-4">
          {/* 服務提供者按鈕 */}
          <button
            onClick={handleProviderClick}
            className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-3xl shadow-2xl p-8 md:p-10 transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/50"
          >
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Users size={24} />
            </div>
            
            <div className="text-left">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                我是鏟子超人
              </h3>
              <p className="text-blue-100 text-base md:text-lg">
                註冊成為服務提供者<br />
                用您的專長幫助需要的人
              </p>
            </div>
            
            <div className="mt-6 flex items-center text-sm font-semibold">
              <span>立即註冊</span>
              <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </button>

          {/* 需求登錄按鈕 */}
          <button
            onClick={handleRequestClick}
            className="group relative bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-3xl shadow-2xl p-8 md:p-10 transform hover:scale-105 transition-all duration-300 hover:shadow-green-500/50"
          >
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <HandHeart size={24} />
            </div>
            
            <div className="text-left">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                我需要幫助
              </h3>
              <p className="text-green-100 text-base md:text-lg">
                登錄您的需求<br />
                讓鏟子超人來協助您
              </p>
            </div>
            
            <div className="mt-6 flex items-center text-sm font-semibold">
              <span>發布需求</span>
              <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </button>
        </div>

        {/* 底部資訊 */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 花蓮鏟子超人媒合系統 - 讓愛心與需求相遇的地方</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
