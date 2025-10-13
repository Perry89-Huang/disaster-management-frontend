import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  LayoutDashboard, Users, FileText, Building2, Send,
  UserPlus, Plus, Edit, Trash2, X, Eye, Check, 
  AlertCircle, Clock, CheckCircle, XCircle, Phone, User,
  MapPin, AlertTriangle, RefreshCw, Power, Search, Lock, LogOut
} from 'lucide-react';

// 導入需求者管理元件
import RequesterManagement from './RequesterManagement';

// GraphQL 查詢
const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    available_volunteers: volunteers_aggregate(
      where: { status: { _eq: "available" } }
    ) {
      aggregate {
        count
      }
    }
    
    assigned_volunteers: volunteers_aggregate(
      where: { status: { _in: ["assigning", "assigned"] } }
    ) {
      aggregate {
        count
      }
    }
    
    pending_requests: disaster_requests_aggregate(
      where: { status: { _eq: "pending" } }
    ) {
      aggregate {
        count
      }
    }
    
    in_progress_requests: disaster_requests_aggregate(
      where: { status: { _eq: "in_progress" } }
    ) {
      aggregate {
        count
      }
    }
    
    pending_assignments: assignments_aggregate(
      where: { status: { _eq: "pending" } }
    ) {
      aggregate {
        count
      }
    }
    
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

const GET_VOLUNTEERS = gql`
  query GetVolunteers {
    volunteers(order_by: { created_at: desc }) {
      id
      name
      phone
      email
      member_count
      nickname
      status
      notes
      created_at
    }
  }
`;

const GET_REQUESTS = gql`
  query GetRequests {
    disaster_requests(order_by: { created_at: desc }) {
      id
      request_type
      priority
      township
      village
      street
      contact_name
      contact_phone
      description
      required_volunteers
      status
      notes
      created_at
      requester_id
      requester {
        name
        organization
      }
    }
  }
`;

const CREATE_VOLUNTEER = gql`
  mutation CreateVolunteer(
    $name: String!
    $phone: String!
    $email: String
    $member_count: Int
    $nickname: String
    $notes: String
  ) {
    insert_volunteers_one(
      object: {
        name: $name
        phone: $phone
        email: $email
        member_count: $member_count
        nickname: $nickname
        notes: $notes
        status: "off"
      }
    ) {
      id
      name
    }
  }
`;

const UPDATE_VOLUNTEER = gql`
  mutation UpdateVolunteer(
    $id: uuid!
    $name: String
    $phone: String
    $email: String
    $member_count: Int
    $nickname: String
    $notes: String
  ) {
    update_volunteers_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        phone: $phone
        email: $email
        member_count: $member_count
        nickname: $nickname
        notes: $notes
      }
    ) {
      id
      name
    }
  }
`;

const DELETE_VOLUNTEER = gql`
  mutation DeleteVolunteer($id: uuid!) {
    delete_volunteers_by_pk(id: $id) {
      id
      name
    }
  }
`;

const CREATE_REQUEST = gql`
  mutation CreateRequest(
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
        created_by: "admin"
      }
    ) {
      id
      description
    }
  }
`;

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

const DELETE_REQUEST = gql`
  mutation DeleteRequest($id: uuid!) {
    delete_disaster_requests_by_pk(id: $id) {
      id
      description
    }
  }
`;

