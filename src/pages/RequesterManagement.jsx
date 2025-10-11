import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { UserPlus, Check, X, Eye, AlertCircle, Building2, Phone, User, FileText, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

// GraphQL 查詢所有需求者
const GET_REQUESTERS = gql`
  query GetRequesters {
    requesters(order_by: { created_at: desc }) {
      id
      name
      phone
      organization
      notes
      status
      created_at
      updated_at
      approved_at
      approved_by
      rejection_reason
    }
  }
`;

// GraphQL 新增需求者（管理員直接核准）
const CREATE_REQUESTER = gql`
  mutation CreateRequester(
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
        status: "approved"
        approved_at: "now()"
        approved_by: "管理員"
      }
    ) {
      id
      name
      status
    }
  }
`;

// GraphQL 核准需求者
const APPROVE_REQUESTER = gql`
  mutation ApproveRequester($id: uuid!) {
    update_requesters_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: "approved"
        approved_at: "now()"
        approved_by: "管理員"
      }
    ) {
      id
      name
      status
      approved_at
    }
  }
`;

// GraphQL 拒絕需求者
const REJECT_REQUESTER = gql`
  mutation RejectRequester($id: uuid!, $reason: String) {
    update_requesters_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: "rejected"
        rejection_reason: $reason
      }
    ) {
      id
      name
      status
      rejection_reason
    }
  }
`;

// GraphQL 更新需求者
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
        updated_at: "now()"
      }
    ) {
      id
      name
      phone
      organization
      notes
    }
  }
`;

// GraphQL 刪除需求者
const DELETE_REQUESTER = gql`
  mutation DeleteRequester($id: uuid!) {
    delete_requesters_by_pk(id: $id) {
      id
      name
    }
  }
`;

export default function RequesterManagement() {
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedRequester, setSelectedRequester] = useState(null);
  const [editingRequester, setEditingRequester] = useState(null);

  // 查詢所有需求者
  const { data, loading, error, refetch } = useQuery(GET_REQUESTERS, {
    pollInterval: 10000 // 每10秒自動更新
  });

  // Mutations
  const [createRequester, { loading: creating }] = useMutation(CREATE_REQUESTER, {
    refetchQueries: [{ query: GET_REQUESTERS }],
    onCompleted: () => {
      alert('✅ 需求者新增成功！');
      setShowForm(false);
    },
    onError: (error) => {
      alert('❌ 新增失敗：' + error.message);
    }
  });

  const [approveRequester, { loading: approving }] = useMutation(APPROVE_REQUESTER, {
    refetchQueries: [{ query: GET_REQUESTERS }],
    onCompleted: () => {
      alert('✅ 已核准！需求者現在可以登入系統');
    },
    onError: (error) => {
      alert('❌ 核准失敗：' + error.message);
    }
  });

  const [rejectRequester, { loading: rejecting }] = useMutation(REJECT_REQUESTER, {
    refetchQueries: [{ query: GET_REQUESTERS }],
    onCompleted: () => {
      alert('✅ 已拒絕申請');
    },
    onError: (error) => {
      alert('❌ 拒絕失敗：' + error.message);
    }
  });

  const [updateRequester, { loading: updating }] = useMutation(UPDATE_REQUESTER, {
    refetchQueries: [{ query: GET_REQUESTERS }],
    onCompleted: () => {
      alert('✅ 更新成功！');
      setEditingRequester(null);
    },
    onError: (error) => {
      alert('❌ 更新失敗：' + error.message);
    }
  });

  const [deleteRequester, { loading: deleting }] = useMutation(DELETE_REQUESTER, {
    refetchQueries: [{ query: GET_REQUESTERS }],
    onCompleted: () => {
      alert('✅ 刪除成功！');
    },
    onError: (error) => {
      alert('❌ 刪除失敗：' + error.message);
    }
  });

  const requesters = data?.requesters || [];

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

  // 處理核准
  const handleApprove = (requesterId) => {
    if (window.confirm('確定要核准此需求者嗎？\n核准後該帳號即可登入系統')) {
      approveRequester({ variables: { id: requesterId } });
    }
  };

  // 處理拒絕
  const handleReject = (requesterId) => {
    const reason = prompt('請輸入拒絕原因：\n（此訊息將顯示給需求者）');
    if (reason !== null && reason.trim() !== '') {
      rejectRequester({ 
        variables: { 
          id: requesterId,
          reason: reason.trim()
        } 
      });
    } else if (reason !== null) {
      alert('請輸入拒絕原因');
    }
  };

  // 處理刪除
  const handleDelete = (requesterId, name) => {
    if (window.confirm(`確定要刪除需求者「${name}」嗎？\n此操作無法復原！`)) {
      deleteRequester({ variables: { id: requesterId } });
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
        <button onClick={() => refetch()} className="mt-4 text-red-600 hover:text-red-800 font-semibold">
          重新載入
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題區 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-600">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-red-600" />
              需求者管理
            </h2>
            <p className="text-gray-600 mt-1">管理可建立救災需求的單位與人員</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            disabled={creating}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            新增需求者
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="總數" value={stats.total} color="blue" icon={<User />} />
        <StatCard label="待審核" value={stats.pending} color="yellow" icon={<Clock />} />
        <StatCard label="已核准" value={stats.approved} color="green" icon={<CheckCircle />} />
        <StatCard label="已拒絕" value={stats.rejected} color="red" icon={<XCircle />} />
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待審核' },
            { key: 'approved', label: '已核准' },
            { key: 'rejected', label: '已拒絕' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
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

      {/* 需求者列表 */}
      <div className="space-y-4">
        {filteredRequesters.map(requester => (
          <RequesterCard 
            key={requester.id}
            requester={requester}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            onView={() => setSelectedRequester(requester)}
            onEdit={() => setEditingRequester(requester)}
            isProcessing={approving || rejecting || deleting}
          />
        ))}
        
        {filteredRequesters.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">目前沒有符合條件的需求者</p>
          </div>
        )}
      </div>

      {/* 新增表單 */}
      {showForm && (
        <RequesterForm 
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createRequester({ variables: data })}
          loading={creating}
        />
      )}

      {/* 編輯表單 */}
      {editingRequester && (
        <RequesterForm 
          onClose={() => setEditingRequester(null)}
          onSubmit={(data) => updateRequester({ 
            variables: { 
              id: editingRequester.id,
              ...data 
            } 
          })}
          initialData={editingRequester}
          loading={updating}
          isEdit
        />
      )}

      {/* 詳情檢視 */}
      {selectedRequester && (
        <RequesterDetail 
          requester={selectedRequester}
          onClose={() => setSelectedRequester(null)}
        />
      )}
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
function RequesterCard({ requester, onApprove, onReject, onDelete, onView, onEdit, isProcessing }) {
  const statusConfig = {
    pending: { label: '待審核', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    approved: { label: '已核准', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    rejected: { label: '已拒絕', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
  };

  const config = statusConfig[requester.status];

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${config.border} hover:shadow-xl transition-all`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
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
            {requester.organization && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>{requester.organization}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-sm">申請: {new Date(requester.created_at).toLocaleString('zh-TW')}</span>
            </div>
            {requester.notes && (
              <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span className="text-sm">{requester.notes}</span>
              </div>
            )}
          </div>

          {requester.status === 'approved' && requester.approved_at && (
            <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              核准: {new Date(requester.approved_at).toLocaleString('zh-TW')} ({requester.approved_by})
            </div>
          )}

          {requester.status === 'rejected' && requester.rejection_reason && (
            <div className="mt-3 text-sm text-red-600 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              拒絕原因: {requester.rejection_reason}
            </div>
          )}
        </div>

        <div className="flex flex-row lg:flex-col gap-2">
          <button
            onClick={onView}
            className="flex-1 lg:flex-none bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">詳情</span>
          </button>

          <button
            onClick={onEdit}
            className="flex-1 lg:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">編輯</span>
          </button>
          
          {requester.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(requester.id)}
                disabled={isProcessing}
                className="flex-1 lg:flex-none bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">核准</span>
              </button>
              <button
                onClick={() => onReject(requester.id)}
                disabled={isProcessing}
                className="flex-1 lg:flex-none bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">拒絕</span>
              </button>
            </>
          )}

          <button
            onClick={() => onDelete(requester.id, requester.name)}
            disabled={isProcessing}
            className="flex-1 lg:flex-none bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">刪除</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 表單元件
