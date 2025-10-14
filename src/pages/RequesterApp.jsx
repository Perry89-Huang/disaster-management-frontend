import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  Building2, Phone, User, FileText, CheckCircle, AlertCircle, 
  Clock, LogIn, UserPlus, ArrowRight, Plus, Edit, Trash2, X,
  LayoutDashboard, List, UserCircle, LogOut, MapPin, AlertTriangle,
  RefreshCw, Eye, Check, XCircle, Search, Users
} from 'lucide-react';

// ==================== GraphQL 定義 ====================

// 需求者註冊
const REGISTER_REQUESTER = gql`
  mutation RegisterRequester(
    $name: String!
    $phone: String!
    $organization: String
    $notes: String
  ) {
    insert_requesters_one(
      object: {
        name: $name
        phone: $phone
        organization: $organization
        notes: $notes
        status: "pending"
      }
    ) {
      id
      name
      status
    }
  }
`;

// 更新需求者資料
const UPDATE_REQUESTER = gql`
  mutation UpdateRequester(
    $id: uuid!
    $name: String
    $phone: String
    $organization: String
    $notes: String
  ) {
    update_requesters_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        phone: $phone
        organization: $organization
        notes: $notes
      }
    ) {
      id
      name
      phone
      organization
      notes
      status
    }
  }
`;

// 需求者登入查詢
const LOGIN_REQUESTER = gql`
  query LoginRequester($phone: String!, $name: String!) {
    requesters(
      where: {
        phone: { _eq: $phone }
        name: { _eq: $name }
      }
      limit: 1
    ) {
      id
      name
      phone
      organization
      status
      created_at
      notes
    }
  }
`;

// 查詢需求者的完整資料（包含其建立的需求）
const GET_REQUESTER_WITH_REQUESTS = gql`
  query GetRequesterWithRequests($id: uuid!) {
    requesters_by_pk(id: $id) {
      id
      name
      phone
      organization
      notes
      status
      created_at
      disaster_requests(order_by: { created_at: desc }) {
        id
        request_type
        priority
        village
        street
        contact_name
        contact_phone
        description
        required_volunteers
        status
        created_at
        notes
        assignments(where: { status: { _in: ["pending", "confirmed", "completed"] } }) {
          id
          status
          volunteer {
            id
            name
            member_count
          }
        }
      }
    }
  }
`;

// 建立需求
const CREATE_REQUEST = gql`
  mutation RequesterCreateRequest(
    $requester_id: uuid!
    $request_type: String!
    $priority: String!
    $village: String!
    $street: String!
    $contact_name: String!
    $contact_phone: String!
    $description: String!
    $required_volunteers: Int
    $notes: String
  ) {
    insert_disaster_requests_one(
      object: {
        requester_id: $requester_id
        request_type: $request_type
        priority: $priority
        village: $village
        street: $street
        contact_name: $contact_name
        contact_phone: $contact_phone
        description: $description
        required_volunteers: $required_volunteers
        status: "pending"
        notes: $notes
        created_by: "requester"
      }
    ) {
      id
      description
      status
    }
  }
`;

// 更新需求
const UPDATE_REQUEST = gql`
  mutation UpdateRequest(
    $id: uuid!
    $request_type: String
    $priority: String
    $village: String
    $street: String
    $contact_name: String
    $contact_phone: String
    $description: String
    $required_volunteers: Int
    $notes: String
  ) {
    update_disaster_requests_by_pk(
      pk_columns: { id: $id }
      _set: {
        request_type: $request_type
        priority: $priority
        village: $village
        street: $street
        contact_name: $contact_name
        contact_phone: $contact_phone
        description: $description
        required_volunteers: $required_volunteers
        notes: $notes
      }
    ) {
      id
      description
    }
  }
`;

// 刪除需求
const DELETE_REQUEST = gql`
  mutation DeleteRequest($id: uuid!) {
    delete_disaster_requests_by_pk(id: $id) {
      id
      description
    }
  }
`;

