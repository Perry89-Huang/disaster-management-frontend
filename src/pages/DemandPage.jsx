import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  MapPin, 
  Phone, 
  User, 
  Users, 
  AlertCircle,
  Filter,
  X,
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';

// GraphQL 查詢 - 取得待支援的需求
const GET_AVAILABLE_DEMANDS = gql`
  query GetAvailableDemands {
    disaster_requests(
      where: { status: { _in: ["pending", "in_progress"] } }
      order_by: [{ priority: asc }, { created_at: desc }]
    ) {
      id
      request_type
      priority
      township
      village
      street
      address_detail
      contact_name
      contact_phone
      description
      notes
      required_volunteers
      status
      created_at
      assignments_aggregate(
        where: { status: { _in: ["pending", "confirmed", "completed"] } }
      ) {
        aggregate {
          count
        }
      }
      assignments(
        where: { status: { _in: ["pending", "confirmed", "completed"] } }
      ) {
        volunteer {
          id
          member_count
        }
      }
    }
  }
`;

// GraphQL Mutation - 志工申請服務需求
const VOLUNTEER_APPLY_DEMAND = gql`
  mutation VolunteerApplyDemand(
    $volunteer_id: uuid!
    $request_id: uuid!
  ) {
    # 插入分配記錄（允許同一志工重複申請）
    insert_assignments_one(
      object: {
        volunteer_id: $volunteer_id
        request_id: $request_id
        status: "confirmed"
        assigned_at: "now()"
      }
    ) {
      id
      status
      assigned_at
    }
    
    # 更新志工狀態
    update_volunteers_by_pk(
      pk_columns: { id: $volunteer_id }
      _set: { status: "assigned" }
    ) {
      id
      status
    }

    # 更新需求狀態
    update_disaster_requests_by_pk(
      pk_columns: { id: $request_id }
      _set: { status: "in_progress" }
    ) {
      id
      status
    }
  }
`;

