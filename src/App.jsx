// src/App.jsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  AlertCircle, CheckCircle, Clock, Users, FileText, 
  UserPlus, Send, X, Edit, Trash2, Save 
} from 'lucide-react';
import { 
  GET_VOLUNTEERS, 
  GET_REQUESTS, 
  GET_ASSIGNMENTS, 
  GET_DASHBOARD_STATS 
} from './graphql/queries';
import { 
  CREATE_VOLUNTEER, 
  UPDATE_VOLUNTEER, 
  DELETE_VOLUNTEER,
  CREATE_REQUEST,
  UPDATE_REQUEST,
  CREATE_ASSIGNMENT
} from './graphql/mutations';


export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const user = { role: 'admin', id: '1', name: '管理員' };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">花蓮縣光復救災資源管理系統</h1>
                <p className="text-xs text-red-100">Disaster Resource Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden sm:inline">{user.name}</span>
              <button className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg text-sm transition">
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow mb-6 overflow-x-auto">
          <div className="flex border-b min-w-max">
            <TabButton 
              active={currentPage === 'dashboard'} 
              onClick={() => setCurrentPage('dashboard')}
              icon={<FileText className="w-4 h-4" />}
            >
              儀表板
            </TabButton>
            <TabButton 
              active={currentPage === 'volunteers'} 
              onClick={() => setCurrentPage('volunteers')}
              icon={<Users className="w-4 h-4" />}
            >
              志工管理
            </TabButton>
            <TabButton 
              active={currentPage === 'requests'} 
              onClick={() => setCurrentPage('requests')}
              icon={<AlertCircle className="w-4 h-4" />}
            >
              需求管理
            </TabButton>
            <TabButton 
              active={currentPage === 'assignments'} 
              onClick={() => setCurrentPage('assignments')}
              icon={<Send className="w-4 h-4" />}
            >
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
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition whitespace-nowrap ${
        active
          ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
          : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="text-sm sm:text-base">{children}</span>
    </button>
  );
}