// 查詢志工統計資料
const GET_VOLUNTEER_STATS = gql`
  query GetVolunteerStats {
    # 志工總人數
    total_volunteers: volunteers_aggregate {
      aggregate {
        count
      }
    }
    
    # 今天註冊的志工
    today_volunteers: volunteers_aggregate(
      where: { 
        created_at: { _gte: "{{TODAY_START}}" }
      }
    ) {
      aggregate {
        count
      }
    }
    
    # 昨天註冊的志工
    yesterday_volunteers: volunteers_aggregate(
      where: { 
        created_at: { _gte: "{{YESTERDAY_START}}", _lt: "{{TODAY_START}}" }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

// ==================== 主元件 ====================

export default function RequesterApp() {
  const [requester, setRequester] = useState(() => {
    const saved = localStorage.getItem('requester');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (requesterData) => {
    setRequester(requesterData);
    localStorage.setItem('requester', JSON.stringify(requesterData));
  };

  const handleLogout = () => {
    setRequester(null);
    localStorage.removeItem('requester');
  };

  if (!requester) {
    return <RequesterAuth onLogin={handleLogin} />;
  }

  return <RequesterDashboard requester={requester} onLogout={handleLogout} />;
}

// 電話號碼格式驗證
const validatePhoneNumber = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^09\d{8}$/.test(cleanPhone);
};

// 格式化電話號碼
const formatPhoneNumber = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone;
};

// ==================== 登入/註冊頁面 ====================

function RequesterAuth({ onLogin }) {
  const [authMode, setAuthMode] = useState('login');
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    organization: '',
    notes: ''
  });

  const [registerRequester, { loading: registering }] = useMutation(REGISTER_REQUESTER, {
    onCompleted: () => {
      alert('✅ 註冊申請已送出！\n請等待管理員審核\n審核通過後即可登入建立需求');
      setAuthMode('login');
      setFormData({ name: '', phone: '', organization: '', notes: '' });
    },
    onError: (error) => {
      if (error.message.includes('unique')) {
        alert('❌ 此電話號碼已被註冊');
      } else {
        alert('❌ 註冊失敗：' + error.message);
      }
    }
  });

  const [loggingIn, setLoggingIn] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const { refetch: loginRequester } = useQuery(LOGIN_REQUESTER, {
    variables: { phone: formData.phone, name: formData.name },
    skip: true
  });

  React.useEffect(() => {
    if (loginData) {
      if (loginData.requesters && loginData.requesters.length > 0) {
        const requesterData = loginData.requesters[0];
        onLogin(requesterData);
        
        if (requesterData.status === 'approved') {
          alert('✅ 登入成功！');
        } else if (requesterData.status === 'pending') {
          alert('⚠️ 登入成功\n您的帳號正在等待審核中\n在審核通過前，部分功能將受到限制');
        } else if (requesterData.status === 'rejected') {
          alert('⚠️ 登入成功\n很抱歉，您的帳號申請已被拒絕\n如有疑問請聯繫管理員');
        }
      } else {
        alert('❌ 登入失敗\n電話或姓名錯誤');
      }
      setLoggingIn(false);
      setLoginData(null);
    }
    if (loginError) {
      alert('❌ 登入失敗：' + loginError.message);
      setLoggingIn(false);
      setLoginError(null);
    }
  }, [loginData, loginError, onLogin]);

  const handleLogin = async () => {
    if (!formData.phone || !formData.name) {
      alert('請填寫電話和姓名');
      return;
    }
    if (!validatePhoneNumber(formData.phone)) {
      setPhoneError('請輸入正確的手機號碼格式：0988123456');
      return;
    }
    setLoggingIn(true);
    try {
      const { data } = await loginRequester({ 
        variables: { 
          phone: formData.phone, 
          name: formData.name 
        },
        fetchPolicy: 'network-only'
      });
      setLoginData(data);
    } catch (error) {
      setLoginError(error);
      setLoggingIn(false);
    }
  };

  const handleRegister = () => {
    if (!formData.name || !formData.phone) {
      alert('請填寫姓名和電話');
      return;
    }
    if (!validatePhoneNumber(formData.phone)) {
      setPhoneError('請輸入正確的手機號碼格式：0988123456');
      return;
    }
    registerRequester({ variables: formData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo 與標題 */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-3xl shadow-2xl p-6 inline-block mb-4">
            <Building2 className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">需求管理 App</h1>
          <p className="text-green-100 text-lg">提供需要協助的需求</p>
        </div>

        {/* 登入/註冊表單 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tab 切換 */}
          <div className="flex bg-gray-100 p-2">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-white text-green-600 shadow-lg'
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
                  ? 'bg-white text-green-600 shadow-lg'
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
                    <Phone className="w-4 h-4 mr-2 text-green-600" />電話號碼
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const newPhone = formatPhoneNumber(e.target.value);
                      setFormData({ ...formData, phone: newPhone });
                      setPhoneError(validatePhoneNumber(newPhone) ? '' : '請輸入正確的手機號碼格式：0988123456');
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                      phoneError ? 'border-green-500' : 'border-gray-200'
                    }`}
                    placeholder="0988123456"
                    disabled={loggingIn}
                    maxLength="10"
                  />
                  {phoneError && (
                    <div className="mt-1 text-sm text-green-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {phoneError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-green-600" />姓名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="請輸入姓名"
                    disabled={loggingIn}
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loggingIn}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loggingIn ? '登入中...' : '登入'}</span>
                  {!loggingIn && <ArrowRight className="w-5 h-5" />}
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
                    <Phone className="w-4 h-4 mr-2 text-green-600" />電話號碼 <span className="text-green-600 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const newPhone = formatPhoneNumber(e.target.value);
                      setFormData({ ...formData, phone: newPhone });
                      setPhoneError(validatePhoneNumber(newPhone) ? '' : '請輸入正確的手機號碼格式：0988123456');
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                      phoneError ? 'border-green-500' : 'border-gray-200'
                    }`}
                    placeholder="0988123456"
                    disabled={registering}
                    maxLength="10"
                  />
                  {phoneError && (
                    <div className="mt-1 text-sm text-green-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {phoneError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-green-600" />姓名 <span className="text-green-600 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="請輸入姓名"
                    disabled={registering}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-gray-500" /> 組織 & 職務 （審核重點，請務必填寫清楚）
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="ex: 某個line群組的管理員、鄉公所職員、受災戶..."
                    disabled={registering}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />備註（選填）
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                    rows="3"
                    placeholder="其他說明... （例如：我住在XX村，常看到XX狀況）"
                    disabled={registering}
                  />
                </div>

                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{registering ? '送出申請中...' : '送出申請'}</span>
                  {!registering && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-white">
          <p>美魔力 - 發現台灣最美的風景</p>
        </div>
      </div>
    </div>
  );
}

// ==================== 需求者儀表板 ====================

function RequesterDashboard({ requester, onLogout }) {
  const [currentPage, setCurrentPage] = useState(requester.status === 'approved' ? 'dashboard' : 'profile');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

  // 計算今天和昨天的日期
  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
  };

  const getYesterdayStart = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday.toISOString();
  };

  // 替換查詢中的日期佔位符
  const queryWithDates = GET_VOLUNTEER_STATS.loc.source.body
    .replace(/{{TODAY_START}}/g, getTodayStart())
    .replace(/{{YESTERDAY_START}}/g, getYesterdayStart());

  const VOLUNTEER_STATS_QUERY = gql`${queryWithDates}`;

  const { data: requesterData, loading, error, refetch } = useQuery(
    GET_REQUESTER_WITH_REQUESTS,
    {
      variables: { id: requester.id },
      pollInterval: 10000
    }
  );

  // 查詢志工統計資料
  const { data: volunteerStatsData, error: volunteerStatsError } = useQuery(
    VOLUNTEER_STATS_QUERY,
    {
      pollInterval: 10000
    }
  );

  // 調試：打印志工統計數據
  useEffect(() => {
    if (volunteerStatsData) {
      console.log('志工統計數據:', volunteerStatsData);
      console.log('今天開始時間:', getTodayStart());
      console.log('昨天開始時間:', getYesterdayStart());
    }
    if (volunteerStatsError) {
      console.error('志工統計查詢錯誤:', volunteerStatsError);
    }
  }, [volunteerStatsData, volunteerStatsError]);

  const requests = requesterData?.requesters_by_pk?.disaster_requests || [];
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  // 志工統計
  const volunteerStats = {
    totalVolunteers: volunteerStatsData?.total_volunteers?.aggregate?.count || 0,
    todayVolunteers: volunteerStatsData?.today_volunteers?.aggregate?.count || 0,
    yesterdayVolunteers: volunteerStatsData?.yesterday_volunteers?.aggregate?.count || 0
  };

  const renderStatusBanner = () => {
    if (requester.status === 'pending') {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-6">
          <div className="flex items-start">
            <Clock className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-1">帳號審核中</h3>
              <p className="text-yellow-700">您的帳號正在等待管理員審核，審核通過後即可建立救災需求</p>
            </div>
          </div>
        </div>
      );
    }
    if (requester.status === 'rejected') {
      return (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-6">
          <div className="flex items-start">
            <XCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-1">帳號申請已被拒絕</h3>
              <p className="text-green-700">很抱歉，您的帳號申請未通過審核。如有疑問請聯繫管理員。</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const navItems = [
    ...(requester.status === 'approved' ? [
      { id: 'dashboard', label: '儀表板', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'requests', label: '我的需求', icon: <List className="w-5 h-5" /> },
    ] : []),
    { id: 'profile', label: '個人資料', icon: <UserCircle className="w-5 h-5" /> }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <p className="text-green-700">載入失敗: {error.message}</p>
          <button onClick={() => refetch()} className="mt-4 text-green-600 hover:text-green-800 font-semibold">
            重新載入
          </button>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        if (requester.status !== 'approved') {
          setCurrentPage('profile');
          return null;
        }
        return (
          <>
            {renderStatusBanner()}
            <DashboardView 
              stats={stats} 
              requests={requests}
              requesterData={requesterData?.requesters_by_pk}
              onCreateRequest={() => setShowRequestForm(true)}
              isApproved={requester.status === 'approved'}
              volunteerStats={volunteerStats}
            />
          </>
        );
      case 'requests':
        if (requester.status !== 'approved') {
          setCurrentPage('profile');
          return null;
        }
        return (
          <>
            {renderStatusBanner()}
            <RequestsListView
              requests={requests}
              onEdit={(request) => setEditingRequest(request)}
              onCreateRequest={() => setShowRequestForm(true)}
              refetch={refetch}
              isApproved={requester.status === 'approved'}
            />
          </>
        );
      case 'profile':
        return (
          <>
            {renderStatusBanner()}
            <ProfileView
              requester={requesterData?.requesters_by_pk}
              onClose={() => setCurrentPage('dashboard')}
              refetch={refetch}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">{requester.name}</h1>
                <p className="text-sm text-gray-600">{requesterData?.requesters_by_pk?.organization || '需求者'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold transition"
            >
              <LogOut className="w-5 h-5" />
              登出
            </button>
          </div>
        </div>
      </div>

      {/* Tab 導航 */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all border-b-4 flex items-center gap-2 ${
                  currentPage === item.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-green-600'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </div>

      {/* 需求表單 */}
      {showRequestForm && (
        <RequestForm
          requesterId={requester.id}
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            setShowRequestForm(false);
            refetch();
          }}
        />
      )}

      {editingRequest && (
        <RequestForm
          requesterId={requester.id}
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onSuccess={() => {
            setEditingRequest(null);
            refetch();
          }}
          isEdit
        />
      )}
    </div>
  );
}

// ==================== 儀表板視圖 ====================

function DashboardView({ stats, requests, requesterData, onCreateRequest, isApproved, volunteerStats }) {
  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 需求統計卡片 */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">我的需求統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <StatCard label="總需求數" value={stats.total} />
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
            <StatCard label="待支援" value={stats.pending} />
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <StatCard label="進行中" value={stats.in_progress} />
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <StatCard label="已完成" value={stats.completed} />
          </div>
        </div>
      </div>

      {/* 志工統計卡片 */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">志工統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-3xl font-bold">{volunteerStats.totalVolunteers}</div>
            </div>
            <div className="text-sm opacity-90 font-medium">志工總人數</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-8 h-8 opacity-80" />
              <div className="text-3xl font-bold">{volunteerStats.todayVolunteers}</div>
            </div>
            <div className="text-sm opacity-90 font-medium">今天新增志工</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-8 h-8 opacity-80" />
              <div className="text-3xl font-bold">{volunteerStats.yesterdayVolunteers}</div>
            </div>
            <div className="text-sm opacity-90 font-medium">昨天新增志工</div>
          </div>
        </div>
      </div>

      {/* 操作卡片 */}
      <div className="grid md:grid-cols-2 gap-6">
        {isApproved && (
          <button
            onClick={onCreateRequest}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-4 rounded-xl group-hover:bg-green-200 transition">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">建立新需求</h3>
                <p className="text-gray-600 mt-1">填寫表單建立救災需求</p>
              </div>
            </div>
          </button>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-4 rounded-xl">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">帳戶資訊</h3>
              <p className="text-gray-600 mt-1">已建立 {stats.total} 個需求</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div>註冊時間: {new Date(requesterData?.created_at).toLocaleDateString('zh-TW')}</div>
            <div>
              狀態:{" "}
              <span
                className={
                  requesterData?.status === "approved"
                    ? "text-green-600 font-semibold"
                    : requesterData?.status === "pending"
                    ? "text-yellow-600 font-semibold"
                    : "text-green-600 font-semibold"
                }
              >
                {requesterData?.status === "approved"
                  ? "已核准"
                  : requesterData?.status === "pending"
                  ? "審核中"
                  : requesterData?.status === "rejected"
                  ? "已拒絕"
                  : "未知"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 最近的需求 */}
      {recentRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">最近的需求</h3>
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <RequestSummaryCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">尚未建立需求</h3>
          <p className="text-gray-600 mb-6">點擊上方「建立新需求」開始使用</p>
          {isApproved && (
            <button
              onClick={onCreateRequest}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              建立新需求
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}

function RequestSummaryCard({ request }) {
  const statusConfig = {
    pending: { label: '待支援', bg: 'bg-green-100', text: 'text-green-700' },
    in_progress: { label: '進行中', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    completed: { label: '已完成', bg: 'bg-green-100', text: 'text-green-700' }
  };

  const status = statusConfig[request.status] || statusConfig.pending;

  return (
    <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-green-200 transition">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-800">{request.village} {request.street}</h4>
          <span className={`${status.bg} ${status.text} px-2 py-1 rounded-full text-xs font-bold`}>
            {status.label}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">{request.description}</p>
      </div>
      <div className="text-xs text-gray-500 ml-4">
        
        {new Date(request.created_at).toLocaleString('zh-TW', { hour12: false })}
      </div>
    </div>
  );
}

// ==================== 需求列表視圖 ====================

function RequestsListView({ requests, onEdit, onCreateRequest, refetch }) {
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 每頁顯示10個需求

  const [deleteRequest] = useMutation(DELETE_REQUEST, {
    onCompleted: () => {
      alert('✅ 需求已刪除');
      refetch();
    },
    onError: (error) => alert('❌ 刪除失敗：' + error.message)
  });

  // 篩選和搜尋邏輯
  const filteredRequests = requests.filter(r => {
    // 狀態篩選
    if (filter !== 'all' && r.status !== filter) return false;
    
    // 搜尋篩選
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        r.description?.toLowerCase().includes(searchLower) ||
        r.village?.toLowerCase().includes(searchLower) ||
        r.street?.toLowerCase().includes(searchLower) ||
        r.contact_name?.toLowerCase().includes(searchLower) ||
        r.contact_phone?.includes(searchTerm)
      );
    }
    
    return true;
  });

  // 分頁邏輯
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // 當篩選條件改變時重置頁碼
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const handleDelete = (id, description) => {
    if (window.confirm(`確定要刪除需求「${description.substring(0, 20)}...」嗎？`)) {
      deleteRequest({ variables: { id } });
    }
  };

  const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待支援' },
    { value: 'in_progress', label: '進行中' },
    { value: 'completed', label: '已完成' }
  ];

  return (
    <div className="space-y-6">
      {/* 頂部操作列 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">我的需求</h2>
            <p className="text-gray-600 mt-1">管理您建立的所有救災需求</p>
          </div>
          <button
            onClick={onCreateRequest}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            建立新需求
          </button>
        </div>
      </div>

      {/* 搜尋和篩選器 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        {/* 搜尋欄 */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋需求（地址、描述、聯絡人、電話）"
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 狀態篩選器 */}
        <div className="flex flex-wrap gap-3">
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === value
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 結果統計 */}
        <div className="text-sm text-gray-600">
          顯示 {filteredRequests.length} 個需求
          {searchTerm && ` （搜尋：${searchTerm}）`}
        </div>
      </div>

      {/* 需求列表 */}
      <div className="space-y-4">
        {paginatedRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onEdit={() => onEdit(request)}
            onDelete={() => handleDelete(request.id, request.description)}
            onView={() => setSelectedRequest(request)}
          />
        ))}

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? `找不到包含「${searchTerm}」的需求` : '目前沒有符合條件的需求'}
            </p>
          </div>
        )}
      </div>

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              第 {currentPage} / {totalPages} 頁，共 {filteredRequests.length} 個需求
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                上一頁
              </button>
              
              {/* 頁碼按鈕 */}
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // 只顯示當前頁附近的頁碼
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                下一頁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 需求詳情 */}
      {selectedRequest && (
        <RequestDetail
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

function RequestCard({ request, onEdit, onDelete, onView }) {
  const priorityConfig = {
    urgent: { label: '緊急', color: 'bg-green-600' },
    normal: { label: '普通', color: 'bg-blue-500' },
  };

  const statusConfig = {
    pending: { label: '待支援', bg: 'bg-green-100', text: 'text-green-700' },
    in_progress: { label: '進行中', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    completed: { label: '已完成', bg: 'bg-green-100', text: 'text-green-700' }
  };

  const priority = priorityConfig[request.priority] || priorityConfig.normal;
  const status = statusConfig[request.status] || statusConfig.pending;

  // 計算已派遣人數
  const assignedCount = request.assignments?.reduce((sum, assignment) => 
    sum + (assignment.volunteer?.member_count || 1), 0
  ) || 0;
  const remainingVolunteers = request.required_volunteers - assignedCount;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`${priority.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
              {priority.label}
            </span>
            <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-bold`}>
              {status.label}
            </span>
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">
              {request.request_type}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {request.village} {request.street}
          </h3>
          <p className="text-gray-600 mb-3">{request.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {request.contact_name}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {request.contact_phone}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(request.created_at).toLocaleString('zh-TW', { hour12: false })}
            </div>
          </div>
        </div>

        {/* 右側區域：人數狀態 + 操作按鈕 */}
        <div className="flex flex-col gap-3 ml-4">
          {/* 人數狀態 */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${remainingVolunteers > 0 ? 'bg-blue-50' : 'bg-green-50'}`}>
            <Users className={`w-5 h-5 ${remainingVolunteers > 0 ? 'text-blue-600' : 'text-green-600'}`} />
            <div className="text-sm">
              <div className={`font-bold ${remainingVolunteers > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                {assignedCount}/{request.required_volunteers}
              </div>
              <div className="text-gray-500 text-xs">人力需求</div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onView}
              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
              title="查看詳情"
            >
              <Eye className="w-5 h-5" />
            </button>
            {request.status === 'pending' && (
              <>
                <button
                  onClick={onEdit}
                  className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition"
                  title="編輯"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={onDelete}
                  className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition"
                  title="刪除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 需求詳情 ====================

function RequestDetail({ request, onClose }) {
  const priorityConfig = {
    urgent: { label: '緊急', color: 'bg-green-600' },
    normal: { label: '普通', color: 'bg-blue-500' },
  };

  const statusConfig = {
    pending: { label: '待支援', bg: 'bg-green-100', text: 'text-green-700' },
    in_progress: { label: '進行中', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    completed: { label: '已完成', bg: 'bg-green-100', text: 'text-green-700' }
  };

  const priority = priorityConfig[request.priority] || priorityConfig.normal;
  const status = statusConfig[request.status] || statusConfig.pending;

  // 計算已派遣人數
  const assignedCount = request.assignments?.reduce((sum, assignment) => 
    sum + (assignment.volunteer?.member_count || 1), 0
  ) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">需求詳情</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2 flex-wrap mb-4">
            <span className={`${priority.color} text-white px-3 py-1 rounded-full text-sm font-bold`}>
              {priority.label}
            </span>
            <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-sm font-bold`}>
              {status.label}
            </span>
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-bold">
              {request.request_type}
            </span>
          </div>

          <DetailRow label="地點" value={`${request.village} ${request.street}`} />
          <DetailRow label="聯絡人" value={request.contact_name} />
          <DetailRow label="聯絡電話" value={request.contact_phone} />
          <DetailRow label="需求人數" value={`${request.required_volunteers} 人`} />
          <DetailRow label="已派遣人數" value={`${assignedCount} 人`} />
          <DetailRow label="需求描述" value={request.description} />
          {request.notes && <DetailRow label="備註" value={request.notes} />}
          <DetailRow label="建立時間" value={new Date(request.created_at).toLocaleString('zh-TW')} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex border-b border-gray-100 pb-3">
      <div className="w-32 font-semibold text-gray-600">{label}</div>
      <div className="flex-1 text-gray-800 break-words">{value}</div>
    </div>
  );
}

