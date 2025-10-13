import React, { useState } from 'react';
import { Users, Heart, Menu, X, Home, Shield } from 'lucide-react';
import VolunteerApp from './pages/VolunteerApp';
import RequesterApp from './pages/RequesterApp';
import AdminApp from './pages/AdminApp';

// 首頁組件
function HomePage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo 和標題區域 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-48 h-48 md:w-64 md:h-64 shadow-2xl p-4 transform hover:scale-105 transition-transform duration-300">
                {/* 超人圖示 */}
                <div className="w-full h-full flex items-center justify-center text-6xl md:text-8xl">
                  <img
                    src="/superman/images/superman.png"
                    alt="鏟子超人"
                    className="w-32 h-32 md:w-48 md:h-48 object-contain"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </div>
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
            連結需求與服務,讓愛心遍布花蓮
          </p>
        </div>

        {/* 按鈕區域 */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 px-4">
          {/* 服務提供者按鈕 */}
          <button
            onClick={() => {
              console.log('點擊服務提供者按鈕');
              onNavigate('provider');
            }}
            className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-3xl shadow-2xl p-8 md:p-10 transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/50"
          >
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Users size={24} />
            </div>
            
            <div className="text-left">
              <div className="text-5xl mb-4">💪 </div>
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
            onClick={() => {
              console.log('點擊需求登錄按鈕');
              onNavigate('request');
            }}
            className="group relative bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-3xl shadow-2xl p-8 md:p-10 transform hover:scale-105 transition-all duration-300 hover:shadow-green-500/50"
          >
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Heart size={24} />
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
          <p>花蓮鏟子超人媒合系統 - 讓愛心與需求相遇的地方</p>
          <p>©2025 美魔力 - 發現台灣最美的風景</p>
        </div>
      </div>
    </div>
  );
}

// 服務提供者註冊頁面（佔位符）
function ProviderPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">服務提供者註冊</h2>
          <p className="text-gray-600 mb-6">此頁面正在開發中...</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
}

// 需求登錄頁面（佔位符）
function RequestPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">需求登錄</h2>
          <p className="text-gray-600 mb-6">此頁面正在開發中...</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
}

// 導航列組件
function Navbar({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo 區域 */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
          >
            <span className="text-2xl mr-2">
              <img
                src="/superman/images/superman-icon.png"
                alt="鏟子超人"
                className="w-8 h-8 md:w-12 md:h-12 object-contain"
              />
            </span>
            <span className="text-xl font-bold text-gray-800">
              鏟子超人<span className="text-blue-600 hidden sm:inline"> 媒合系統</span>
            </span>
          </div>

          {/* 桌面版選單 */}
          <div className="hidden md:flex space-x-4">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'home'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="inline mr-2" size={18} />
              首頁
            </button>
            <button
              onClick={() => onNavigate('provider')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'provider'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="inline mr-2" size={18} />
              服務提供者
            </button>
            <button
              onClick={() => onNavigate('request')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'request'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart className="inline mr-2" size={18} />
              需求登錄
            </button>
          </div>

          {/* 手機版選單按鈕 */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 手機版下拉選單 */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                currentPage === 'home'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="inline mr-2" size={18} />
              首頁
            </button>
            <button
              onClick={() => {
                onNavigate('provider');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                currentPage === 'provider'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="inline mr-2" size={18} />
              服務提供者
            </button>
            <button
              onClick={() => {
                onNavigate('request');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                currentPage === 'request'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart className="inline mr-2" size={18} />
              需求登錄
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// 主應用程式
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentApp, setCurrentApp] = useState(null);

  const handleNavigate = (page) => {
    console.log('🔄 導航到:', page);
    
    // 如果要導航到 provider、request 或 admin，切換到對應的完整應用
    if (page === 'provider') {
      console.log('✅ 切換到 VolunteerApp');
      setCurrentApp('volunteer');
      setCurrentPage('provider');
      return;
    } else if (page === 'request') {
      console.log('✅ 切換到 RequesterApp');
      setCurrentApp('requester');
      setCurrentPage('request');
      return;
    } else if (page === 'admin') {
      console.log('✅ 切換到 AdminApp');
      setCurrentApp('admin');
      setCurrentPage('admin');
      return;
    }
    
    // 返回首頁時重置 currentApp
    if (page === 'home') {
      console.log('✅ 返回首頁，重置 currentApp');
      setCurrentApp(null);
    }
    
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* 如果進入 VolunteerApp 或 RequesterApp，直接渲染它們 */}
      {currentApp === 'volunteer' ? (
        <VolunteerApp />
      ) : currentApp === 'requester' ? (
        <RequesterApp />
      ) : currentApp === 'admin' ? (
        <AdminApp />
      ) : (
        <>
          {/* 只有在首頁時不顯示導航列 */}
          {currentPage !== 'home' && (
            <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
          )}
          
          {/* 根據當前頁面顯示不同的組件 */}
          {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
          {currentPage === 'provider' && <ProviderPage onNavigate={handleNavigate} />}
          {currentPage === 'request' && <RequestPage onNavigate={handleNavigate} />}
        </>
      )}
    </div>
  );
}