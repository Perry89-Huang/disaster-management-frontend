import React, { useState } from 'react';
import { UserPlus, Check, X, Eye, AlertCircle, Building2, Phone, User, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

// 模擬資料 - 實際使用時替換為 GraphQL 查詢
const mockRequesters = [
  {
    id: '1',
    name: '王小明',
    phone: '0912-345-678',
    organization: '光復鄉公所',
    status: 'pending',
    created_at: '2025-10-10 09:30',
    notes: '需要協助災後復原'
  },
  {
    id: '2',
    name: '李美華',
    phone: '0923-456-789',
    organization: '東富村辦公室',
    status: 'approved',
    created_at: '2025-10-09 14:20',
    approved_at: '2025-10-09 15:00',
    approved_by: '管理員'
  }
];

export default function RequesterManagement() {
  const [requesters, setRequesters] = useState(mockRequesters);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedRequester, setSelectedRequester] = useState(null);

  // 篩選需求者
  const filteredRequesters = requesters.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  // 統計
  const stats = {
    total: requesters.length,
    pending: requesters.filter(r => r.status === 'pending').length,
    approved: requesters.filter(r => r.status === 'approved').length,
    rejected: requesters.filter(r => r.status === 'rejected').length
  };

  // 審核需求者
  const handleApprove = (requesterId) => {
    if (window.confirm('確定要核准此需求者嗎？')) {
      setRequesters(prev => prev.map(r => 
        r.id === requesterId 
          ? { ...r, status: 'approved', approved_at: new Date().toISOString(), approved_by: '管理員' }
          : r
      ));
      alert('✅ 審核通過！');
    }
  };

  const handleReject = (requesterId) => {
    const reason = prompt('請輸入拒絕原因：');
    if (reason) {
      setRequesters(prev => prev.map(r => 
        r.id === requesterId 
          ? { ...r, status: 'rejected', rejection_reason: reason }
          : r
      ));
      alert('✅ 已拒絕申請');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題區 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-red-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-red-600" />
                需求者管理
              </h1>
              <p className="text-gray-600 mt-2">管理創建需求的單位與人員</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <UserPlus className="w-5 h-5" />
              新增需求者
            </button>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="總數" value={stats.total} color="blue" icon={<User />} />
          <StatCard label="待審核" value={stats.pending} color="yellow" icon={<Clock />} />
          <StatCard label="已核准" value={stats.approved} color="green" icon={<CheckCircle />} />
          <StatCard label="已拒絕" value={stats.rejected} color="red" icon={<XCircle />} />
        </div>

        {/* 篩選器 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                  filter === status
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '全部' : 
                 status === 'pending' ? '待審核' :
                 status === 'approved' ? '已核准' : '已拒絕'}
              </button>
            ))}
          </div>
        </div>

        {/* 需求者列表 */}
        <div className="space-y-4">
          {filteredRequesters.map(requester => (
            <RequesterCard 
              key={requester.id}
              requester={requester}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={() => setSelectedRequester(requester)}
            />
          ))}
          
          {filteredRequesters.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">目前沒有符合條件的需求者</p>
            </div>
          )}
        </div>

        {/* 新增需求者表單 */}
        {showForm && (
          <RequesterForm 
            onClose={() => setShowForm(false)}
            onSubmit={(data) => {
              setRequesters(prev => [...prev, {
                ...data,
                id: String(prev.length + 1),
                status: 'approved',
                created_at: new Date().toISOString()
              }]);
              setShowForm(false);
              alert('✅ 需求者新增成功！');
            }}
          />
        )}

        {/* 需求者詳情 */}
        {selectedRequester && (
          <RequesterDetail 
            requester={selectedRequester}
            onClose={() => setSelectedRequester(null)}
          />
        )}
      </div>
    </div>
  );
}

// 統計卡片
function StatCard({ label, value, color, icon }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-3xl font-bold">{value}</div>
        <div className="opacity-80">{icon}</div>
      </div>
      <div className="text-sm opacity-90 font-medium">{label}</div>
    </div>
  );
}

// 需求者卡片
function RequesterCard({ requester, onApprove, onReject, onView }) {
  const statusConfig = {
    pending: { label: '待審核', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    approved: { label: '已核准', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    rejected: { label: '已拒絕', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
  };

  const config = statusConfig[requester.status];

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${config.border} hover:shadow-xl transition-all`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-gray-800">{requester.name}</h3>
            <span className={`${config.bg} ${config.text} px-4 py-1 rounded-full text-sm font-bold`}>
              {config.label}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-red-600" />
              <span>{requester.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4 text-red-600" />
              <span>{requester.organization}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-red-600" />
              <span>申請時間: {requester.created_at}</span>
            </div>
            {requester.notes && (
              <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span>{requester.notes}</span>
              </div>
            )}
          </div>

          {requester.status === 'approved' && requester.approved_at && (
            <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              核准時間: {requester.approved_at} (審核者: {requester.approved_by})
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col gap-2">
          <button
            onClick={onView}
            className="flex-1 md:flex-none bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden md:inline">詳情</span>
          </button>
          
          {requester.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(requester.id)}
                className="flex-1 md:flex-none bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span className="hidden md:inline">核准</span>
              </button>
              <button
                onClick={() => onReject(requester.id)}
                className="flex-1 md:flex-none bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span className="hidden md:inline">拒絕</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 新增需求者表單
function RequesterForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    organization: '',
    notes: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      alert('請填寫必填欄位');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-gray-800">新增需求者</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition">
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              placeholder="0912-345-678"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              placeholder="例：光復鄉公所、村辦公室"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              備註
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              rows="3"
              placeholder="其他說明..."
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
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 需求者詳情
function RequesterDetail({ requester, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-gray-800">需求者詳情</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <DetailRow label="姓名" value={requester.name} />
          <DetailRow label="電話" value={requester.phone} />
          <DetailRow label="所屬單位" value={requester.organization || '未填寫'} />
          <DetailRow label="申請時間" value={requester.created_at} />
          <DetailRow label="狀態" value={requester.status === 'pending' ? '待審核' : requester.status === 'approved' ? '已核准' : '已拒絕'} />
          {requester.notes && <DetailRow label="備註" value={requester.notes} />}
          {requester.approved_at && (
            <>
              <DetailRow label="核准時間" value={requester.approved_at} />
              <DetailRow label="審核者" value={requester.approved_by} />
            </>
          )}
          {requester.rejection_reason && (
            <DetailRow label="拒絕原因" value={requester.rejection_reason} />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex border-b border-gray-100 pb-3">
      <div className="w-32 font-semibold text-gray-600">{label}</div>
      <div className="flex-1 text-gray-800">{value}</div>
    </div>
  );
}