// ==================== 個人資料視圖 ====================

function ProfileView({ requester, onClose, refetch }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    organization: '',
    notes: ''
  });

  const [updateRequester, { loading }] = useMutation(UPDATE_REQUESTER, {
    onCompleted: () => {
      alert('✅ 資料更新成功！');
      setIsEditing(false);
      refetch();
    },
    onError: (error) => alert('❌ 更新失敗：' + error.message)
  });

  useEffect(() => {
    if (requester) {
      setFormData({
        name: requester.name || '',
        phone: requester.phone || '',
        organization: requester.organization || '',
        notes: requester.notes || ''
      });
    }
  }, [requester]);

  if (!requester) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      alert('請填寫姓名和電話');
      return;
    }
    updateRequester({
      variables: {
        id: requester.id,
        name: formData.name,
        phone: formData.phone,
        organization: formData.organization,
        notes: formData.notes
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 帳戶狀態卡片 */}
      <div className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 
        ${requester.status === 'approved' ? 'border-green-500' : 
          requester.status === 'pending' ? 'border-yellow-500' : 'border-green-500'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">帳戶狀態</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${requester.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  requester.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {requester.status === 'approved' ? '已審核通過' : 
                 requester.status === 'pending' ? '審核中' : '已拒絕'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>建立時間：</strong> 
                {new Date(requester.created_at).toLocaleString('zh-TW')}
              </p>
              {requester.notes && requester.status === 'rejected' && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg">
                  <strong className="text-green-700">拒絕原因：</strong>
                  <p className="mt-1 text-green-600">{requester.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 個人資料卡片 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">個人資料</h2>
            <p className="text-gray-600 mt-1">管理您的帳戶資訊</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
            >
              <Edit className="w-5 h-5" />
              編輯資料
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">電話</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">單位/組織</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">備註</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="其他補充說明..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition shadow-lg disabled:opacity-50"
              >
                {loading ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                icon={<User className="w-5 h-5 text-green-600" />}
                label="姓名"
                value={requester.name}
              />
              <InfoCard
                icon={<Phone className="w-5 h-5 text-green-600" />}
                label="電話"
                value={requester.phone}
              />
              <InfoCard
                icon={<Building2 className="w-5 h-5 text-green-600" />}
                label="單位/組織"
                value={requester.organization || '未設定'}
              />
              <InfoCard
                icon={
                  requester.status === 'approved'
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : requester.status === 'pending'
                    ? <Clock className="w-5 h-5 text-yellow-600" />
                    : <XCircle className="w-5 h-5 text-green-600" />
                }
                label="帳戶狀態"
                value={
                  requester.status === 'approved'
                    ? '已核准'
                    : requester.status === 'pending'
                    ? '審核中'
                    : requester.status === 'rejected'
                    ? '已拒絕'
                    : '未知'
                }
              />
            </div>
            {/* 備註區塊 */}
            <div className="col-span-2 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-600">備註</span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{requester.notes || '未設定'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-semibold text-gray-600">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}

// ==================== 需求表單 ====================

function RequestForm({ requesterId, request = null, onClose, onSuccess, isEdit = false }) {
  const [formData, setFormData] = useState(request || {
    request_type: '一般志工',
    priority: 'normal',
    village: '',
    street: '',
    contact_name: '',
    contact_phone: '',
    description: '',
    required_volunteers: 1,
    notes: ''
  });

  const [createRequest, { loading: creating }] = useMutation(CREATE_REQUEST, {
    onCompleted: () => {
      alert('✅ 需求建立成功！\n志工將會協助處理您的需求');
      onSuccess();
    },
    onError: (error) => alert('❌ 建立失敗：' + error.message)
  });

  const [updateRequest, { loading: updating }] = useMutation(UPDATE_REQUEST, {
    onCompleted: () => {
      alert('✅ 需求更新成功！');
      onSuccess();
    },
    onError: (error) => alert('❌ 更新失敗：' + error.message)
  });

  const handleSubmit = () => {
    if (!formData.village || !formData.street || !formData.contact_name || 
        !formData.contact_phone || !formData.description) {
      alert('請填寫所有必填欄位');
      return;
    }

    if (isEdit) {
      updateRequest({
        variables: {
          id: request.id,
          ...formData
        }
      });
    } else {
      createRequest({
        variables: {
          requester_id: requesterId,
          ...formData
        }
      });
    }
  };

  const loading = creating || updating;

  // 花蓮縣光復鄉村里清單
  const villages = [
    "光復鄉-光復村","光復鄉-東富村","光復鄉-西富村 ","光復鄉-南富村","光復鄉-北富村","光復鄉-大馬村","光復鄉-大華村","光復鄉-大豐村 ","光復鄉-大安村","光復鄉-大全村","光復鄉-大進村","光復鄉-佐倉村","光復鄉-森永村","鳳林鎮-長橋里","其他"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEdit ? '編輯需求' : '建立新需求'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                需求類型 <span className="text-green-600">*</span>
              </label>
              <select
                value={formData.request_type}
                onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="一般志工">一般志工</option>
                <option value="專業技術">專業技術</option>
                <option value="機具">機具</option>
                <option value="醫療照護">醫療照護</option>
                <option value="義廚">義廚</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                優先順序 <span className="text-green-600">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="urgent">緊急</option>
                <option value="normal">普通</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                村里 <span className="text-green-600">*</span>
              </label>
              <select
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">請選擇村里</option>
                {villages.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                街道 或 Google Map定位 <span className="text-green-600">*</span>
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="中正路12號 或 https://maps.app.goo.gl/9JRe65YW1gUVPCR27?g_st=ipc"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                聯絡人 <span className="text-green-600">*</span>
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="請輸入聯絡人姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                聯絡電話 <span className="text-green-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0988123456"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              需求人數
            </label>
            <input
              type="number"
              min="1"
              value={formData.required_volunteers}
              onChange={(e) => {
                const value = e.target.value;
                // 允许空字符串以便用户可以清空输入框
                if (value === '') {
                  setFormData({ ...formData, required_volunteers: '' });
                } else {
                  const num = parseInt(value);
                  if (!isNaN(num) && num >= 1) {
                    setFormData({ ...formData, required_volunteers: num });
                  }
                }
              }}
              onBlur={() => {
                // 失去焦点时，如果为空或小于1，设置为1
                if (formData.required_volunteers === '' || formData.required_volunteers < 1) {
                  setFormData({ ...formData, required_volunteers: 1 });
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="請輸入需要的志工人數"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              需求描述 <span className="text-green-600">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows="4"
              placeholder="請詳細描述您的需求..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">備註</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="其他補充說明..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition shadow-lg disabled:opacity-50"
            >
              {loading ? (isEdit ? '更新中...' : '建立中...') : (isEdit ? '更新需求' : '建立需求')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}