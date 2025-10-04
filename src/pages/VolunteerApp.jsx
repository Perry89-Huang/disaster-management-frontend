import React, { useState } from 'react';
import { Bell, MapPin, Phone, Clock, CheckCircle, AlertCircle, User, LogOut, Home, Mail, Users, ArrowRight, Power, XCircle, Check, X } from 'lucide-react';

// 模擬志工資料
const mockVolunteer = {
  id: '1',
  name: '王小明',
  phone: '0912-345-678',
  email: 'wang@example.com',
  member_count: 2,
  status: 'off' // off, available, assigning, assigned
};

// 模擬派單資料
const mockAssignments = [
  {
    id: '1',
    status: 'pending',
    assigned_at: new Date().toISOString(),
    disaster_request: {
      id: 'r1',
      description: '需要協助清理淤泥，約一層樓高',
      village: '東富村',
      street: '佛祖街15號',
      contact_name: '林大哥',
      contact_phone: '0988-039601',
      priority: 'urgent',
      request_type: '志工'
    }
  }
];

// 主應用程式元件
export default function VolunteerApp() {
  const [volunteer, setVolunteer] = useState(mockVolunteer);
  const [currentPage, setCurrentPage] = useState('home');

  const handleLogout = () => {
    setVolunteer(null);
    setCurrentPage('home');
  };

  if (!volunteer) {
    return <AuthScreen onLogin={setVolunteer} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* 頂部導航 */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">光復救災志工</h1>
              <p className="text-xs text-red-100">{volunteer.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative hover:bg-white/20 p-2 rounded-lg transition">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">2</span>
            </button>
            <button onClick={handleLogout} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition backdrop-blur-sm">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">登出</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto p-4">
        {currentPage === 'home' && <HomePage volunteer={volunteer} setVolunteer={setVolunteer} />}
        {currentPage === 'tasks' && <TasksPage volunteer={volunteer} setVolunteer={setVolunteer} />}
        {currentPage === 'profile' && <ProfilePage volunteer={volunteer} />}
      </div>

      {/* 底部導航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto flex justify-around items-center h-16">
          <NavButton icon={<Home />} label="首頁" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
          <NavButton icon={<CheckCircle />} label="任務" active={currentPage === 'tasks'} onClick={() => setCurrentPage('tasks')} />
          <NavButton icon={<User />} label="我的" active={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
        </div>
      </div>
    </div>
  );
}

// 認證畫面（登入/註冊）
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    member_count: 1
  });

  const handleLogin = () => {
    if (!formData.phone || !formData.name) {
      alert('請填寫手機號碼和姓名');
      return;
    }
    // 模擬登入
    onLogin({ ...mockVolunteer, name: formData.name, phone: formData.phone });
  };

  const handleRegister = () => {
    if (!formData.phone || !formData.name) {
      alert('請填寫必填欄位（姓名和手機號碼）');
      return;
    }
    alert('註冊成功！請使用手機號碼和姓名登入');
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-red-600 to-red-700 p-4 rounded-3xl shadow-2xl mb-4">
            <AlertCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">花蓮光復救災</h1>
          <p className="text-gray-600">志工資源管理系統</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'login' ? 'bg-white text-red-600 shadow-md' : 'text-gray-600'}`}>
              志工登入
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'register' ? 'bg-white text-red-600 shadow-md' : 'text-gray-600'}`}>
              志工註冊
            </button>
          </div>

          {mode === 'login' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-red-600" />手機號碼
                </label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="0912-345-678" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-red-600" />姓名
                </label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="請輸入姓名" />
              </div>
              <button onClick={handleLogin} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2">
                <span>登入</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-red-600" />姓名 <span className="text-red-600 ml-1">*</span>
                </label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="請輸入姓名" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-red-600" />手機號碼 <span className="text-red-600 ml-1">*</span>
                </label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="0912-345-678" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />Email（選填）
                </label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="example@email.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-red-600" />可派遣人數
                </label>
                <input type="number" min="1" value={formData.member_count} onChange={(e) => setFormData({ ...formData, member_count: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />
              </div>
              <button onClick={handleRegister} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2">
                <span>完成註冊</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>花蓮縣光復鄉公所</p>
          <p className="mt-1">緊急聯絡電話: 03-8701100</p>
        </div>
      </div>
    </div>
  );
}

// 底部導航按鈕
function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 flex-1 h-full relative transition-all ${active ? 'text-red-600' : 'text-gray-600 hover:text-red-500'}`}>
      <div className="relative">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <span className="text-xs font-medium">{label}</span>
      {active && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-red-600 rounded-t-full"></div>}
    </button>
  );
}

// 首頁
function HomePage({ volunteer, setVolunteer }) {
  const assignments = mockAssignments;
  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const confirmedCount = assignments.filter(a => a.status === 'confirmed').length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;

  // V4: 志工上線
  const handleGoOnline = () => {
    setVolunteer({ ...volunteer, status: 'available' });
  };

  // V5: 志工下線
  const handleGoOffline = () => {
    setVolunteer({ ...volunteer, status: 'off' });
  };

  const statusConfig = {
    off: { label: '離線', color: 'bg-gray-500', icon: <Power /> },
    available: { label: '已上線', color: 'bg-green-500', icon: <Check /> },
    assigning: { label: '派單中', color: 'bg-yellow-500', icon: <Clock /> },
    assigned: { label: '執行中', color: 'bg-blue-500', icon: <CheckCircle /> }
  };

  return (
    <div className="space-y-6">
      {/* 志工狀態卡片 */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-red-100 text-sm mb-1">歡迎回來</p>
            <p className="text-2xl font-bold">{volunteer.name}</p>
            <p className="text-red-100 text-sm mt-1">{volunteer.phone}</p>
          </div>
          <div className={`${statusConfig[volunteer.status].color} rounded-full p-4 backdrop-blur-sm`}>
            {React.cloneElement(statusConfig[volunteer.status].icon, { className: 'w-10 h-10' })}
          </div>
        </div>

        {/* 狀態顯示與操作 */}
        <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs mb-1">當前狀態</p>
              <p className="text-xl font-bold">{statusConfig[volunteer.status].label}</p>
            </div>
            {volunteer.status === 'off' && (
              <button onClick={handleGoOnline} className="flex items-center space-x-2 bg-white text-red-600 px-5 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                <Power className="w-5 h-5" />
                <span>上線接單</span>
              </button>
            )}
            {volunteer.status === 'available' && (
              <button onClick={handleGoOffline} className="flex items-center space-x-2 bg-white bg-opacity-30 text-white px-5 py-3 rounded-xl font-bold transition-all hover:bg-opacity-40">
                <Power className="w-5 h-5" />
                <span>下線</span>
              </button>
            )}
            {(volunteer.status === 'assigning' || volunteer.status === 'assigned') && (
              <div className="bg-white bg-opacity-30 px-5 py-3 rounded-xl">
                <p className="text-sm font-bold">任務執行中，無法下線</p>
              </div>
            )}
          </div>
        </div>

        {/* 任務統計 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm text-center">
            <p className="text-red-100 text-xs mb-1">待確認</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm text-center">
            <p className="text-red-100 text-xs mb-1">進行中</p>
            <p className="text-2xl font-bold">{confirmedCount}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm text-center">
            <p className="text-red-100 text-xs mb-1">已完成</p>
            <p className="text-2xl font-bold">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* 狀態說明 */}
      {volunteer.status === 'off' && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-800 mb-1">您目前處於離線狀態</p>
              <p className="text-sm text-yellow-700">點擊「上線接單」按鈕後，管理員才能將任務派單給您。系統會在每天凌晨自動將所有志工狀態設為離線。</p>
            </div>
          </div>
        </div>
      )}

      {/* 待確認派單 */}
      {pendingCount > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">待確認派單</h3>
            <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">{pendingCount} 件</span>
          </div>
          <div className="space-y-4">
            {assignments.filter(a => a.status === 'pending').map(assignment => (
              <PendingAssignment 
                key={assignment.id} 
                assignment={assignment}
                volunteer={volunteer}
                setVolunteer={setVolunteer}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 待確認派單卡片
function PendingAssignment({ assignment, volunteer, setVolunteer }) {
  // V1: 志工確認派單
  const handleAccept = () => {
    alert('✅ 任務已接受！\n• 您的狀態已更新為「執行中」(assigned)\n• 需求狀態已更新為「進行中」(in_progress)');
    setVolunteer({ ...volunteer, status: 'assigned' });
  };

  // V2: 志工拒絕派單
  const handleReject = () => {
    const reason = prompt('請輸入拒絕原因（選填）：');
    alert('❌ 任務已拒絕\n• 您的狀態恢復為「已上線」(available)\n• 需求狀態恢復為「待支援」(pending)');
    setVolunteer({ ...volunteer, status: 'available' });
  };

  const handleCall = () => {
    window.location.href = `tel:${assignment.disaster_request?.contact_phone}`;
  };

  return (
    <div className="border-2 border-red-200 rounded-xl p-5 bg-gradient-to-r from-red-50 to-white hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">緊急</span>
        <span className="text-xs text-gray-500">{new Date(assignment.assigned_at).toLocaleString('zh-TW')}</span>
      </div>
      
      <div className="flex items-start space-x-2 mb-3">
        <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-gray-800">{assignment.disaster_request?.village} {assignment.disaster_request?.street}</p>
      </div>

      <div className="flex items-center space-x-2 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-blue-600 font-semibold">需求人聯絡資訊</p>
          <p className="text-sm font-bold text-gray-800">{assignment.disaster_request?.contact_name}</p>
        </div>
        <button onClick={handleCall} className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all shadow-md">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-bold">{assignment.disaster_request?.contact_phone}</span>
        </button>
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{assignment.disaster_request?.description}</p>
      
      <div className="flex space-x-3">
        <button onClick={handleAccept} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
          <Check className="w-5 h-5" />
          <span>接受任務</span>
        </button>
        <button onClick={handleReject} className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2">
          <XCircle className="w-5 h-5" />
          <span>拒絕</span>
        </button>
      </div>
    </div>
  );
}

// 任務頁面
function TasksPage({ volunteer, setVolunteer }) {
  const [filter, setFilter] = useState('all');
  const assignments = mockAssignments;
  const filteredTasks = filter === 'all' ? assignments : assignments.filter(t => t.status === filter);

  const statusConfig = {
    pending: { label: '待確認', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Clock /> },
    confirmed: { label: '已確認', color: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle /> },
    rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle /> },
    completed: { label: '已完成', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: <CheckCircle /> }
  };

  // V3: 志工完成任務
  const handleComplete = (assignment) => {
    alert('✅ 任務已完成！\n• 您的狀態恢復為「已上線」(available)\n• 需求狀態更新為「已完成」(completed)');
    setVolunteer({ ...volunteer, status: 'available' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">我的任務</h2>
        <p className="text-gray-600">查看所有指派給您的救援任務</p>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        <FilterChip label="全部" active={filter === 'all'} onClick={() => setFilter('all')} count={assignments.length} />
        <FilterChip label="待確認" active={filter === 'pending'} onClick={() => setFilter('pending')} count={assignments.filter(a => a.status === 'pending').length} />
        <FilterChip label="已確認" active={filter === 'confirmed'} onClick={() => setFilter('confirmed')} count={0} />
        <FilterChip label="已完成" active={filter === 'completed'} onClick={() => setFilter('completed')} count={0} />
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">目前沒有任務</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <span className={`flex items-center space-x-2 px-3 py-1 text-sm font-bold rounded-full border-2 ${statusConfig[task.status]?.color}`}>
                  {React.cloneElement(statusConfig[task.status]?.icon, { className: 'w-4 h-4' })}
                  <span>{statusConfig[task.status]?.label}</span>
                </span>
                <span className="text-xs text-gray-500">{new Date(task.assigned_at).toLocaleString('zh-TW')}</span>
              </div>
              
              <div className="flex items-start space-x-2 mb-3">
                <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-gray-800">{task.disaster_request?.village} {task.disaster_request?.street}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-bold mb-1">需求人聯絡資訊</p>
                      <p className="text-base font-bold text-gray-800">{task.disaster_request?.contact_name}</p>
                    </div>
                  </div>
                  <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg">
                    <Phone className="w-5 h-5" />
                    <span className="font-bold">{task.disaster_request?.contact_phone}</span>
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{task.disaster_request?.description}</p>
              
              {task.status === 'confirmed' && (
                <button onClick={() => handleComplete(task)} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>標記為完成</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 篩選標籤
function FilterChip({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} className={`relative px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-md ${active ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300'}`}>
      {label}
      {count > 0 && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}`}>{count}</span>
      )}
    </button>
  );
}

// 個人資料頁面
function ProfilePage({ volunteer }) {
  const statusConfig = {
    off: { label: '離線', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    available: { label: '已上線', color: 'text-green-600', bgColor: 'bg-green-100' },
    assigning: { label: '派單中', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    assigned: { label: '執行中', color: 'text-blue-600', bgColor: 'bg-blue-100' }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-2xl">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{volunteer.name}</h2>
          <div className={`mt-2 px-4 py-2 rounded-full ${statusConfig[volunteer.status].bgColor}`}>
            <span className={`text-sm font-bold ${statusConfig[volunteer.status].color}`}>
              {statusConfig[volunteer.status].label}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <Phone className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="text-xs text-gray-500">聯絡電話</p>
              <p className="text-sm font-semibold text-gray-800">{volunteer.phone}</p>
            </div>
          </div>
          {volunteer.email && (
            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-semibold text-gray-800">{volunteer.email}</p>
              </div>
            </div>
          )}
          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <Users className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="text-xs text-gray-500">可派遣人數</p>
              <p className="text-sm font-semibold text-gray-800">{volunteer.member_count} 人</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
            <p className="text-3xl font-bold text-green-600">12</p>
            <p className="text-xs text-green-700 mt-1">完成任務數</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
            <p className="text-3xl font-bold text-blue-600">36</p>
            <p className="text-xs text-blue-700 mt-1">服務時數</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 py-4 space-y-1">
        <p className="font-semibold">花蓮縣光復救災資源管理系統</p>
        <p>志工版 v2.0.0</p>
        <p className="text-xs mt-2">© 2025 花蓮縣光復鄉公所</p>
      </div>
    </div>
  );
}