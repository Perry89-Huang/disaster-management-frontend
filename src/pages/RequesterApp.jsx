import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  Building2, Phone, User, FileText, CheckCircle, AlertCircle, 
  Clock, LogIn, UserPlus, ArrowRight, Plus, Edit, Trash2, X,
  LayoutDashboard, List, UserCircle, LogOut, MapPin, AlertTriangle,
  RefreshCw, Eye, Check, XCircle
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
      status
      created_at
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

// 更新需求者資料
const UPDATE_REQUESTER = gql`
  mutation UpdateRequester(
    $id: uuid!
    $name: String
    $phone: String
    $organization: String
  ) {
    update_requesters_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        phone: $phone
        organization: $organization
      }
    ) {
      id
      name
      phone
      organization
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

// ==================== 登入/註冊頁面 ====================

function RequesterAuth({ onLogin }) {
  const [authMode, setAuthMode] = useState('login');
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
        
        // 根據狀態顯示不同的提示訊息
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
    setLoggingIn(true);
    try {
      const { data } = await loginRequester({ 
        variables: { 
          phone: formData.phone, 
          name: formData.name 
        },
        fetchPolicy: 'network-only' // 強制從網路獲取最新資料
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
    registerRequester({ variables: formData });
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
                    disabled={loggingIn}
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
                    disabled={loggingIn}
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loggingIn}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
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
                    <User className="w-4 h-4 mr-2 text-red-600" />姓名 <span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="請輸入真實姓名"
                    disabled={registering}
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
                    disabled={registering}
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
                    disabled={registering}
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
                    disabled={registering}
                  />
                </div>

                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{registering ? '送出中...' : '提交申請'}</span>
                  {!registering && <ArrowRight className="w-5 h-5" />}
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

// ==================== 需求者控制台 ====================

function RequesterDashboard({ requester, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // 根據狀態顯示不同的橫幅
  const renderStatusBanner = () => {
    const statusConfig = {
      pending: {
        icon: <Clock className="w-5 h-5" />,
        title: '帳號審核中',
        message: '您的帳號正在等待管理員審核，審核通過後即可建立需求',
        className: 'bg-yellow-50 border-yellow-500 text-yellow-700'
      },
      rejected: {
        icon: <XCircle className="w-5 h-5" />,
        title: '帳號已被拒絕',
        message: '很抱歉，您的帳號申請未通過審核。如有疑問，請聯繫管理員',
        className: 'bg-red-50 border-red-500 text-red-700'
      }
    };

    const config = statusConfig[requester.status];
    if (!config) return null;

    return (
      <div className={`mb-6 p-4 border-l-4 rounded-lg ${config.className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">{config.icon}</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">{config.title}</h3>
            <div className="mt-2 text-sm">{config.message}</div>
            {requester.notes && requester.status === 'rejected' && (
              <div className="mt-2 text-sm bg-red-100 p-2 rounded">
                <strong>拒絕原因：</strong> {requester.notes}
              </div>
            )}
            <div className="mt-2 text-xs">
              <strong>申請時間：</strong> {new Date(requester.created_at).toLocaleString('zh-TW')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const { data, loading, error, refetch } = useQuery(GET_REQUESTER_WITH_REQUESTS, {
    variables: { id: requester.id },
    pollInterval: 10000
  });

  const requesterData = data?.requesters_by_pk;
  const requests = requesterData?.disaster_requests || [];

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  // 根據帳號狀態決定顯示哪些導航項目
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
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <p className="text-red-700">載入失敗: {error.message}</p>
          <button onClick={() => refetch()} className="mt-4 text-red-600 hover:text-red-800 font-semibold">
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
              requesterData={requesterData}
              onCreateRequest={() => requester.status === 'approved' ? setShowRequestForm(true) : alert('請等待帳號審核通過後再建立需求')}
              isApproved={requester.status === 'approved'}
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
              onEdit={(request) => requester.status === 'approved' ? setEditingRequest(request) : alert('請等待帳號審核通過後再編輯需求')}
              onCreateRequest={() => requester.status === 'approved' ? setShowRequestForm(true) : alert('請等待帳號審核通過後再建立需求')}
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
              requester={requesterData}
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">{requester.name}</h1>
                <p className="text-sm text-gray-600">{requesterData?.organization || '需求者'}</p>
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
                    ? 'text-red-600 border-red-600 bg-red-50'
                    : 'text-gray-600 border-transparent hover:text-red-500 hover:border-red-300 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </div>

      {/* 新增需求表單 */}
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

      {/* 編輯需求表單 */}
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

function DashboardView({ stats, requests, requesterData, onCreateRequest }) {
  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 歡迎卡片 */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <CheckCircle className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">歡迎回來！</h2>
            <p className="text-red-100 mt-1">您可以在此建立與管理救災需求</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard label="總需求數" value={stats.total} />
          <StatCard label="待支援" value={stats.pending} />
          <StatCard label="進行中" value={stats.in_progress} />
          <StatCard label="已完成" value={stats.completed} />
        </div>
      </div>

      /* 快速操作 */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={onCreateRequest}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-red-200 text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
          <div className="bg-red-100 p-4 rounded-xl group-hover:bg-red-200 transition">
            <Plus className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">建立新需求</h3>
            <p className="text-gray-600 mt-1">填寫表單建立救災需求</p>
          </div>
            </div>
          </button>

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
              : "text-red-600 font-semibold"
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

        {/* 最近的需求 */}}
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
          <button
            onClick={onCreateRequest}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            建立新需求
          </button>
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
    pending: { label: '待支援', bg: 'bg-red-100', text: 'text-red-700' },
    in_progress: { label: '進行中', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    completed: { label: '已完成', bg: 'bg-green-100', text: 'text-green-700' }
  };

  const status = statusConfig[request.status] || statusConfig.pending;

  return (
    <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-red-200 transition">
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
        {new Date(request.created_at).toLocaleDateString('zh-TW')}
      </div>
    </div>
  );
}

// ==================== 需求列表視圖 ====================

function RequestsListView({ requests, onEdit, onCreateRequest, refetch }) {
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [deleteRequest] = useMutation(DELETE_REQUEST, {
    onCompleted: () => {
      alert('✅ 需求已刪除');
      refetch();
    },
    onError: (error) => alert('❌ 刪除失敗：' + error.message)
  });

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleDelete = (id, description) => {
    if (window.confirm(`確定要刪除需求「${description}」嗎？\n此操作無法復原！`)) {
      deleteRequest({ variables: { id } });
    }
  };

  return (
    <div className="space-y-6">
      {/* 標題與按鈕 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">我的需求</h2>
            <p className="text-gray-600 mt-1">管理您建立的救災需求</p>
          </div>
          <button
            onClick={onCreateRequest}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            建立新需求
          </button>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待支援' },
            { key: 'in_progress', label: '進行中' },
            { key: 'completed', label: '已完成' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-6 py-2 rounded-xl font-semibold transition ${
                filter === key
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 需求列表 */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
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
            <p className="text-gray-500 text-lg">目前沒有符合條件的需求</p>
          </div>
        )}
      </div>

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
    urgent: { label: '緊急', color: 'bg-red-600' },
    high: { label: '高', color: 'bg-orange-500' },
    normal: { label: '普通', color: 'bg-blue-500' },
    low: { label: '低', color: 'bg-gray-500' }
  };

  const statusConfig = {
    pending: { label: '待支援', bg: 'bg-red-100', text: 'text-red-700' },
    in_progress: { label: '進行中', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    completed: { label: '已完成', bg: 'bg-green-100', text: 'text-green-700' }
  };

  const priority = priorityConfig[request.priority] || priorityConfig.normal;
  const status = statusConfig[request.status] || statusConfig.pending;

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
          </div>
        </div>
        <div className="flex flex-col gap-2 ml-4">
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
                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                title="刪除"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
        建立時間: {new Date(request.created_at).toLocaleString('zh-TW')}
      </div>
    </div>
  );
}

