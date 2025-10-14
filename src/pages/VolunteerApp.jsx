import React, { useState } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { Bell, MapPin, Phone, Clock, CheckCircle, AlertCircle, User, LogOut, Home, Mail, Users, ArrowRight, Power, XCircle, Check, X, Ban } from 'lucide-react';
import {
  VOLUNTEER_GO_ONLINE,
  VOLUNTEER_GO_OFFLINE,
  CONFIRM_ASSIGNMENT,
  REJECT_ASSIGNMENT,
  COMPLETE_ASSIGNMENT,
  COMPLETE_REQUEST,
  REGISTER_VOLUNTEER
} from '../graphql/mutations';
import { 
  GET_VOLUNTEER_ASSIGNMENTS,
  VERIFY_VOLUNTEER,
  GET_VOLUNTEER_PROFILE,
  GET_DASHBOARD_STATS
} from '../graphql/queries';
import DemandPage from './DemandPage';
import { Helmet } from 'react-helmet-async';


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
    <>
      <Helmet>
        <title>服務提供者管理 | 花蓮鏟子超人媒合系統</title>
        <meta name="description" content="志工服務管理系統 - 接受任務、查看進度、完成服務" />
        <meta property="og:title" content="服務提供者管理 | 花蓮鏟子超人媒合系統" />
      </Helmet>

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* 頂部導航 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <img
                src="/superman/images/superman-icon.png"
                alt="鏟子超人"
                className="w-8 h-8 md:w-12 md:h-12 object-contain"
              />

            </div>
            <div>
              <h1 className="font-bold text-lg">鏟子超人 App</h1>
              <p className="text-xs text-blue-100">{volunteer.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
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
        {currentPage === 'demands' && <DemandPage volunteer={volunteer} setVolunteer={setVolunteer} />}  
        {currentPage === 'tasks' && <TasksPage volunteer={volunteer} setVolunteer={setVolunteer} />}
        {currentPage === 'profile' && <ProfilePage volunteer={volunteer} />}
      </div>

      {/* 底部導航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto flex justify-around items-center h-16">
          <NavButton icon={<Home />} label="首頁" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
          <NavButton icon={<AlertCircle />}  label="需求"  active={currentPage === 'demands'} onClick={() => setCurrentPage('demands')} />
          <NavButton icon={<CheckCircle />} label="任務" active={currentPage === 'tasks'} onClick={() => setCurrentPage('tasks')} />
          <NavButton icon={<User />} label="我的" active={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
        </div>
      </div>
    </div>
    </>
  );
}

// 認證畫面（登入/註冊）
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  
  // 從 localStorage 讀取保存的登入資訊
  const getSavedLoginInfo = () => {
    try {
      const saved = localStorage.getItem('volunteerLoginInfo');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('讀取保存的登入資訊失敗:', error);
    }
    return { phone: '', name: '' };
  };

  const [formData, setFormData] = useState({
    phone: getSavedLoginInfo().phone || '',
    name: getSavedLoginInfo().name || '',
    email: '',
    member_count: 1
  });

  // 保存登入資訊到 localStorage
  const saveLoginInfo = (phone, name) => {
    try {
      localStorage.setItem('volunteerLoginInfo', JSON.stringify({ phone, name }));
    } catch (error) {
      console.error('保存登入資訊失敗:', error);
    }
  };

  const [verifyVolunteer, { loading: verifying }] = useLazyQuery(VERIFY_VOLUNTEER, {
    onCompleted: (data) => {
      if (data.volunteers.length > 0) {
        const volunteer = data.volunteers[0];
        // 保存成功登入的資訊
        saveLoginInfo(formData.phone, formData.name);
        alert(`✅ 登入成功！\n歡迎回來，${volunteer.name}`);
        onLogin(volunteer);
      } else {
        alert('❌ 登入失敗\n\n查無此志工資料，請確認：\n• 手機號碼是否正確\n• 姓名是否正確\n\n如果您是新志工，請點選「志工註冊」。');
      }
    },
    onError: (error) => alert('登入失敗: ' + error.message)
  });

  const [registerVolunteer, { loading: registering }] = useMutation(
    REGISTER_VOLUNTEER,
    {
      onCompleted: (data) => {
        const newVolunteer = data.insert_volunteers_one;
        // 保存註冊成功的資訊
        saveLoginInfo(formData.phone, formData.name);
        alert(`✅ 註冊成功！\n歡迎加入，${newVolunteer.name}\n\n您的資料：\n• 姓名：${newVolunteer.name}\n• 電話：${newVolunteer.phone}\n• 可派遣人數：${newVolunteer.member_count} 人\n\n現在可以開始接受派單了！`);
        onLogin(newVolunteer);
      },
      onError: (error) => {
      console.error('註冊失敗 error:', error);
      let userFriendlyMessage;
      
      // 手機號碼重複
      if (error.message.includes('volunteers_phone_key') || error.message.includes('duplicate') || error.message.includes('Uniqueness violation')) {
        userFriendlyMessage = '❌ 註冊失敗\n\n此手機號碼已被註冊！\n\n如果這是您的帳號，請使用「志工登入」功能。\n如有問題，請聯絡管理員。';
      }
      // 必填欄位缺失
      else if (error.message.includes('null') || error.message.includes('required')) {
        userFriendlyMessage = '❌ 註冊失敗\n\n請確認所有必填欄位都已填寫。';
      }
      // 其他錯誤
      else {
        userFriendlyMessage = `❌ 註冊失敗\n\n${error.message}\n\n請稍後再試，或聯絡管理員。`;
      }
      
        alert(userFriendlyMessage);
      }
    }
  );

  const validatePhoneNumber = (phone) => {
    // 移除所有非數字字符
    const cleanPhone = phone.replace(/\D/g, '');
    // 檢查是否為10位數字且開頭為09
    return /^09\d{8}$/.test(cleanPhone);
  };

  const handleLogin = () => {
    if (!formData.phone || !formData.name) {
      alert('請填寫手機號碼和姓名');
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      alert('請輸入正確的手機號碼格式：0988123456');
      return;
    }

    verifyVolunteer({
      variables: {
        phone: formData.phone,
        name: formData.name
      }
    });
  };

  const handleRegister = () => {
    if (!formData.phone || !formData.name) {
      alert('請填寫必填欄位（姓名和手機號碼）');
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      alert('請輸入正確的手機號碼格式：0988123456');
      return;
    }

    registerVolunteer({
      variables: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        member_count: formData.member_count
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-3xl shadow-2xl mb-4">
                  <img
                    src="/superman/images/shovel2.png"
                    alt="鏟子超人"
                    className="w-32 h-32 md:w-48 md:h-48 object-contain"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />

          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">鏟子超人 App</h1>
          <p className="text-gray-600">志工找工作</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button 
              onClick={() => setMode('login')} 
              disabled={verifying || registering}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'login' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600'}`}
            >
              志工登入
            </button>
            <button 
              onClick={() => setMode('register')} 
              disabled={verifying || registering}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'register' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600'}`}
            >
              志工註冊
            </button>
          </div>

          {mode === 'login' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-600" />手機號碼
                </label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => {
                    // 只允許數字
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: value });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                  placeholder="0988123456"
                  pattern="[0-9]*"
                  maxLength="10"
                  disabled={verifying}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-600" />姓名 或 暱稱
                </label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                  placeholder="請輸入 姓名 或 暱稱"
                  disabled={verifying}
                />
              </div>
              <button 
                onClick={handleLogin} 
                disabled={verifying}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{verifying ? '登入中...' : '登入'}</span>
                {!verifying && <ArrowRight className="w-5 h-5" />}
              </button>
              
              {/* 提示信息 */}
              {formData.phone && formData.name && (
                <div className="text-center text-xs text-gray-500 -mt-2">
                  <p>✓ 您的登入資訊已保存，下次會自動填入</p>
                </div>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-600" />手機號碼 <span className="text-blue-600 ml-1">*</span>
                </label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => {
                    // 只允許數字
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: value });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                  placeholder="0988123456"
                  pattern="[0-9]*"
                  maxLength="10"
                  disabled={registering}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-600" />姓名 或 暱稱 <span className="text-blue-600 ml-1">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                  placeholder="請輸入姓名 或 暱稱"
                  disabled={registering}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />可派遣人數
                </label>
                <input 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.member_count} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    // 允許暫時為空字串，方便編輯
                    setFormData({ ...formData, member_count: value === '' ? '' : parseInt(value) || 1 });
                  }}
                  onBlur={() => {
                    // 失去焦點時，如果為空或小於1，設為1
                    if (formData.member_count === '' || formData.member_count < 1) {
                      setFormData({ ...formData, member_count: 1 });
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="1"
                  disabled={registering}
                />
              </div>
              <button 
                onClick={handleRegister} 
                disabled={registering}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{registering ? '註冊中...' : '完成註冊'}</span>
                {!registering && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>美魔力 - 發現台灣最美的風景</p>
        </div>
      </div>
    </div>
  );
}

// 底部導航按鈕
function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 flex-1 h-full relative transition-all ${active ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}>
      <div className="relative">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <span className="text-xs font-medium">{label}</span>
      {active && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></div>}
    </button>
  );
}