export default function DemandPage({ volunteer, setVolunteer }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    requestType: 'all',
    priority: 'all',
    village: 'all',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 每頁顯示10個需求

  // 查詢需求資料
  const { data, loading, error, refetch } = useQuery(GET_AVAILABLE_DEMANDS, {
    pollInterval: 10000 // 每10秒更新一次
  });

  // 申請服務需求
  const [applyDemand, { loading: applying }] = useMutation(VOLUNTEER_APPLY_DEMAND, {
    onCompleted: (data) => {
      alert('✅ 申請成功！');
      // 更新志工狀態為執行中
      const updatedStatus = data?.update_volunteers_by_pk?.status || 'assigned';
      setVolunteer(prev => ({ ...prev, status: updatedStatus }));
      refetch();
    },
    onError: (error) => {
      alert('❌ 申請失敗\n' + error.message);
    }
  });

  const demands = data?.disaster_requests || [];

  // 計算已派遣人數
  const getAssignedCount = (demand) => {
    return demand.assignments?.reduce((sum, assignment) => 
      sum + (assignment.volunteer?.member_count || 1), 0
    ) || 0;
  };

  // 篩選邏輯
  const filteredDemands = demands.filter(demand => {
    // 排除人數已滿的需求
    const assignedCount = getAssignedCount(demand);
    if (assignedCount >= demand.required_volunteers) return false;
    
    if (filters.requestType !== 'all' && demand.request_type !== filters.requestType) return false;
    if (filters.priority !== 'all' && demand.priority !== filters.priority) return false;
    if (filters.village !== 'all' && demand.village !== filters.village) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        demand.description?.toLowerCase().includes(searchLower) ||
        demand.village?.toLowerCase().includes(searchLower) ||
        demand.street?.toLowerCase().includes(searchLower) ||
        demand.contact_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // 分頁計算
  const totalPages = Math.ceil(filteredDemands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDemands = filteredDemands.slice(startIndex, endIndex);

  // 當篩選條件改變時，重置到第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.requestType, filters.priority, filters.village]);

  // 取得所有村落選項
  const villages = [...new Set(demands.map(d => d.village).filter(Boolean))];

  // 處理申請
  const handleApply = (demandId) => {
    if (volunteer.status !== 'available') {
      alert('⚠️ 請先上線才能申請需求');
      return;
    }
    
    if (window.confirm('確定要申請此服務需求嗎？')) {
      applyDemand({
        variables: {
          volunteer_id: volunteer.id,
          request_id: demandId
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
    <div className="pb-20 space-y-6">
      {/* 頁面標題 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">服務需求</h2>
        <p className="text-gray-600">選擇您想要服務的需求項目</p>
        
        {/* 統計資訊 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard 
            label="待支援" 
            value={demands.filter(d => d.status === 'pending').length}
            color="red"
          />
          <StatCard 
            label="處理中" 
            value={demands.filter(d => d.status === 'in_progress').length}
            color="yellow"
          />
          <StatCard 
            label="緊急需求" 
            value={demands.filter(d => d.priority === 'urgent').length}
            color="orange"
          />
          <StatCard 
            label="全部需求" 
            value={demands.length}
            color="blue"
          />
        </div>
      </div>

      {/* 篩選器按鈕區 */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-red-600" />
            篩選條件
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center"
          >
            {showFilters ? '收起' : '展開'}
          </button>
        </div>

        {/* 搜尋框 - 永遠顯示 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋地址、描述或聯絡人..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 進階篩選選項 */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">

            {/* 優先順序 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                    優先順序
                    </label>
                    <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                    <option value="all">全部</option>
                    <option value="urgent">緊急</option>
                    <option value="normal">普通</option>
                    </select>
                  </div>

            {/* 村落 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                村落地區
              </label>
              <select
                value={filters.village}
                onChange={(e) => setFilters({ ...filters, village: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">全部村落</option>
                {villages.map(village => (
                  <option key={village} value={village}>{village}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 清除篩選按鈕 */}
        {(filters.requestType !== 'all' || filters.priority !== 'all' || filters.village !== 'all' || filters.search) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setFilters({ requestType: 'all', priority: 'all', village: 'all', search: '' })}
              className="w-full md:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              清除所有篩選
            </button>
          </div>
        )}

        {/* 結果統計 */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          顯示 {filteredDemands.length} 個需求
          {filters.search && ` （搜尋：${filters.search}）`}
        </div>
      </div>

      {/* 需求列表 */}
      <div className="space-y-4">
        {filteredDemands.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">目前沒有符合條件的需求</h3>
            <p className="text-gray-600">請調整篩選條件或稍後再試</p>
          </div>
        ) : (
          paginatedDemands.map(demand => (
            <DemandCard
              key={demand.id}
              demand={demand}
              assignedCount={getAssignedCount(demand)}
              onApply={handleApply}
              applying={applying}
              volunteerStatus={volunteer.status}
            />
          ))
        )}
      </div>

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              第 {currentPage} / {totalPages} 頁，共 {filteredDemands.length} 個需求
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
    </div>
  );
}

// 統計卡片
function StatCard({ label, value, color }) {
  const colorClasses = {
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 text-white shadow-lg`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}

// 需求卡片
function DemandCard({ demand, assignedCount, onApply, applying, volunteerStatus }) {
  const priorityConfig = {
    urgent: { label: '緊急', color: 'bg-red-600', textColor: 'text-red-600', bgColor: 'bg-red-50', border: 'border-red-200' },
    high: { label: '高', color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50', border: 'border-orange-200' },
    normal: { label: '普通', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50', border: 'border-blue-200' },
    low: { label: '低', color: 'bg-gray-500', textColor: 'text-gray-600', bgColor: 'bg-gray-50', border: 'border-gray-200' }
  };

  const statusConfig = {
    pending: { label: '待支援', color: 'text-red-600', bgColor: 'bg-red-100' },
    in_progress: { label: '處理中', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
  };

  const priority = priorityConfig[demand.priority] || priorityConfig.normal;
  const status = statusConfig[demand.status] || statusConfig.pending;
  const remainingVolunteers = demand.required_volunteers - assignedCount;

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${priority.border} hover:shadow-xl transition-all`}>
      {/* 標題列 */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* 優先順序標籤 */}
            <span className={`${priority.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
              {priority.label}
            </span>
            
            {/* 狀態標籤 */}
            <span className={`${status.bgColor} ${status.color} px-3 py-1 rounded-full text-xs font-bold`}>
              {status.label}
            </span>
            
            {/* 需求類型 */}
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">
              {demand.request_type}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-gray-800">
            {demand.village} {demand.street}
          </h3>
        </div>

        {/* 人數狀態 */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${remainingVolunteers > 0 ? 'bg-blue-50' : 'bg-green-50'}`}>
          <Users className={`w-5 h-5 ${remainingVolunteers > 0 ? 'text-blue-600' : 'text-green-600'}`} />
          <div className="text-sm">
            <div className={`font-bold ${remainingVolunteers > 0 ? 'text-blue-600' : 'text-green-600'}`}>
              {assignedCount}/{demand.required_volunteers}
            </div>
            <div className="text-gray-500 text-xs">人力需求</div>
          </div>
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="space-y-3 mb-4">
        {/* 地址 */}
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-gray-700">
              {demand.village} {demand.street}
            </div>
            {demand.address_detail && (
              <div className="text-sm text-gray-500 mt-1">
                {demand.address_detail}
              </div>
            )}
          </div>
        </div>

        {/* 聯絡人 */}
        <div className="flex items-center">
          <User className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <span className="text-gray-700">{demand.contact_name}</span>
        </div>

        {/* 電話 */}
        <div className="flex items-center">
          <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <a href={`tel:${demand.contact_phone}`} className="text-blue-600 hover:underline">
            {demand.contact_phone}
          </a>
        </div>

        {/* 描述 */}
        {demand.description && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600 font-medium mb-1">需求描述</div>
            <p className="text-gray-800">{demand.description}</p>
          </div>
        )}

        {/* 備註 */}
        {demand.notes && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600 font-medium mb-1">備註</div>
            <p className="text-gray-800 whitespace-pre-wrap">{demand.notes}</p>
          </div>
        )}

        {/* 時間 */}
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-2" />
          建立時間: {new Date(demand.created_at).toLocaleString('zh-TW')}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        {remainingVolunteers > 0 ? (
          <button
            onClick={() => onApply(demand.id)}
            disabled={applying || volunteerStatus !== 'available'}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              volunteerStatus !== 'available'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {volunteerStatus !== 'available' ? (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>您正在值勤中...</span>
              </>
            ) : applying ? (
              <span>申請中...</span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>我要服務</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex-1 py-3 rounded-xl font-bold text-center bg-green-100 text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>人數已滿</span>
          </div>
        )}
      </div>
    </div>
  );
}