function RequesterForm({ onClose, onSubmit, initialData = null, loading = false, isEdit = false }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    phone: '',
    organization: '',
    notes: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      alert('請填寫必填欄位（姓名和電話）');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEdit ? '編輯需求者' : '新增需求者'}
          </h3>
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              placeholder="0912-345-678"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              placeholder="例：光復鄉公所、村辦公室"
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              {loading ? '處理中...' : isEdit ? '更新' : '儲存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 詳情檢視
function RequesterDetail({ requester, onClose }) {
  const statusMap = {
    pending: '待審核',
    approved: '已核准',
    rejected: '已拒絕'
  };

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
          <DetailRow label="ID" value={requester.id} />
          <DetailRow label="姓名" value={requester.name} />
          <DetailRow label="電話" value={requester.phone} />
          <DetailRow label="所屬單位" value={requester.organization || '未填寫'} />
          <DetailRow label="狀態" value={statusMap[requester.status]} />
          <DetailRow label="申請時間" value={new Date(requester.created_at).toLocaleString('zh-TW')} />
          {requester.notes && <DetailRow label="備註" value={requester.notes} />}
          {requester.approved_at && (
            <>
              <DetailRow label="核准時間" value={new Date(requester.approved_at).toLocaleString('zh-TW')} />
              <DetailRow label="核准者" value={requester.approved_by} />
            </>
          )}
          {requester.rejection_reason && (
            <DetailRow label="拒絕原因" value={requester.rejection_reason} />
          )}
          {requester.updated_at && requester.updated_at !== requester.created_at && (
            <DetailRow label="最後更新" value={new Date(requester.updated_at).toLocaleString('zh-TW')} />
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
      <div className="flex-1 text-gray-800 break-words">{value}</div>
    </div>
  );
}