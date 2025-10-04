import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  AlertCircle, CheckCircle, Clock, Users, FileText, 
  UserPlus, Send, X, Edit, Trash2, Save, AlertTriangle,
  Power, XCircle, Ban, MapPin, User, Phone
} from 'lucide-react';
import {
  GET_VOLUNTEERS,
  GET_REQUESTS,
  GET_ASSIGNMENTS,
  GET_DASHBOARD_STATS,
  GET_AVAILABLE_VOLUNTEERS,
  GET_PENDING_REQUESTS
} from '../graphql/queries';
import {
  CREATE_VOLUNTEER,
  UPDATE_VOLUNTEER,
  DELETE_VOLUNTEER,
  CREATE_REQUEST,
  UPDATE_REQUEST,
  ASSIGN_VOLUNTEER,
  CANCEL_ASSIGNMENT
} from '../graphql/mutations';

export default function AdminApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const user = { role: 'admin', id: '1', name: '管理員' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">花蓮縣光復救災資源管理系統</h1>
                <p className="text-xs text-red-100 hidden sm:block">Disaster Resource Management System v2.0</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm">
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            <TabButton active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} icon={<FileText className="w-4 h-4" />}>
              儀表板
            </TabButton>
            <TabButton active={currentPage === 'volunteers'} onClick={() => setCurrentPage('volunteers')} icon={<Users className="w-4 h-4" />}>
              志工管理
            </TabButton>
            <TabButton active={currentPage === 'requests'} onClick={() => setCurrentPage('requests')} icon={<AlertTriangle className="w-4 h-4" />}>
              需求管理
            </TabButton>
            <TabButton active={currentPage === 'assignments'} onClick={() => setCurrentPage('assignments')} icon={<Send className="w-4 h-4" />}>
              派單管理
            </TabButton>
          </div>
        </div>

        <div className="space-y-6">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'volunteers' && <VolunteerManagement />}
          {currentPage === 'requests' && <RequestManagement />}
          {currentPage === 'assignments' && <AssignmentManagement />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button onClick={onClick} className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all whitespace-nowrap border-b-3 ${active ? 'text-red-600 border-b-4 border-red-600 bg-red-50' : 'text-gray-600 border-b-4 border-transparent hover:text-red-600 hover:bg-gray-50'}`}>
      {icon}
      <span className="text-sm sm:text-base font-semibold">{children}</span>
    </button>
  );
}

function Dashboard() {
  const { loading, error, data } = useQuery(GET_DASHBOARD_STATS, {
    pollInterval: 5000
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入中...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
      <div className="flex items-center">
        <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
        <p className="text-red-700 font-medium">錯誤: {error.message}</p>
      </div>
    </div>
  );

  const stats = [
    { label: '已上線志工', value: data?.available_volunteers?.aggregate?.count || 0, color: 'emerald', bgColor: 'bg-gradient-to-br from-emerald-400 to-emerald-600', icon: <Users className="w-8 h-8" />, detail: 'available' },
    { label: '離線志工', value: data?.offline_volunteers?.aggregate?.count || 0, color: 'gray', bgColor: 'bg-gradient-to-br from-gray-400 to-gray-600', icon: <Power className="w-8 h-8" />, detail: 'off' },
    { label: '執行中志工', value: data?.assigned_volunteers?.aggregate?.count || 0, color: 'blue', bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600', icon: <CheckCircle className="w-8 h-8" />, detail: 'assigned' },
    { label: '待支援需求', value: data?.pending_requests?.aggregate?.count || 0, color: 'red', bgColor: 'bg-gradient-to-br from-red-400 to-red-600', icon: <AlertTriangle className="w-8 h-8" />, detail: 'pending' },
    { label: '派單中需求', value: data?.assigning_requests?.aggregate?.count || 0, color: 'yellow', bgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-600', icon: <Clock className="w-8 h-8" />, detail: 'assigning' },
    { label: '進行中需求', value: data?.in_progress_requests?.aggregate?.count || 0, color: 'indigo', bgColor: 'bg-gradient-to-br from-indigo-400 to-indigo-600', icon: <Send className="w-8 h-8" />, detail: 'in_progress' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl text-white shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2 font-medium">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-gray-800">{stat.value}</p>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{stat.detail}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 狀態流程說明 */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl text-white mr-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">系統狀態流程</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 志工狀態流程 */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">志工狀態流程</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-700">off（離線）→ V4上線 → available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">available → A1派單 → assigning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">assigning → V1確認 → assigned</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">assigned → V3完成 → available</span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                <p className="text-xs text-red-700">💡 每日凌晨系統自動重置所有志工為 off</p>
              </div>
            </div>
          </div>

          {/* 需求狀態流程 */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h3 className="font-bold text-orange-800 mb-3">需求狀態流程</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">A3/R1建立 → pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">pending → A1派單 → assigning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-700">assigning → V1確認 → in_progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">in_progress → V3完成 → completed</span>
              </div>
            </div>
          </div>

          {/* 派單狀態流程 */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3">派單狀態流程</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">A1派單 → pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">pending → V1確認 → confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">pending → V2拒絕 → rejected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-700">任何 → A2取消 → cancelled</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">confirmed → V3完成 → completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 系統資訊 */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl text-white mr-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">系統資訊</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-sm text-green-700 font-medium">已連接到 Hasura GraphQL API v2.43.0</span>
          </div>
          <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Clock className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-sm text-blue-700 font-medium">資料每 5 秒自動更新</span>
          </div>
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Power className="w-5 h-5 text-yellow-600 mr-3" />
            <span className="text-sm text-yellow-700 font-medium">系統每日凌晨自動重置志工狀態為 off</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VolunteerManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);

  const { loading, error, data } = useQuery(GET_VOLUNTEERS, {
    pollInterval: 5000
  });
  
  const [createVolunteer] = useMutation(CREATE_VOLUNTEER, {
    refetchQueries: [{ query: GET_VOLUNTEERS }, { query: GET_DASHBOARD_STATS }]
  });
  
  const [updateVolunteer] = useMutation(UPDATE_VOLUNTEER, {
    refetchQueries: [{ query: GET_VOLUNTEERS }, { query: GET_DASHBOARD_STATS }]
  });
  
  const [deleteVolunteer] = useMutation(DELETE_VOLUNTEER, {
    refetchQueries: [{ query: GET_VOLUNTEERS }, { query: GET_DASHBOARD_STATS }]
  });

  const statusConfig = {
    off: { label: '離線', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    available: { label: '已上線', color: 'bg-green-100 text-green-800 border-green-200' },
    assigning: { label: '派單中', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    assigned: { label: '執行中', color: 'bg-blue-100 text-blue-800 border-blue-200' }
  };

  const handleEdit = (volunteer) => {
    setEditingVolunteer(volunteer);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此志工嗎？')) return;
    
    try {
      await deleteVolunteer({ variables: { id } });
      alert('刪除成功！');
    } catch (err) {
      console.error('刪除失敗:', err);
      alert('刪除失敗: ' + err.message);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingVolunteer) {
        await updateVolunteer({
          variables: {
            id: editingVolunteer.id,
            ...formData
          }
        });
        alert('更新成功！');
      } else {
        await createVolunteer({
          variables: {
            object: formData
          }
        });
        alert('新增成功！');
      }
      setShowForm(false);
      setEditingVolunteer(null);
    } catch (err) {
      console.error('操作失敗:', err);
      alert('操作失敗: ' + err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
      <p className="text-red-700">錯誤: {error.message}</p>
    </div>
  );

  const volunteers = data?.volunteers || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">志工管理</h2>
          <p className="text-gray-600">管理救災志工資訊與狀態</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto justify-center font-medium">
          <UserPlus className="w-5 h-5" />
          <span>新增志工</span>
        </button>
      </div>

      {showForm && <VolunteerForm onClose={() => setShowForm(false)} />}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">電話</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">人數</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {volunteers.map((vol) => (
                <tr key={vol.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {vol.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{vol.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vol.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {vol.member_count} 人
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[vol.status]?.color}`}>
                      {statusConfig[vol.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <button className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium transition">
                      <Edit className="w-4 h-4 mr-1" />編輯
                    </button>
                    <button className="text-red-600 hover:text-red-800 inline-flex items-center font-medium transition">
                      <Trash2 className="w-4 h-4 mr-1" />刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VolunteerForm({ volunteer, onClose, onSave }) {
  const [formData, setFormData] = useState(volunteer ? {
    name: volunteer.name,
    phone: volunteer.phone,
    member_count: volunteer.member_count,
    nickname: volunteer.nickname || '',
    notes: volunteer.notes || ''
  } : {
    name: '',
    phone: '',
    member_count: 1,
    nickname: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('請填寫必要欄位');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{volunteer ? '編輯志工' : '新增志工'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition">
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">姓名 *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" 
              placeholder="請輸入姓名"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">電話 *</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" 
              placeholder="0912-345-678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">暱稱</label>
            <input 
              type="text" 
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" 
              placeholder="選填"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">人數</label>
            <input 
              type="number" 
              min="1" 
              value={formData.member_count}
              onChange={(e) => setFormData({...formData, member_count: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">附註</label>
            <textarea 
              rows="3" 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              placeholder="其他備註資訊..."
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-8">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            取消
          </button>
          <button 
            type="submit" 
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition shadow-lg font-medium"
          >
            <Save className="w-4 h-4" />
            <span>儲存</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function RequestManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // 查詢所有需求
  const { loading, error, data } = useQuery(GET_REQUESTS, {
    pollInterval: 5000
  });

  // Mutations
  const [createRequest] = useMutation(CREATE_REQUEST, {
    refetchQueries: [{ query: GET_REQUESTS }, { query: GET_DASHBOARD_STATS }]
  });

  const [updateRequest] = useMutation(UPDATE_REQUEST, {
    refetchQueries: [{ query: GET_REQUESTS }, { query: GET_DASHBOARD_STATS }]
  });

  const [deleteRequestMutation] = useMutation(gql`
    mutation DeleteRequest($id: uuid!) {
      delete_disaster_requests_by_pk(id: $id) {
        id
      }
    }
  `, {
    refetchQueries: [{ query: GET_REQUESTS }, { query: GET_DASHBOARD_STATS }]
  });

  const statusConfig = {
    pending: { label: '待支援', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: <AlertTriangle /> },
    assigning: { label: '派單中', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Clock /> },
    in_progress: { label: '進行中', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Send /> },
    completed: { label: '已完成', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: <CheckCircle /> }
  };

  const priorityConfig = {
    urgent: { label: '緊急', color: 'bg-red-100 text-red-800 border-red-300' },
    high: { label: '高', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    normal: { label: '普通', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    low: { label: '低', color: 'bg-gray-100 text-gray-800 border-gray-300' }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此需求嗎？此操作無法復原！')) return;
    
    try {
      await deleteRequestMutation({ variables: { id } });
      alert('刪除成功！');
    } catch (err) {
      console.error('刪除失敗:', err);
      alert('刪除失敗: ' + err.message);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingRequest) {
        // 更新需求
        await updateRequest({
          variables: {
            id: editingRequest.id,
            ...formData
          }
        });
        alert('更新成功！');
      } else {
        // 新增需求 (A3 操作)
        await createRequest({
          variables: {
            ...formData,
            created_by: 'admin'
          }
        });
        alert('新增成功！');
      }
      setShowForm(false);
      setEditingRequest(null);
    } catch (err) {
      console.error('操作失敗:', err);
      alert('操作失敗: ' + err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入中...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
      <div className="flex items-center">
        <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
        <p className="text-red-700 font-medium">錯誤: {error.message}</p>
      </div>
    </div>
  );

  const requests = data?.disaster_requests || [];
  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    assigning: requests.filter(r => r.status === 'assigning').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* 標題與按鈕 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">需求管理</h2>
          <p className="text-gray-600">管理受災戶的救援需求（A3: 建立需求）</p>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditingRequest(null); }}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto justify-center font-medium"
        >
          <UserPlus className="w-5 h-5" />
          <span>新增需求 (A3)</span>
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-700 text-sm font-semibold">待支援</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-800">{stats.pending}</p>
          <p className="text-xs text-orange-600 mt-1">pending</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-700 text-sm font-semibold">派單中</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-800">{stats.assigning}</p>
          <p className="text-xs text-yellow-600 mt-1">assigning</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 text-sm font-semibold">進行中</span>
            <Send className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-800">{stats.in_progress}</p>
          <p className="text-xs text-blue-600 mt-1">in_progress</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 text-sm font-semibold">已完成</span>
            <CheckCircle className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
          <p className="text-xs text-gray-600 mt-1">completed</p>
        </div>
      </div>

      {/* 篩選按鈕 */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <FilterButton label="全部" active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} count={requests.length} />
        <FilterButton label="待支援" active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')} count={stats.pending} color="orange" />
        <FilterButton label="派單中" active={filterStatus === 'assigning'} onClick={() => setFilterStatus('assigning')} count={stats.assigning} color="yellow" />
        <FilterButton label="進行中" active={filterStatus === 'in_progress'} onClick={() => setFilterStatus('in_progress')} count={stats.in_progress} color="blue" />
        <FilterButton label="已完成" active={filterStatus === 'completed'} onClick={() => setFilterStatus('completed')} count={stats.completed} color="gray" />
      </div>

      {/* 表單 */}
      {showForm && (
        <RequestForm 
          request={editingRequest}
          onClose={() => { setShowForm(false); setEditingRequest(null); }}
          onSave={handleSave}
        />
      )}

      {/* 需求列表 */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">尚無需求資料</p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-4 text-red-600 hover:text-red-700 font-medium"
            >
              新增第一個需求 →
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100">
              {/* 頂部標籤與操作 */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center space-x-2 mb-3 flex-wrap gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${priorityConfig[req.priority]?.color || priorityConfig.normal.color}`}>
                      {priorityConfig[req.priority]?.label || req.priority}
                    </span>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border-2 ${statusConfig[req.status]?.color || statusConfig.pending.color}`}>
                      {React.cloneElement(statusConfig[req.status]?.icon || <AlertCircle />, { className: 'w-3 h-3' })}
                      <span>{statusConfig[req.status]?.label || req.status}</span>
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border-2 border-purple-300">
                      {req.request_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    建立時間: {new Date(req.created_at).toLocaleString('zh-TW')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(req)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow"
                  >
                    <Edit className="w-4 h-4" />
                    <span>編輯</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(req.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium shadow"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>刪除</span>
                  </button>
                </div>
              </div>

              {/* 需求詳細資訊 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">地點：</span>
                    <p className="text-gray-900">{req.village} {req.street}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">聯絡人：</span>
                    <p className="text-gray-900">{req.contact_name}</p>
                    <p className="text-gray-600 text-sm">{req.contact_phone}</p>
                  </div>
                </div>

                {req.required_volunteers > 0 && (
                  <div className="flex items-start space-x-2">
                    <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-700 text-sm">需要人數：</span>
                      <p className="text-gray-900">{req.required_volunteers} 人</p>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 flex items-start space-x-2">
                  <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700 text-sm">需求說明：</span>
                    <p className="text-gray-900 mt-1">{req.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick, count, color = 'red' }) {
  const colorClasses = {
    red: 'from-red-600 to-red-700',
    orange: 'from-orange-600 to-orange-700',
    yellow: 'from-yellow-600 to-yellow-700',
    blue: 'from-blue-600 to-blue-700',
    gray: 'from-gray-600 to-gray-700'
  };

  return (
    <button 
      onClick={onClick}
      className={`relative px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-md ${
        active 
          ? `bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg transform scale-105` 
          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? 'bg-white text-gray-800' : 'bg-red-100 text-red-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function RequestForm({ request, onClose, onSave }) {
  const [formData, setFormData] = useState(request ? {
    request_type: request.request_type,
    priority: request.priority,
    village: request.village,
    street: request.street,
    contact_name: request.contact_name,
    contact_phone: request.contact_phone,
    required_volunteers: request.required_volunteers || 0,
    description: request.description
  } : {
    request_type: '志工',
    priority: 'normal',
    village: '',
    street: '',
    contact_name: '',
    contact_phone: '',
    required_volunteers: 0,
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.village || !formData.street || !formData.contact_name || !formData.contact_phone || !formData.description) {
      alert('請填寫必要欄位');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{request ? '編輯需求' : 'A3: 新增需求'}</h3>
          <p className="text-sm text-gray-600 mt-1">建立者: 管理員 (admin)</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition">
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              需求類型 <span className="text-red-600">*</span>
            </label>
            <select 
              value={formData.request_type}
              onChange={(e) => setFormData({...formData, request_type: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            >
              <option value="志工">志工</option>
              <option value="物資">物資</option>
              <option value="志工+物資">志工+物資</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              優先順序 <span className="text-red-600">*</span>
            </label>
            <select 
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            >
              <option value="urgent">🔴 緊急</option>
              <option value="high">🟠 高</option>
              <option value="normal">🔵 普通</option>
              <option value="low">⚪ 低</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              村里 <span className="text-red-600">*</span>
            </label>
            <input 
              type="text" 
              placeholder="例: 東富村" 
              value={formData.village}
              onChange={(e) => setFormData({...formData, village: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              街道 <span className="text-red-600">*</span>
            </label>
            <input 
              type="text" 
              placeholder="例: 佛祖街15號" 
              value={formData.street}
              onChange={(e) => setFormData({...formData, street: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              聯絡人姓名 <span className="text-red-600">*</span>
            </label>
            <input 
              type="text" 
              value={formData.contact_name}
              onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" 
              placeholder="請輸入聯絡人姓名"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              聯絡電話 <span className="text-red-600">*</span>
            </label>
            <input 
              type="tel" 
              value={formData.contact_phone}
              onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" 
              placeholder="0912-345-678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              需要志工人數
            </label>
            <input 
              type="number" 
              min="0" 
              value={formData.required_volunteers}
              onChange={(e) => setFormData({...formData, required_volunteers: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" 
              placeholder="0 表示不限"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              需求說明 <span className="text-red-600">*</span>
            </label>
            <textarea 
              rows="4" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              placeholder="請詳細描述需求內容，例如：需要協助清理淤泥，約一層樓高，需要帶鏟子和水桶..."
              required
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-8">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            取消
          </button>
          <button 
            type="submit" 
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition shadow-lg font-medium"
          >
            <Save className="w-4 h-4" />
            <span>{request ? '更新' : '建立需求 (A3)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function AssignmentManagement() {
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const availableVolunteers = mockVolunteers.filter(v => v.status === 'available');
  const pendingRequests = mockRequests.filter(r => r.status === 'pending');

  const handleAssign = () => {
    if (selectedVolunteers.length === 0 || !selectedRequest) {
      alert('請選擇志工和需求');
      return;
    }
    alert(`A1: 管理員派單\n• 派單給 ${selectedVolunteers.length} 位志工\n• 志工狀態: available → assigning\n• 需求狀態: pending → assigning\n• 派單狀態: pending`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">派單管理（A1）</h2>
        <p className="text-gray-600">將待支援需求派單給已上線的志工</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">已上線志工 (available)</h3>
            <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-bold">{availableVolunteers.length} 位</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableVolunteers.map(vol => (
              <div key={vol.id} onClick={() => setSelectedVolunteers([vol.id])} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedVolunteers.includes(vol.id) ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{vol.name}</p>
                    <p className="text-sm text-gray-600">{vol.phone}</p>
                  </div>
                  {selectedVolunteers.includes(vol.id) && <CheckCircle className="w-6 h-6 text-red-600" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">待支援需求 (pending)</h3>
            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold">{pendingRequests.length} 件</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingRequests.map(req => (
              <div key={req.id} onClick={() => setSelectedRequest(req.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRequest === req.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{req.description}</p>
                    <p className="text-sm text-gray-600">📍 {req.village} {req.street}</p>
                  </div>
                  {selectedRequest === req.id && <CheckCircle className="w-6 h-6 text-red-600" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedVolunteers.length > 0 && selectedRequest && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-red-100 mb-1">準備派單（A1）</p>
              <p className="text-2xl font-bold">{selectedVolunteers.length} 位志工 → 1 件需求</p>
              <p className="text-sm text-red-100 mt-2">
                志工狀態: available → assigning | 需求狀態: pending → assigning
              </p>
            </div>
            <button onClick={handleAssign} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-red-600 px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg">
              <Send className="w-6 h-6" />
              <span>確認派單</span>
            </button>
          </div>
        </div>
      )}

      {/* 進行中的派單 */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">派單記錄</h3>
        <div className="space-y-3">
          {activeAssignments.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">目前沒有進行中的派單</p>
            </div>
          ) : (
            activeAssignments.map(assignment => {
              const statusConfig = {
                pending: { label: '待確認', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', detail: 'pending (等待志工確認)' },
                confirmed: { label: '已確認', color: 'bg-green-100 text-green-800 border-green-300', detail: 'confirmed (志工已接受)' },
                rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800 border-red-300', detail: 'rejected (志工已拒絕)' },
                cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800 border-gray-300', detail: 'cancelled (管理員已取消)' },
                completed: { label: '已完成', color: 'bg-blue-100 text-blue-800 border-blue-300', detail: 'completed (任務已完成)' }
              };

              const currentStatus = statusConfig[assignment.status] || statusConfig.pending;

              return (
                <div key={assignment.id} className="p-5 border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3 flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${currentStatus.color}`}>
                          {currentStatus.label}
                        </span>
                        <span className="text-xs text-gray-500">{currentStatus.detail}</span>
                      </div>
                      <p className="text-sm mb-2">
                        <span className="font-semibold text-gray-700">志工：</span>
                        <span className="text-gray-900">{assignment.volunteer?.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({assignment.volunteer?.phone})
                        </span>
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-semibold text-gray-700">任務：</span>
                        <span className="text-gray-900">{assignment.disaster_request?.description}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">地點：</span>
                        {assignment.disaster_request?.village} {assignment.disaster_request?.street}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        派單時間: {new Date(assignment.assigned_at).toLocaleString('zh-TW')}
                      </p>
                    </div>
                    {(assignment.status === 'pending' || assignment.status === 'confirmed') && (
                      <button 
                        onClick={() => handleCancelAssignment(assignment)}
                        className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium shadow ml-4"
                      >
                        <Ban className="w-4 h-4" />
                        <span>A2取消</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}