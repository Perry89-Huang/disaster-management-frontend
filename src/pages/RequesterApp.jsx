import React, { useState } from 'react';
import { Building2, Phone, User, FileText, CheckCircle, AlertCircle, Clock, LogIn, UserPlus, ArrowRight } from 'lucide-react';

export default function RequesterApp() {
  const [requester, setRequester] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // login 或 register

  if (!requester) {
    return <RequesterAuth onLogin={setRequester} authMode={authMode} setAuthMode={setAuthMode} />;
  }

  return <RequesterDashboard requester={requester} onLogout={() => setRequester(null)} />;
}

// 需求者登入/註冊頁面
function RequesterAuth({ onLogin, authMode, setAuthMode }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    organization: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!formData.phone || !formData.name) {
      alert('請填寫電話和姓名');
      return;
    }
    
    setLoading(true);
    // 模擬 API 呼叫
    setTimeout(() => {
      // 模擬查詢需求者
      const mockRequester = {
        id: '1',
        name: formData.name,
        phone: formData.phone,
        organization: '光復鄉公所',
        status: 'approved'
      };
      onLogin(mockRequester);
      alert('✅ 登入成功！');
      setLoading(false);
    }, 1000);
  };

  const handleRegister = () => {
    if (!formData.name || !formData.phone) {
      alert('請填寫必填欄位');
      return;
    }

    setLoading(true);
    // 模擬 API 呼叫
    setTimeout(() => {
      alert('✅ 註冊申請已送出！\n請等待管理員審核\n審核通過後即可登入建立需求');
      setAuthMode('login');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo 與標題 */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-3xl shadow-2xl p-6 inline-block mb-4">
            <Building2 className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">光復救災</h1>
          <p className="text-red-100 text-lg">需求者管理系統</p>
        </div>

        {/* 登入/註冊表單 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tab 切換 */}
          <div className="flex bg-gray-100 p-2">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-white text-red-600 shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <LogIn className="w-5 h-5 inline mr-2" />
              登入
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-white text-red-600 shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              註冊申請
            </button>
          </div>

          {/* 表單內容 */}
          <div className="p-8">
            {authMode === 'login' ? (
              // 登入表單
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-red-600" />電話號碼
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="0912-345-678"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-red-600" />姓名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="請輸入姓名"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? '登入中...' : '登入'}</span>
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              // 註冊表單
              <div className="space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-semibold mb-1">申請須知</p>
                      <p>提交申請後需經管理員審核，審核通過後即可登入建立救災需求</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-red-600" />姓名 <span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="請輸入真實姓名"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-red-600" />電話號碼 <span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="0912-345-678"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-red-600" />所屬單位
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="例：光復鄉公所、村辦公室"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-red-600" />申請原因
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                    rows="3"
                    placeholder="請簡述需要使用此系統的原因"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? '送出中...' : '提交申請'}</span>
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 聯絡資訊 */}
        <div className="text-center mt-6 text-white">
          <p className="text-sm opacity-90">花蓮縣光復鄉公所</p>
          <p className="text-sm opacity-90 mt-1">緊急聯絡電話: 03-8701100</p>
        </div>
      </div>
    </div>
  );
}

// 需求者控制台
function RequesterDashboard({ requester, onLogout }) {
  const [requests, setRequests] = useState([
    {
      id: '1',
      description: '東富村淹水需要協助清理',
      village: '東富村',
      street: '中正路123號',
      status: 'pending',
      created_at: '2025-10-10 10:30'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">{requester.name}</h1>
              <p className="text-sm text-gray-600">{requester.organization}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold transition"
          >
            登出
          </button>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* 歡迎卡片 */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <CheckCircle className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold">歡迎回來！</h2>
              <p className="opacity-90">您可以在此建立與管理救災需求</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{requests.length}</div>
              <div className="text-sm opacity-90 mt-1">總需求數</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{requests.filter(r => r.status === 'pending').length}</div>
              <div className="text-sm opacity-90 mt-1">待處理</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm opacity-90 mt-1">進行中</div>
            </div>
          </div>
        </div>

        {/* 需求列表 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">我的需求</h3>
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition">
              <FileText className="w-5 h-5" />
              新增需求
            </button>
          </div>

          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-300 transition">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-800">{req.description}</h4>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                    待支援
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>📍 {req.village} {req.street}</div>
                  <div>🕒 {req.created_at}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