function Dashboard() {
  const { loading, error, data } = useQuery(GET_DASHBOARD_STATS, {
    pollInterval: 5000
  });

  if (loading) return <div className="text-center py-10">載入中...</div>;
  if (error) return <div className="text-center py-10 text-red-600">錯誤: {error.message}</div>;

  const stats = [
    { 
      label: '可用志工', 
      value: data?.available_volunteers?.aggregate?.count || 0, 
      color: 'green', 
      icon: <Users /> 
    },
    { 
      label: '待支援需求', 
      value: data?.pending_requests?.aggregate?.count || 0, 
      color: 'red', 
      icon: <AlertCircle /> 
    },
    { 
      label: '進行中任務', 
      value: data?.in_progress_assignments?.aggregate?.count || 0, 
      color: 'blue', 
      icon: <Clock /> 
    },
    { 
      label: '已完成任務', 
      value: data?.completed_assignments?.aggregate?.count || 0, 
      color: 'gray', 
      icon: <CheckCircle /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`text-${stat.color}-500 opacity-50`}>
                {React.cloneElement(stat.icon, { className: 'w-12 h-12' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">系統資訊</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>✅ 已連接到 Hasura GraphQL API</p>
          <p>✅ 資料每 5 秒自動更新</p>
          <p>🕒 最後更新: {new Date().toLocaleTimeString('zh-TW')}</p>
        </div>
      </div>
    </div>
  );
}

function VolunteerManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);

  const { loading, error, data } = useQuery(GET_VOLUNTEERS);
  const [createVolunteer] = useMutation(CREATE_VOLUNTEER, {
    refetchQueries: [{ query: GET_VOLUNTEERS }]
  });
  const [updateVolunteer] = useMutation(UPDATE_VOLUNTEER, {
    refetchQueries: [{ query: GET_VOLUNTEERS }]
  });
  const [deleteVolunteer] = useMutation(DELETE_VOLUNTEER, {
    refetchQueries: [{ query: GET_VOLUNTEERS }]
  });

  const statusConfig = {
    available: { label: '可派遣', color: 'green' },
    assigned: { label: '已派遣', color: 'blue' },
    busy: { label: '忙碌中', color: 'yellow' },
    inactive: { label: '不可用', color: 'gray' },
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
          variables: formData
        });
        alert('新增成功！');
      }
      setShowForm(false);
      setEditingVolunteer(null);
    } catch (err) {
      alert('操作失敗: ' + err.message);
    }
  };

  if (loading) return <div className="text-center py-10">載入中...</div>;
  if (error) return <div className="text-center py-10 text-red-600">錯誤: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-800">志工管理</h2>
        <button
          onClick={() => { setShowForm(true); setEditingVolunteer(null); }}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-5 h-5" />
          <span>新增志工</span>
        </button>
      </div>

      {showForm && (
        <VolunteerForm 
          volunteer={editingVolunteer}
          onClose={() => { setShowForm(false); setEditingVolunteer(null); }}
          onSave={handleSave}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">電話</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">人數</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.volunteers?.map((vol) => (
              <tr key={vol.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vol.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vol.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vol.member_count}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusConfig[vol.status]?.color || 'gray'}-100 text-${statusConfig[vol.status]?.color || 'gray'}-800`}>
                    {statusConfig[vol.status]?.label || vol.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button onClick={() => handleEdit(vol)} className="text-blue-600 hover:text-blue-800 inline-flex items-center">
                    <Edit className="w-4 h-4 mr-1" />編輯
                  </button>
                  <button onClick={() => handleDelete(vol.id)} className="text-red-600 hover:text-red-800 inline-flex items-center">
                    <Trash2 className="w-4 h-4 mr-1" />刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{volunteer ? '編輯志工' : '新增志工'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話 *</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">暱稱</label>
            <input 
              type="text" 
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">人數</label>
            <input 
              type="number" 
              min="1" 
              value={formData.member_count}
              onChange={(e) => setFormData({...formData, member_count: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">附註</label>
            <textarea 
              rows="3" 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">取消</button>
          <button type="submit" className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
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

  const { loading, error, data } = useQuery(GET_REQUESTS);
  const [createRequest] = useMutation(CREATE_REQUEST, {
    refetchQueries: [{ query: GET_REQUESTS }]
  });
  const [updateRequest] = useMutation(UPDATE_REQUEST, {
    refetchQueries: [{ query: GET_REQUESTS }]
  });

  const priorityConfig = {
    urgent: { label: '緊急', color: 'red' },
    high: { label: '高', color: 'orange' },
    normal: { label: '普通', color: 'blue' },
    low: { label: '低', color: 'gray' }
  };

  const handleSave = async (formData) => {
    try {
      if (editingRequest) {
        await updateRequest({
          variables: {
            id: editingRequest.id,
            ...formData
          }
        });
        alert('更新成功！');
      } else {
        await createRequest({
          variables: formData
        });
        alert('新增成功！');
      }
      setShowForm(false);
      setEditingRequest(null);
    } catch (err) {
      alert('操作失敗: ' + err.message);
    }
  };

  if (loading) return <div className="text-center py-10">載入中...</div>;
  if (error) return <div className="text-center py-10 text-red-600">錯誤: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-800">需求管理</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingRequest(null); }}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-5 h-5" />
          <span>新增需求</span>
        </button>
      </div>

      {showForm && (
        <RequestForm 
          request={editingRequest}
          onClose={() => { setShowForm(false); setEditingRequest(null); }}
          onSave={handleSave}
        />
      )}

      <div className="grid grid-cols-1 gap-4">
        {data?.disaster_requests?.map((req) => (
          <div key={req.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex-1 w-full">
                <div className="flex items-center space-x-2 mb-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${priorityConfig[req.priority]?.color || 'blue'}-100 text-${priorityConfig[req.priority]?.color || 'blue'}-800`}>
                    {priorityConfig[req.priority]?.label || req.priority}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {req.status === 'pending' ? '待派遣' : req.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{new Date(req.created_at).toLocaleString('zh-TW')}</p>
              </div>
              <div className="flex space-x-2 w-full sm:w-auto">
                <button 
                  onClick={() => { setEditingRequest(req); setShowForm(true); }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  編輯
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">需求類型：</span>
                <span className="text-gray-600">{req.request_type}</span>
              </div>
              {req.required_volunteers > 0 && (
                <div>
                  <span className="font-medium text-gray-700">需要人數：</span>
                  <span className="text-gray-600">{req.required_volunteers} 人</span>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="font-medium text-gray-700">地點：</span>
                <span className="text-gray-600">{req.township} {req.village} {req.street}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-medium text-gray-700">聯絡人：</span>
                <span className="text-gray-600">{req.contact_name} {req.contact_phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-medium text-gray-700">需求說明：</span>
                <span className="text-gray-600">{req.description}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{request ? '編輯需求' : '新增需求'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">需求類型 *</label>
            <select 
              value={formData.request_type}
              onChange={(e) => setFormData({...formData, request_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="志工">志工</option>
              <option value="物資">物資</option>
              <option value="物資+志工">志工+物資</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">優先順序</label>
            <select 
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="urgent">緊急</option>
              <option value="high">高</option>
              <option value="normal">普通</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">村里 *</label>
            <input 
              type="text" 
              placeholder="東富村" 
              value={formData.village}
              onChange={(e) => setFormData({...formData, village: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">街道 *</label>
            <input 
              type="text" 
              placeholder="佛祖街" 
              value={formData.street}
              onChange={(e) => setFormData({...formData, street: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聯絡人 *</label>
            <input 
              type="text" 
              value={formData.contact_name}
              onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話 *</label>
            <input 
              type="tel" 
              value={formData.contact_phone}
              onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">需要人數</label>
            <input 
              type="number" 
              min="0" 
              value={formData.required_volunteers}
              onChange={(e) => setFormData({...formData, required_volunteers: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">需求說明 *</label>
            <textarea 
              rows="3" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              required
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">取消</button>
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">儲存</button>
        </div>
      </form>
    </div>
  );
}

function AssignmentManagement() {
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data: volunteersData } = useQuery(GET_VOLUNTEERS);
  const { data: requestsData } = useQuery(GET_REQUESTS);
  const { data: assignmentsData } = useQuery(GET_ASSIGNMENTS);
  
  const [createAssignment] = useMutation(CREATE_ASSIGNMENT, {
    refetchQueries: [
      { query: GET_ASSIGNMENTS },
      { query: GET_VOLUNTEERS },
      { query: GET_REQUESTS }
    ]
  });

  const availableVolunteers = volunteersData?.volunteers?.filter(v => v.status === 'available') || [];
  const pendingRequests = requestsData?.disaster_requests?.filter(r => r.status === 'pending') || [];
  const activeAssignments = assignmentsData?.assignments || [];

  const toggleVolunteer = (id) => {
    setSelectedVolunteers(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const statusConfig = {
    pending: { label: '待確認', color: 'yellow' },
    confirmed: { label: '已確認', color: 'green' },
    in_progress: { label: '進行中', color: 'blue' },
    completed: { label: '已完成', color: 'gray' },
  };

  const handleAssign = async () => {
    if (selectedVolunteers.length === 0 || !selectedRequest) {
      alert('請選擇志工和需求');
      return;
    }

    try {
      for (const volunteerId of selectedVolunteers) {
        await createAssignment({
          variables: {
            volunteer_id: volunteerId,
            request_id: selectedRequest
          }
        });
      }
      alert(`已派單給 ${selectedVolunteers.length} 位志工！`);
      setSelectedVolunteers([]);
      setSelectedRequest(null);
    } catch (err) {
      alert('派單失敗: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">派單管理</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">可派遣志工</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {availableVolunteers.length} 位
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableVolunteers.map((vol) => (
              <div
                key={vol.id}
                onClick={() => toggleVolunteer(vol.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedVolunteers.includes(vol.id)
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-gray-800">{vol.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{vol.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">可派遣人數: {vol.member_count} 人</p>
                  </div>
                  {selectedVolunteers.includes(vol.id) && (
                    <CheckCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">待支援需求</h3>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {pendingRequests.length} 件
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedRequest === req.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-1 font-medium">{req.description}</p>
                    <p className="text-sm text-gray-600">{req.village} {req.street}</p>
                    <p className="text-sm text-gray-600 mt-1">需要人數: {req.required_volunteers} 人</p>
                  </div>
                  {selectedRequest === req.id && (
                    <CheckCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedVolunteers.length > 0 && selectedRequest && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-600">已選擇</p>
              <p className="text-lg font-bold text-gray-800">
                {selectedVolunteers.length} 位志工 → 1 件需求
              </p>
            </div>
            <button 
              onClick={handleAssign}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition"
            >
              <Send className="w-5 h-5" />
              <span className="font-medium">確認派單</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">進行中的派單</h3>
        <div className="space-y-3">
          {activeAssignments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">目前沒有進行中的派單</p>
          ) : (
            activeAssignments.map((assignment) => (
              <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusConfig[assignment.status]?.color || 'gray'}-100 text-${statusConfig[assignment.status]?.color || 'gray'}-800`}>
                        {statusConfig[assignment.status]?.label || assignment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">志工：</span>{assignment.volunteer?.name}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">任務：</span>{assignment.disaster_request?.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(assignment.assigned_at).toLocaleString('zh-TW')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}