function RequestDetail({ request, onClose }) {
  const priorityMap = { urgent: '緊急', high: '高', normal: '普通', low: '低' };
  const statusMap = { pending: '待支援', in_progress: '進行中', completed: '已完成' };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-gray-800">需求詳情</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <DetailRow label="需求類型" value={request.request_type} />
          <DetailRow label="優先順序" value={priorityMap[request.priority]} />
          <DetailRow label="狀態" value={statusMap[request.status]} />
          <DetailRow label="村落" value={request.village} />
          <DetailRow label="街道/地址" value={request.street} />
          <DetailRow label="聯絡人" value={request.contact_name} />
          <DetailRow label="聯絡電話" value={request.contact_phone} />
          <DetailRow label="需求志工人數" value={`${request.required_volunteers} 人`} />
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
    name: requester?.name || '',
    phone: requester?.phone || '',
    organization: requester?.organization || ''
  });

  const [updateRequester, { loading }] = useMutation(UPDATE_REQUESTER, {
    onCompleted: () => {
      alert('✅ 資料更新成功！');
      setIsEditing(false);
      refetch();
    },
    onError: (error) => alert('❌ 更新失敗：' + error.message)
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      alert('請填寫姓名和電話');
      return;
    }
    updateRequester({
      variables: {
        id: requester.id,
        ...formData
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 帳戶狀態卡片 */}
      <div className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 
        ${requester.status === 'approved' ? 'border-green-500' : 
          requester.status === 'pending' ? 'border-yellow-500' : 'border-red-500'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">帳戶狀態</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${requester.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  requester.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
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
                <div className="mt-2 p-3 bg-red-50 rounded-lg">
                  <strong className="text-red-700">拒絕原因：</strong>
                  <p className="mt-1 text-red-600">{requester.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 個人資料卡片 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">個人資料</h2>
            <p className="text-gray-600 mt-1">管理您的帳戶資訊</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                姓名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                電話 <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                所屬單位
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: requester.name,
                    phone: requester.phone,
                    organization: requester.organization
                  });
                }}
                disabled={loading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold transition shadow-lg disabled:opacity-50"
              >
                {loading ? '更新中...' : '儲存'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <div className="bg-red-100 p-4 rounded-full">
                <User className="w-12 h-12 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{requester?.name}</h3>
                <p className="text-gray-600">{requester?.organization || '未填寫單位'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                icon={<Phone className="w-5 h-5 text-red-600" />}
                label="聯絡電話"
                value={requester?.phone}
              />
              <InfoCard
                icon={<Building2 className="w-5 h-5 text-red-600" />}
                label="所屬單位"
                value={requester?.organization || '未填寫'}
              />
              <InfoCard
                icon={<Clock className="w-5 h-5 text-red-600" />}
                label="註冊時間"
                value={new Date(requester?.created_at).toLocaleDateString('zh-TW')}
              />
              <InfoCard
                icon={
                  requester?.status === 'approved'
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : requester?.status === 'pending'
                    ? <Clock className="w-5 h-5 text-yellow-600" />
                    : <XCircle className="w-5 h-5 text-red-600" />
                }
                label="帳戶狀態"
                value={
                  requester?.status === 'approved'
                    ? '已核准'
                    : requester?.status === 'pending'
                    ? '審核中'
                    : requester?.status === 'rejected'
                    ? '已拒絕'
                    : '未知'
                }
              />
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
    request_type: '志工',
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
      alert('✅ 需求建立成功！\n管理員將會安排志工協助');
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEdit ? '編輯需求' : '建立新需求'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                需求類型
              </label>
              <select
                value={formData.request_type}
                onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="志工">志工</option>
                <option value="物資">物資</option>
                <option value="志工+物資">志工+物資</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                優先順序
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="low">低</option>
                <option value="normal">普通</option>
                <option value="high">高</option>
                <option value="urgent">緊急</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                村落 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="例：東富村"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                街道/地址 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="例：佛祖街123號"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                聯絡人 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="聯絡人姓名"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                聯絡電話 <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0912-345-678"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                需求志工人數
              </label>
              <input
                type="number"
                min="1"
                value={formData.required_volunteers}
                onChange={(e) => setFormData({ ...formData, required_volunteers: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              需求描述 <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="4"
              placeholder="詳細描述救災需求，例如：需要協助清理淤泥、搬運物資等..."
              disabled={loading}
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              備註
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="2"
              placeholder="其他補充說明..."
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold transition shadow-lg disabled:opacity-50"
            >
              {loading ? '處理中...' : isEdit ? '更新需求' : '建立需求'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}