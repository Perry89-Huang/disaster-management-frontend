// src/pages/VolunteerApp.jsx
import React, { useState } from 'react';
import { Bell, MapPin, Phone, Clock, CheckCircle, AlertCircle, User, LogOut, Home, Mail, Users, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client';
import { GET_ASSIGNMENTS } from '../graphql/queries';
import { CONFIRM_ASSIGNMENT, COMPLETE_ASSIGNMENT, CANCEL_ASSIGNMENT, REGISTER_VOLUNTEER } from '../graphql/mutations';

// GraphQL Queries
const VERIFY_VOLUNTEER = gql`
  query VerifyVolunteer($phone: String!, $name: String!) {
    volunteers(
      where: {
        phone: { _eq: $phone }
        name: { _eq: $name }
      }
      limit: 1
    ) {
      id
      name
      phone
      email
      member_count
      nickname
      status
    }
  }
`;

// 主應用程式元件
export default function VolunteerApp() {
  const [volunteer, setVolunteer] = useState(null);
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
        {currentPage === 'home' && <HomePage volunteer={volunteer} />}
        {currentPage === 'tasks' && <TasksPage volunteer={volunteer} />}
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
  const [loading, setLoading] = useState(false);

  const [verifyVolunteer] = useLazyQuery(VERIFY_VOLUNTEER);
  const [registerVolunteer] = useMutation(REGISTER_VOLUNTEER);

  const handleLogin = async () => {
    if (!formData.phone || !formData.name) {
      alert('請填寫手機號碼和姓名');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await verifyVolunteer({
        variables: {
          phone: formData.phone,
          name: formData.name
        }
      });

      if (error) throw error;

      if (data?.volunteers?.length > 0) {
        const volunteerData = data.volunteers[0];
        onLogin(volunteerData);
      } else {
        alert('找不到此志工資料，請確認手機號碼和姓名是否正確，或先進行註冊');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      alert('登入失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.phone || !formData.name) {
      alert('請填寫必填欄位（姓名和手機號碼）');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await registerVolunteer({
        variables: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          member_count: formData.member_count || 1
        }
      });

      if (error) throw error;

      alert('註冊成功！請使用手機號碼和姓名登入');
      setMode('login');
      setFormData({ ...formData, email: '' });
    } catch (error) {
      console.error('註冊錯誤:', error);
      if (error.message.includes('Uniqueness violation') || error.message.includes('unique')) {
        alert('此手機號碼已註冊，請直接登入');
        setMode('login');
      } else {
        alert('註冊失敗: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo 區域 */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-red-600 to-red-700 p-4 rounded-3xl shadow-2xl mb-4">
            <AlertCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">花蓮光復救災</h1>
          <p className="text-gray-600">志工資源管理系統</p>
        </div>

        {/* 認證表單卡片 */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* 切換標籤 */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'login' ? 'bg-white text-red-600 shadow-md' : 'text-gray-600 hover:text-gray-800'}`}>
              志工登入
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'register' ? 'bg-white text-red-600 shadow-md' : 'text-gray-600 hover:text-gray-800'}`}>
              志工註冊
            </button>
          </div>

          {/* 登入表單 */}
          {mode === 'login' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-red-600" />
                  手機號碼
                </label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="0912-345-678" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-red-600" />
                  姓名
                </label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="請輸入姓名" />
              </div>
              <button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>登入中...</span>
                  </>
                ) : (
                  <>
                    <span>登入</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* 註冊表單 */}
          {mode === 'register' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-red-600" />
                  姓名 / 暱稱 <span className="text-red-600 ml-1">*</span>
                </label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="請輸入姓名或暱稱" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-red-600" />
                  手機號碼 <span className="text-red-600 ml-1">*</span>
                </label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="0912-345-678" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  Email（選填，用於接收通知）
                </label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" placeholder="example@email.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-red-600" />
                  可派遣人數
                </label>
                <input type="number" min="1" value={formData.member_count} onChange={(e) => setFormData({ ...formData, member_count: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />
              </div>
              <button onClick={handleRegister} disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>註冊中...</span>
                  </>
                ) : (
                  <>
                    <span>完成註冊</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 底部資訊 */}
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
function HomePage({ volunteer }) {
  const { data, loading } = useQuery(GET_ASSIGNMENTS, { 
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network'
  });
  
  const myAssignments = data?.assignments?.filter(a => a.volunteer?.id === volunteer.id) || [];
  const pendingCount = myAssignments.filter(a => a.status === 'pending').length;
  const confirmedCount = myAssignments.filter(a => a.status === 'confirmed' || a.status === 'in_progress').length;
  const completedCount = myAssignments.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* 歡迎卡片 */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-red-100 text-sm mb-1">歡迎回來</p>
            <p className="text-2xl font-bold">{volunteer.name}</p>
            <p className="text-red-100 text-sm mt-1">{volunteer.phone}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
            <CheckCircle className="w-10 h-10" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
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

      {/* 待確認派單 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">待確認派單</h3>
          <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">{pendingCount} 件</span>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : pendingCount === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">目前沒有待確認的派單</p>
            </div>
          ) : (
            myAssignments.filter(a => a.status === 'pending').map(assignment => (
              <PendingAssignment 
                key={assignment.id} 
                assignment={assignment} 
                volunteerId={volunteer.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 待確認派單卡片
function PendingAssignment({ assignment, volunteerId }) {
  const [confirmAssignment, { loading }] = useMutation(CONFIRM_ASSIGNMENT, {
    refetchQueries: [{ query: GET_ASSIGNMENTS }]
  });

  const handleAccept = async () => {
    try {
      await confirmAssignment({ 
        variables: { 
          assignment_id: assignment.id,
          volunteer_id: volunteerId,
          request_id: assignment.disaster_request?.id
        } 
      });
      alert('✅ 任務已接受！\n• 您的狀態已更新為「已派遣」\n• 需求狀態已更新為「進行中」');
    } catch (err) {
      console.error('接受任務失敗:', err);
      alert('操作失敗: ' + err.message);
    }
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

      {/* 聯絡人資訊 */}
      <div className="flex items-center space-x-2 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-blue-600 font-semibold">需求人聯絡資訊</p>
          <p className="text-sm font-bold text-gray-800">{assignment.disaster_request?.contact_name}</p>
        </div>
        <button 
          onClick={handleCall}
          className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all shadow-md"
        >
          <Phone className="w-4 h-4" />
          <span className="text-sm font-bold">{assignment.disaster_request?.contact_phone}</span>
        </button>
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{assignment.disaster_request?.description}</p>
      
      <div className="flex space-x-3">
        <button onClick={handleAccept} disabled={loading} className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50">
          <CheckCircle className="w-5 h-5" />
          <span>{loading ? '處理中...' : '接受任務'}</span>
        </button>
        <button className="px-5 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-all">詳情</button>
      </div>
    </div>
  );
}

// 任務頁面
function TasksPage({ volunteer }) {
  const [filter, setFilter] = useState('all');
  const { data, loading } = useQuery(GET_ASSIGNMENTS);
  const myAssignments = data?.assignments?.filter(a => a.volunteer?.id === volunteer.id) || [];
  const filteredTasks = filter === 'all' ? myAssignments : myAssignments.filter(t => t.status === filter);

  const statusConfig = {
    pending: { label: '待確認', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <Clock /> },
    confirmed: { label: '已確認', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle /> },
    in_progress: { label: '進行中', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: <AlertCircle /> },
    completed: { label: '已完成', bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: <CheckCircle /> },
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">我的任務</h2>
        <p className="text-gray-600">查看所有指派給您的救援任務</p>
      </div>

      {/* 篩選器 */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <FilterChip label="全部" active={filter === 'all'} onClick={() => setFilter('all')} count={myAssignments.length} />
        <FilterChip label="待確認" active={filter === 'pending'} onClick={() => setFilter('pending')} count={myAssignments.filter(a => a.status === 'pending').length} />
        <FilterChip label="已確認" active={filter === 'confirmed'} onClick={() => setFilter('confirmed')} count={myAssignments.filter(a => a.status === 'confirmed').length} />
        <FilterChip label="已完成" active={filter === 'completed'} onClick={() => setFilter('completed')} count={myAssignments.filter(a => a.status === 'completed').length} />
      </div>

      {/* 任務列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">目前沒有任務</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <span className={`flex items-center space-x-2 px-3 py-1 text-sm font-bold rounded-full ${statusConfig[task.status]?.bgColor} ${statusConfig[task.status]?.textColor}`}>
                  {React.cloneElement(statusConfig[task.status]?.icon, { className: 'w-4 h-4' })}
                  <span>{statusConfig[task.status]?.label}</span>
                </span>
                <span className="text-xs text-gray-500">{new Date(task.assigned_at).toLocaleString('zh-TW')}</span>
              </div>
              
              <div className="flex items-start space-x-2 mb-3">
                <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-gray-800">{task.disaster_request?.village} {task.disaster_request?.street}</p>
              </div>

              {/* 需求人聯絡資訊 - 所有狀態都顯示 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-bold mb-1">需求人聯絡資訊</p>
                      <p className="text-base font-bold text-gray-800">{task.disaster_request?.contact_name || '未提供'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCall(task.disaster_request?.contact_phone)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="font-bold">{task.disaster_request?.contact_phone || '無電話'}</span>
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.disaster_request?.description}</p>
              
              {task.status === 'pending' && (
                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg">
                    接受任務
                  </button>
                  <button className="px-5 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-all">
                    詳情
                  </button>
                </div>
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
    <button onClick={onClick} className={`relative px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-md ${active ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:shadow-lg'}`}>
      {label}
      {count > 0 && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}`}>{count}</span>
      )}
    </button>
  );
}

// 個人資料頁面
function ProfilePage({ volunteer }) {
  return (
    <div className="space-y-6">
      {/* 個人資料卡片 */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-2xl">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{volunteer.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{volunteer.id}</p>
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

        <button className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-4 rounded-xl font-bold transition-all shadow-md">編輯個人資料</button>
      </div>

      {/* 版本資訊 */}
      <div className="text-center text-sm text-gray-500 py-4 space-y-1">
        <p className="font-semibold">花蓮縣光復救災資源管理系統</p>
        <p>志工版 v2.0.0</p>
        <p className="text-xs mt-2">© 2025 花蓮縣光復鄉公所</p>
      </div>
    </div>
  );
}