// 首頁
function HomePage({ volunteer, setVolunteer }) {
  // 查詢志工的派單
  const { data: assignmentsData, loading: loadingAssignments } = useQuery(
    GET_VOLUNTEER_ASSIGNMENTS,
    {
      variables: { volunteer_id: volunteer.id },
      pollInterval: 5000
    }
  );

  // 查詢系統統計資料
  const { data: statsData, loading: loadingStats } = useQuery(
    GET_DASHBOARD_STATS
  );

  const assignments = assignmentsData?.assignments || [];
  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const confirmedCount = assignments.filter(a => a.status === 'confirmed').length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;

  // 計算系統統計
  const totalVolunteers = (
    (statsData?.available_volunteers?.aggregate?.count || 0) +
    (statsData?.assigned_volunteers?.aggregate?.count || 0) +
    (statsData?.offline_volunteers?.aggregate?.count || 0)
  );

  const totalRequests = (
    (statsData?.pending_requests?.aggregate?.count || 0) +
    (statsData?.in_progress_requests?.aggregate?.count || 0)
  );

  // V4: 志工上線 - 使用 GraphQL mutation
  const [goOnline, { loading: goingOnline }] = useMutation(VOLUNTEER_GO_ONLINE, {
    onCompleted: (data) => {
      setVolunteer(prev => ({ ...prev, status: 'available' }));
      alert('✅ 已成功上線！\n現在可以接收派單通知');
    },
    onError: (error) => {
      console.error('上線失敗:', error);
      alert('上線失敗: ' + error.message);
    }
  });

  // V5: 志工下線 - 使用 GraphQL mutation
  const [goOffline, { loading: goingOffline }] = useMutation(VOLUNTEER_GO_OFFLINE, {
    onCompleted: (data) => {
      setVolunteer(prev => ({ ...prev, status: 'off' }));
      alert('✅ 已下線\n您將不會收到新的派單');
    },
    onError: (error) => {
      console.error('下線失敗:', error);
      alert('下線失敗: ' + error.message);
    }
  });

  const handleGoOnline = () => {
    goOnline({ variables: { id: volunteer.id } });
  };

  const handleGoOffline = () => {
    goOffline({ variables: { id: volunteer.id } });
  };

  const statusConfig = {
    off: { label: '離線', color: 'bg-gray-500', icon: <Power /> },
    available: { label: '待工', color: 'bg-green-500', icon: <Check /> },
    assigning: { label: '派單中', color: 'bg-yellow-500', icon: <Clock /> },
    assigned: { label: '執行中', color: 'bg-blue-500', icon: <CheckCircle /> }
  };

  return (
    <div className="space-y-6">
      {/* 志工狀態卡片 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">歡迎回來</p>
            <p className="text-2xl font-bold">{volunteer.name}</p>
            <p className="text-blue-100 text-sm mt-1">{volunteer.phone}</p>
          </div>
        </div>

        {/* 狀態顯示與操作 */}
        <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs mb-1">當前狀態</p>
              <p className="text-xl font-bold">{statusConfig[volunteer.status].label}</p>
            </div>
          </div>
        </div>

        {/* 任務統計 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm text-center">
            <p className="text-blue-100 text-xs mb-1">進行中</p>
            <p className="text-2xl font-bold">{loadingAssignments ? '...' : confirmedCount}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm text-center">
            <p className="text-blue-100 text-xs mb-1">已完成</p>
            <p className="text-2xl font-bold">{loadingAssignments ? '...' : completedCount}</p>
          </div>
        </div>

        {/* 系統統計 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm text-center">
            <p className="text-blue-100 text-xs mb-1">志工總人數</p>
            <p className="text-2xl font-bold">{loadingStats ? '...' : totalVolunteers}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm text-center">
            <p className="text-blue-100 text-xs mb-1">需求總數</p>
            <p className="text-2xl font-bold">{loadingStats ? '...' : totalRequests}</p>
          </div>
        </div>
      </div>

      {/* 進行中的任務 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-600">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          進行中的任務
        </h2>
        <div className="space-y-4">
          {assignments.filter(a => a.status === 'confirmed').map(assignment => (
            <ConfirmedTaskCard key={assignment.id} assignment={assignment} volunteer={volunteer} setVolunteer={setVolunteer} />
          ))}
          {assignments.filter(a => a.status === 'confirmed').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>目前沒有進行中的任務</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 待確認的派單卡片
function PendingAssignmentCard({ assignment, volunteer, setVolunteer }) {
  // V1: 志工確認派單
  const [confirmAssignment, { loading: confirming }] = useMutation(CONFIRM_ASSIGNMENT, {
    onCompleted: (data) => {
      alert('✅ 任務已確認\n• 您的狀態變更為「執行中」(assigned)\n• 請前往現場執行任務');
      // 使用函數式更新確保使用最新的 volunteer 狀態
      const updatedStatus = data?.update_volunteers_by_pk?.status || 'assigned';
      setVolunteer(prev => ({ ...prev, status: updatedStatus }));
    },
    onError: (error) => {
      console.error('確認派單失敗:', error);
      alert('確認派單失敗: ' + error.message);
    },
    refetchQueries: [
      { query: GET_VOLUNTEER_ASSIGNMENTS, variables: { volunteer_id: volunteer.id } },
      { query: GET_VOLUNTEER_PROFILE, variables: { volunteer_id: volunteer.id } }
    ]
  });

  // V2: 志工拒絕派單
  const [rejectAssignment, { loading: rejecting }] = useMutation(REJECT_ASSIGNMENT, {
    onCompleted: (data) => {
      alert('❌ 任務已拒絕\n• 您的狀態恢復為「待工」\n• 可繼續服務新的需求');
      const updatedStatus = data?.update_volunteers_by_pk?.status || 'available';
      setVolunteer(prev => ({ ...prev, status: updatedStatus }));
    },
    onError: (error) => {
      console.error('拒絕派單失敗:', error);
      alert('拒絕派單失敗: ' + error.message);
    },
    refetchQueries: [
      { query: GET_VOLUNTEER_ASSIGNMENTS, variables: { volunteer_id: volunteer.id } },
      { query: GET_VOLUNTEER_PROFILE, variables: { volunteer_id: volunteer.id } }
    ]
  });

  // ✅ 修正：移除 request_id 參數
  const handleAccept = () => {
    confirmAssignment({
      variables: {
        assignment_id: assignment.id,
        volunteer_id: volunteer.id
      }
    });
  };

  // ✅ 修正：移除 request_id 參數
  const handleReject = () => {
    const reason = prompt('請輸入拒絕原因（選填）：');
    rejectAssignment({
      variables: {
        assignment_id: assignment.id,
        volunteer_id: volunteer.id,
        rejection_reason: reason || ''
      }
    });
  };

  const handleCall = () => {
    window.location.href = `tel:${assignment.disaster_request?.contact_phone}`;
  };

  return (
    <div className="border-2 border-blue-200 rounded-xl p-5 bg-gradient-to-r from-blue-50 to-white hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">緊急</span>
        <span className="text-xs text-gray-500">{new Date(assignment.assigned_at).toLocaleString('zh-TW', { hour12: false })}</span>
      </div>
      
      <div className="flex items-start space-x-2 mb-3">
        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
        </button>
      </div>

      {assignment.disaster_request?.notes && (
        <div className="flex items-start space-x-2 mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-yellow-600 font-semibold">備註</p>
            <p className="text-sm text-gray-800">{assignment.disaster_request.notes}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{assignment.disaster_request?.description}</p>
        
        <div className="flex space-x-3">
          <button onClick={handleAccept} disabled={confirming || rejecting} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            <Check className="w-5 h-5" />
            <span>{confirming ? '處理中...' : '接受任務'}</span>
          </button>
          <button onClick={handleReject} disabled={confirming || rejecting} className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <XCircle className="w-5 h-5" />
            <span>{rejecting ? '處理中...' : '拒絕'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 進行中的任務卡片
function ConfirmedTaskCard({ assignment, volunteer, setVolunteer }) {
  // V3: 志工完成任務
  const [completeAssignment, { loading: completing }] = useMutation(COMPLETE_ASSIGNMENT, {
    onCompleted: (data) => {
      // 檢查是否需要將需求狀態更新為 completed
      const request = data?.update_assignments_by_pk?.disaster_request;
      if (request) {
        // 計算已派遣的總人數
        const assignedCount = request.assignments?.reduce((sum, a) => {
          return sum + (a.volunteer?.member_count || 1);
        }, 0) || 0;
        
        // 檢查是否所有派單都已完成
        const allCompleted = request.assignments?.every(a => 
          a.status === 'completed' || a.status === 'rejected'
        );
        
        // 檢查人數是否已滿
        const isFull = assignedCount >= request.required_volunteers;
        
        console.log('需求完成檢查:', {
          requestId: request.id,
          assignedCount,
          requiredVolunteers: request.required_volunteers,
          isFull,
          allCompleted,
          shouldComplete: isFull && allCompleted
        });
        
        // 只有當人數已滿且所有派單都完成時，才更新需求狀態
        if (isFull && allCompleted) {
          completeRequest({
            variables: { request_id: request.id }
          });
        }
      }
      
      alert('🎉 任務已完成！\n感謝您的協助\n• 您的狀態恢復為「待工」\n• 可繼續服務新的需求');
      const updatedStatus = data?.update_volunteers_by_pk?.status || 'available';
      setVolunteer(prev => ({ ...prev, status: updatedStatus }));
    },
    onError: (error) => {
      console.error('完成任務失敗:', error);
      alert('完成任務失敗: ' + error.message);
    },
    refetchQueries: [
      { query: GET_VOLUNTEER_ASSIGNMENTS, variables: { volunteer_id: volunteer.id } },
      { query: GET_VOLUNTEER_PROFILE, variables: { volunteer_id: volunteer.id } }
    ]
  });

  // 單獨的 mutation 用於更新需求狀態
  const [completeRequest] = useMutation(COMPLETE_REQUEST, {
    onCompleted: () => {
      console.log('需求已標記為完成');
    },
    onError: (error) => {
      console.error('更新需求狀態失敗:', error);
    }
  });

  const handleComplete = () => {
    if (window.confirm('確定要標記此任務為完成嗎？')) {
      completeAssignment({
        variables: {
          assignment_id: assignment.id,
          volunteer_id: volunteer.id
        }
      });
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${assignment.disaster_request?.contact_phone}`;
  };

  return (
    <div className="border-2 border-green-200 rounded-xl p-5 bg-gradient-to-r from-green-50 to-white hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold">執行中</span>
        <span className="text-xs text-gray-500">
          {new Date(assignment.confirmed_at || assignment.assigned_at).toLocaleString('zh-TW', { hour12: false })}
        </span>
      </div>
      
      <div className="flex items-start space-x-2 mb-3">
        <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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
      <div className="flex items-center space-x-2 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex-1">
          <p className="text-xs text-yellow-600 font-semibold">需求描述</p>
          <p className="text-sm text-gray-700 mb-4">{assignment.disaster_request?.description}</p>
        </div>
      </div>

      {assignment.disaster_request?.notes && (
        <div className="flex items-start space-x-2 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex-1">
            <p className="text-xs text-yellow-600 font-semibold">備註</p>
            <p className="text-sm text-gray-800">{assignment.disaster_request.notes}</p>
          </div>
        </div>
      )}

      
      
      <button onClick={handleComplete} disabled={completing} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
        <CheckCircle className="w-5 h-5" />
        <span>{completing ? '處理中...' : '標記為完成'}</span>
      </button>
    </div>
  );
}

// 任務頁面
function TasksPage({ volunteer, setVolunteer }) {
  const [filter, setFilter] = useState('all');
  
  const { data: assignmentsData, loading: loadingAssignments } = useQuery(
    GET_VOLUNTEER_ASSIGNMENTS,
    {
      variables: { volunteer_id: volunteer.id },
      pollInterval: 5000
    }
  );

  const assignments = assignmentsData?.assignments || [];
  const filteredTasks = filter === 'all' ? 
    assignments : 
    assignments.filter(a => a.status === filter);

  const counts = {
    all: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    confirmed: assignments.filter(a => a.status === 'confirmed').length,
    completed: assignments.filter(a => a.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">我的任務</h2>
        
        {/* 篩選標籤 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <FilterChip label="全部" active={filter === 'all'} onClick={() => setFilter('all')} count={counts.all} />
          <FilterChip label="待確認" active={filter === 'pending'} onClick={() => setFilter('pending')} count={counts.pending} />
          <FilterChip label="進行中" active={filter === 'confirmed'} onClick={() => setFilter('confirmed')} count={counts.confirmed} />
          <FilterChip label="已完成" active={filter === 'completed'} onClick={() => setFilter('completed')} count={counts.completed} />
        </div>

        {/* 任務列表 */}
        {loadingAssignments ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">載入中...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>目前沒有{filter === 'all' ? '' : filter === 'pending' ? '待確認的' : filter === 'confirmed' ? '進行中的' : '已完成的'}任務</p>
          </div>
        ) : (
          filteredTasks.map(assignment => (
            <div key={assignment.id} className="mb-4">
              {assignment.status === 'pending' && <PendingAssignmentCard assignment={assignment} volunteer={volunteer} setVolunteer={setVolunteer} />}
              {assignment.status === 'confirmed' && <ConfirmedTaskCard assignment={assignment} volunteer={volunteer} setVolunteer={setVolunteer} />}
              {assignment.status === 'completed' && (
                <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <span className="bg-gray-600 text-white text-xs px-3 py-1 rounded-full font-bold">已完成</span>
                    <span className="text-xs text-gray-500">{new Date(assignment.completed_at).toLocaleString('zh-TW', { hour12: false })}</span>
                  </div>
                  <div className="flex items-start space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-gray-800">{assignment.disaster_request?.village} {assignment.disaster_request?.street}</p>
                  </div>
                  <p className="text-sm text-gray-600">{assignment.disaster_request?.description}</p>
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
    <button onClick={onClick} className={`relative px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-md ${active ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'}`}>
      {label}
      {count > 0 && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{count}</span>
      )}
    </button>
  );
}

// 個人資料頁面
function ProfilePage({ volunteer }) {
  const statusConfig = {
    off: { label: '離線', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    available: { label: '待工', color: 'text-green-600', bgColor: 'bg-green-100' },
    assigning: { label: '派單中', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    assigned: { label: '執行中', color: 'text-blue-600', bgColor: 'bg-blue-100' }
  };

  // 查詢完整的志工資料
  const { data: profileData } = useQuery(
    GET_VOLUNTEER_PROFILE,
    {
      variables: { id: volunteer.id },
      pollInterval: 10000
    }
  );

  const profile = profileData?.volunteers_by_pk || volunteer;
  const completedTasks = profile.assignments?.filter(a => a.status === 'completed').length || 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-2xl">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
          <div className={`mt-2 px-4 py-2 rounded-full ${statusConfig[profile.status].bgColor}`}>
            <span className={`text-sm font-bold ${statusConfig[profile.status].color}`}>
              {statusConfig[profile.status].label}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <Phone className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="text-xs text-gray-500">聯絡電話</p>
              <p className="text-sm font-semibold text-gray-800">{profile.phone}</p>
            </div>
          </div>
          {profile.email && (
            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-semibold text-gray-800">{profile.email}</p>
              </div>
            </div>
          )}
          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <Users className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="text-xs text-gray-500">可派遣人數</p>
              <p className="text-sm font-semibold text-gray-800">{profile.member_count} 人</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
            <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
            <p className="text-xs text-green-700 mt-1">完成任務數</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 py-4 space-y-1">
        <p className="font-semibold">花蓮縣光復救災資源管理系統</p>
        <p>志工版 v1.0.0</p>
        <p className="text-xs mt-2">© 2025 美魔力 - 發現台灣最美的風景</p>
      </div>
    </div>
  );
}