export default function AdminApp() {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState('儀表板');

  // 保存管理员登入状态到 localStorage
  useEffect(() => {
    if (admin) {
      localStorage.setItem('admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('admin');
    }
  }, [admin]);

  const handleLogout = () => {
    if (window.confirm('確定要登出嗎？')) {
      setAdmin(null);
    }
  };

  // 如果未登入，显示登入画面
  if (!admin) {
    return <AdminLogin onLogin={setAdmin} />;
  }

  const tabs = [
    { name: '儀表板', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: '志工管理', icon: <Users className="w-5 h-5" /> },
    { name: '需求管理', icon: <FileText className="w-5 h-5" /> },
    { name: '需求者管理', icon: <Building2 className="w-5 h-5" /> },
    { name: '派單管理', icon: <Send className="w-5 h-5" /> }
  ];

  const renderContent = () => {
    switch (currentPage) {
      case '儀表板':
        return <DashboardPage />;
      case '志工管理':
        return <VolunteerManagementPage />;
      case '需求管理':
        return <RequestManagementPage />;
      case '需求者管理':
        return <RequesterManagement />;
      case '派單管理':
        return <AssignmentManagementPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              花蓮縣光復救災資源管理系統
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <div className="font-semibold">{admin.username}</div>
                <div className="text-xs text-gray-500">管理員</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">登出</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setCurrentPage(tab.name)}
                className={`px-4 py-4 font-semibold whitespace-nowrap transition-all border-b-4 flex items-center gap-2 ${
                  currentPage === tab.name
                    ? 'text-red-600 border-red-600 bg-red-50'
                    : 'text-gray-600 border-transparent hover:text-red-500 hover:border-red-300 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
}

// ==================== 儀表板頁面 ====================
function DashboardPage() {
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
  const queryWithDates = GET_DASHBOARD_STATS.loc.source.body
    .replace(/{{TODAY_START}}/g, getTodayStart())
    .replace(/{{YESTERDAY_START}}/g, getYesterdayStart());

  const DASHBOARD_QUERY = gql`${queryWithDates}`;

  const { data, loading, error } = useQuery(DASHBOARD_QUERY, {
    pollInterval: 10000
  });

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
      </div>
    );
  }

  const stats = {
    availableVolunteers: data?.available_volunteers?.aggregate?.count || 0,
    assignedVolunteers: data?.assigned_volunteers?.aggregate?.count || 0,
    pendingRequests: data?.pending_requests?.aggregate?.count || 0,
    inProgressRequests: data?.in_progress_requests?.aggregate?.count || 0,
    pendingAssignments: data?.pending_assignments?.aggregate?.count || 0,
    totalVolunteers: data?.total_volunteers?.aggregate?.count || 0,
    todayVolunteers: data?.today_volunteers?.aggregate?.count || 0,
    yesterdayVolunteers: data?.yesterday_volunteers?.aggregate?.count || 0
  };

  return (
    <div className="space-y-6">
      {/* 歡迎卡片 */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">管理員儀表板</h2>
        <p className="text-red-100">即時監控救災資源與派遣狀況</p>
      </div>

      {/* 志工統計 - 新增總人數和增長統計 */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">志工統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="志工總人數"
            value={stats.totalVolunteers}
            color="purple"
            icon={<Users />}
          />
          <StatCard
            title="今天新增志工"
            value={stats.todayVolunteers}
            color="green"
            icon={<UserPlus />}
          />
          <StatCard
            title="昨天新增志工"
            value={stats.yesterdayVolunteers}
            color="blue"
            icon={<UserPlus />}
          />
        </div>
      </div>

      {/* 志工狀態 */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">志工狀態</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="可派遣志工"
            value={stats.availableVolunteers}
            color="green"
            icon={<Users />}
          />
          <StatCard
            title="已派遣志工"
            value={stats.assignedVolunteers}
            color="blue"
            icon={<Users />}
          />
        </div>
      </div>

      {/* 需求統計 */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">救災需求</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="待支援需求"
            value={stats.pendingRequests}
            color="red"
            icon={<AlertCircle />}
          />
          <StatCard
            title="進行中需求"
            value={stats.inProgressRequests}
            color="yellow"
            icon={<Clock />}
          />
        </div>
      </div>


    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  const colors = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-3">
        <div className="opacity-80">{icon}</div>
        <div className="text-4xl font-bold">{value}</div>
      </div>
      <div className="text-sm opacity-90 font-medium">{title}</div>
    </div>
  );
}

// ==================== 志工管理頁面 ====================
function VolunteerManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, loading, error, refetch } = useQuery(GET_VOLUNTEERS, {
    pollInterval: 10000
  });

  const [createVolunteer] = useMutation(CREATE_VOLUNTEER, {
    refetchQueries: [{ query: GET_VOLUNTEERS }],
    onCompleted: () => {
      alert('✅ 志工新增成功！');
      setShowForm(false);
    },
    onError: (error) => alert('❌ 新增失敗：' + error.message)
  });

  const [updateVolunteer] = useMutation(UPDATE_VOLUNTEER, {
    refetchQueries: [{ query: GET_VOLUNTEERS }],
    onCompleted: () => {
      alert('✅ 更新成功！');
      setEditingVolunteer(null);
    },
    onError: (error) => alert('❌ 更新失敗：' + error.message)
  });

  const [deleteVolunteer] = useMutation(DELETE_VOLUNTEER, {
    refetchQueries: [{ query: GET_VOLUNTEERS }],
    onCompleted: () => alert('✅ 刪除成功！'),
    onError: (error) => alert('❌ 刪除失敗：' + error.message)
  });

  const volunteers = data?.volunteers || [];

  // 搜尋過濾
  const filteredVolunteers = volunteers.filter(volunteer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      volunteer.name?.toLowerCase().includes(query) ||
      volunteer.phone?.toLowerCase().includes(query) ||
      volunteer.nickname?.toLowerCase().includes(query) ||
      volunteer.email?.toLowerCase().includes(query)
    );
  });

  // 分頁計算
  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVolunteers = filteredVolunteers.slice(startIndex, endIndex);

  // 當搜尋條件改變時，重置到第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = (id, name) => {
    if (window.confirm(`確定要刪除志工「${name}」嗎？`)) {
      deleteVolunteer({ variables: { id } });
    }
  };

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題與按鈕 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">志工管理</h2>
            <p className="text-gray-600 mt-1">管理救災志工資料</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
          >
            <UserPlus className="w-5 h-5" />
            新增志工
          </button>
        </div>
      </div>

      {/* 搜尋框 */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋姓名、電話、暱稱或 Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            找到 {filteredVolunteers.length} 個志工
          </div>
        )}
      </div>

      {/* 志工列表 */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">姓名</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">電話</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">人數</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">狀態</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{volunteer.name}</div>
                    {volunteer.nickname && (
                      <div className="text-sm text-gray-500">{volunteer.nickname}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{volunteer.phone}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                      {volunteer.member_count} 人
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={volunteer.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingVolunteer(volunteer)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(volunteer.id, volunteer.name)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedVolunteers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? '沒有符合搜尋條件的志工' : '目前沒有志工資料'}
            </div>
          )}
        </div>
      </div>

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              第 {currentPage} / {totalPages} 頁，共 {filteredVolunteers.length} 個志工
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                上一頁
              </button>
              
              {/* 頁碼按鈕 */}
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
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
                            ? 'bg-red-600 text-white'
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
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                下一頁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 表單 */}
      {showForm && (
        <VolunteerForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createVolunteer({ variables: data })}
        />
      )}

      {editingVolunteer && (
        <VolunteerForm
          volunteer={editingVolunteer}
          onClose={() => setEditingVolunteer(null)}
          onSubmit={(data) => updateVolunteer({ 
            variables: { id: editingVolunteer.id, ...data } 
          })}
          isEdit
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    available: { label: '可派遣', bg: 'bg-green-100', text: 'text-green-700' },
    assigning: { label: '派遣中', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    assigned: { label: '已派遣', bg: 'bg-blue-100', text: 'text-blue-700' },
    off: { label: '離線', bg: 'bg-gray-100', text: 'text-gray-700' }
  };

  const { label, bg, text } = config[status] || config.off;

  return (
    <span className={`${bg} ${text} px-3 py-1 rounded-full text-sm font-bold`}>
      {label}
    </span>
  );
}

function VolunteerForm({ volunteer = null, onClose, onSubmit, isEdit = false }) {
  const [formData, setFormData] = useState(volunteer || {
    name: '',
    phone: '',
    email: '',
    member_count: 1,
    nickname: '',
    notes: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      alert('請填寫姓名和電話');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEdit ? '編輯志工' : '新增志工'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              姓名 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="請輸入姓名"
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
              placeholder="0912-345-678"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              可派遣人數
            </label>
            <input
              type="number"
              min="1"
              value={formData.member_count}
              onChange={(e) => {
                const value = e.target.value;
                // 允许空字符串以便用户可以清空输入框
                if (value === '') {
                  setFormData({ ...formData, member_count: '' });
                } else {
                  const num = parseInt(value);
                  if (!isNaN(num) && num >= 1) {
                    setFormData({ ...formData, member_count: num });
                  }
                }
              }}
              onBlur={() => {
                // 失去焦点时，如果为空或小于1，设置为1
                if (formData.member_count === '' || formData.member_count < 1) {
                  setFormData({ ...formData, member_count: 1 });
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="請輸入可派遣人數"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              暱稱
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="選填"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              備註
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="其他備註..."
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
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold transition shadow-lg"
            >
              {isEdit ? '更新' : '儲存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 需求管理頁面 ====================
function RequestManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, loading, error } = useQuery(GET_REQUESTS, {
    pollInterval: 10000
  });

  const [createRequest] = useMutation(CREATE_REQUEST, {
    refetchQueries: [{ query: GET_REQUESTS }],
    onCompleted: () => {
      alert('✅ 需求建立成功！');
      setShowForm(false);
    },
    onError: (error) => alert('❌ 建立失敗：' + error.message)
  });

  const [updateRequest] = useMutation(UPDATE_REQUEST, {
    refetchQueries: [{ query: GET_REQUESTS }],
    onCompleted: () => {
      alert('✅ 更新成功！');
      setEditingRequest(null);
    },
    onError: (error) => alert('❌ 更新失敗：' + error.message)
  });

  const [deleteRequest] = useMutation(DELETE_REQUEST, {
    refetchQueries: [{ query: GET_REQUESTS }],
    onCompleted: () => alert('✅ 刪除成功！'),
    onError: (error) => alert('❌ 刪除失敗：' + error.message)
  });

  const requests = data?.disaster_requests || [];

  // 搜尋和狀態過濾
  const filteredRequests = requests.filter(r => {
    // 狀態過濾
    if (filter !== 'all' && r.status !== filter) return false;
    
    // 搜尋過濾
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.description?.toLowerCase().includes(query) ||
      r.village?.toLowerCase().includes(query) ||
      r.street?.toLowerCase().includes(query) ||
      r.contact_name?.toLowerCase().includes(query) ||
      r.contact_phone?.toLowerCase().includes(query)
    );
  });

  // 分頁計算
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // 當搜尋條件或篩選條件改變時，重置到第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  const handleDelete = (id, description) => {
    if (window.confirm(`確定要刪除需求「${description}」嗎？`)) {
      deleteRequest({ variables: { id } });
    }
  };

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題與按鈕 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">需求管理</h2>
            <p className="text-gray-600 mt-1">管理救災需求</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            新增需求
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStatCard label="總數" value={stats.total} color="blue" />
        <MiniStatCard label="待支援" value={stats.pending} color="red" />
        <MiniStatCard label="進行中" value={stats.in_progress} color="yellow" />
        <MiniStatCard label="已完成" value={stats.completed} color="green" />
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2 mb-4">
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

        {/* 搜尋框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋地址、描述或聯絡人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            找到 {filteredRequests.length} 個需求
          </div>
        )}
      </div>

      {/* 需求列表 */}
      <div className="space-y-4">
        {paginatedRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onEdit={() => setEditingRequest(request)}
            onDelete={() => handleDelete(request.id, request.description)}
          />
        ))}
        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? '沒有符合搜尋條件的需求' : '目前沒有符合條件的需求'}
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
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                上一頁
              </button>
              
              {/* 頁碼按鈕 */}
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
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
                            ? 'bg-red-600 text-white'
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
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                下一頁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 表單 */}
      {showForm && (
        <RequestForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createRequest({ variables: data })}
        />
      )}

      {editingRequest && (
        <RequestForm
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onSubmit={(data) => updateRequest({ 
            variables: { id: editingRequest.id, ...data } 
          })}
          isEdit
        />
      )}
    </div>
  );
}

function MiniStatCard({ label, value, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl shadow-lg p-4 text-white`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}

function RequestCard({ request, onEdit, onDelete }) {
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
          <h3 className="text-lg font-bold text-gray-800">
            {request.village} {request.street}
          </h3>
          <p className="text-gray-600 mt-2">{request.description}</p>
          {request.requester && (
            <div className="mt-2 text-sm text-gray-500">
              建立者: {request.requester.name} ({request.requester.organization})
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
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
          <Users className="w-4 h-4" />
          需要 {request.required_volunteers} 人
        </div>
      </div>
    </div>
  );
}

function RequestForm({ request = null, onClose, onSubmit, isEdit = false }) {
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

  const handleSubmit = () => {
    if (!formData.village || !formData.street || !formData.contact_name || !formData.contact_phone || !formData.description) {
      alert('請填寫所有必填欄位');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEdit ? '編輯需求' : '新增需求'}
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="請輸入需要的志工人數"
                inputMode="numeric"
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
              placeholder="詳細描述救災需求..."
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
              placeholder="其他備註..."
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold transition shadow-lg"
            >
              {isEdit ? '更新' : '建立需求'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 派單管理頁面 ====================
function AssignmentManagementPage() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
      <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-800 mb-2">派單管理</h3>
      <p className="text-gray-600">此功能正在開發中...</p>
    </div>
  );
}

// ==================== 管理員登入畫面 ====================
function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 模拟登入验证（实际应该调用后端 API）
    setTimeout(() => {
      // 默认管理员账号
      if (username === 'admin' && password === 'perryhuang') {
        onLogin({
          username: 'admin',
          role: 'administrator',
          loginTime: new Date().toISOString()
        });
      } else {
        setError('帳號或密碼錯誤');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-6 rounded-3xl shadow-2xl mb-6">
            <Lock className="w-20 h-20 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            救災資源管理系統
          </h1>
          <p className="text-gray-600 text-lg">管理員登入</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                帳號
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder="請輸入帳號"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                密碼
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder="請輸入密碼"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  登入中...
                </div>
              ) : (
                '登入'
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>花蓮縣光復救災資源管理系統</p>
          <p className="mt-1">© 2025 美魔力 - 發現台灣最美的風景</p>
        </div>
      </div>
    </div>
  );
}