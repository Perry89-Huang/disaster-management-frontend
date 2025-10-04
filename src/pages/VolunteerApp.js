// src/pages/VolunteerApp.jsx
import React, { useState } from 'react';
import { Bell, MapPin, Phone, Clock, CheckCircle, AlertCircle, User, LogOut, Home } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ASSIGNMENTS } from '../graphql/queries';
import { UPDATE_ASSIGNMENT_STATUS } from '../graphql/mutations';

export default function VolunteerApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [volunteer] = useState({
    id: 'e3b0c442-98fc-1c14-9afb-f4c8996fb924', // 替換為實際志工ID
    name: '林志明',
    phone: '0912-345-678',
    memberCount: 3,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 頂部導航 */}
      <div className="bg-red-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">光復救災志工</h1>
              <p className="text-xs text-red-100">{volunteer.name}</p>
            </div>
          </div>
          <button className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              2
            </span>
          </button>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="p-4">
        {currentPage === 'home' && <HomePage volunteerId={volunteer.id} />}
        {currentPage === 'tasks' && <TasksPage volunteerId={volunteer.id} />}
        {currentPage === 'profile' && <ProfilePage volunteer={volunteer} />}
      </div>

      {/* 底部導航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center h-16">
          <NavButton
            icon={<Home />}
            label="首頁"
            active={currentPage === 'home'}
            onClick={() => setCurrentPage('home')}
          />
          <NavButton
            icon={<CheckCircle />}
            label="任務"
            active={currentPage === 'tasks'}
            onClick={() => setCurrentPage('tasks')}
            badge={2}
          />
          <NavButton
            icon={<User />}
            label="我的"
            active={currentPage === 'profile'}
            onClick={() => setCurrentPage('profile')}
          />
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 flex-1 h-full relative ${
        active ? 'text-red-600' : 'text-gray-600'
      }`}
    >
      <div className="relative">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
        {badge && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function HomePage({ volunteerId }) {
  const { data } = useQuery(GET_ASSIGNMENTS);
  
  const myAssignments = data?.assignments?.filter(a => a.volunteer.id === volunteerId) || [];
  const pendingCount = myAssignments.filter(a => a.status === 'pending').length;
  const completedCount = myAssignments.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* 狀態卡片 */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-red-100 text-sm mb-1">目前狀態</p>
            <p className="text-2xl font-bold">可派遣</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <CheckCircle className="w-8 h-8" />
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div>
            <p className="text-red-100">待確認</p>
            <p className="text-xl font-bold">{pendingCount} 件</p>
          </div>
          <div className="h-8 w-px bg-white bg-opacity-30"></div>
          <div>
            <p className="text-red-100">已完成</p>
            <p className="text-xl font-bold">{completedCount} 件</p>
          </div>
        </div>
      </div>

      {/* 待確認派單 */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">待確認派單</h3>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
            {pendingCount} 件
          </span>
        </div>
        <div className="space-y-3">
          {myAssignments
            .filter(a => a.status === 'pending')
            .map(assignment => (
              <PendingAssignment
                key={assignment.id}
                assignment={assignment}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function PendingAssignment({ assignment }) {
  const [updateStatus] = useMutation(UPDATE_ASSIGNMENT_STATUS, {
    refetchQueries: [{ query: GET_ASSIGNMENTS }]
  });

  const handleAccept = async () => {
    try {
      await updateStatus({
        variables: {
          id: assignment.id,
          status: 'confirmed'
        }
      });
      alert('已接受任務！');
    } catch (err) {
      alert('操作失敗: ' + err.message);
    }
  };

  return (
    <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            緊急
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(assignment.assigned_at).toLocaleString('zh-TW')}
        </span>
      </div>
      <div className="flex items-start space-x-2 mb-3">
        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          {assignment.disaster_request.village} {assignment.disaster_request.street}
        </p>
      </div>
      <p className="text-sm text-gray-700 mb-4">{assignment.disaster_request.description}</p>
      <div className="flex space-x-2">
        <button 
          onClick={handleAccept}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
        >
          接受任務
        </button>
        <button className="px-4 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium transition">
          查看詳情
        </button>
      </div>
    </div>
  );
}

function TasksPage({ volunteerId }) {
  const [filter, setFilter] = useState('all');
  const { data } = useQuery(GET_ASSIGNMENTS);

  const myAssignments = data?.assignments?.filter(a => a.volunteer.id === volunteerId) || [];
  const filteredTasks = filter === 'all' ? myAssignments : myAssignments.filter(t => t.status === filter);

  const statusConfig = {
    pending: { label: '待確認', color: 'yellow', icon: <Clock /> },
    confirmed: { label: '已確認', color: 'green', icon: <CheckCircle /> },
    in_progress: { label: '進行中', color: 'blue', icon: <AlertCircle /> },
    completed: { label: '已完成', color: 'gray', icon: <CheckCircle /> },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">我的任務</h2>

      {/* 篩選器 */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <FilterChip label="全部" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip 
          label="待確認" 
          active={filter === 'pending'} 
          onClick={() => setFilter('pending')} 
          badge={myAssignments.filter(a => a.status === 'pending').length} 
        />
        <FilterChip 
          label="已確認" 
          active={filter === 'confirmed'} 
          onClick={() => setFilter('confirmed')} 
        />
        <FilterChip 
          label="已完成" 
          active={filter === 'completed'} 
          onClick={() => setFilter('completed')} 
        />
      </div>

      {/* 任務列表 */}
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-${statusConfig[task.status].color}-100 text-${statusConfig[task.status].color}-800`}>
                  {React.cloneElement(statusConfig[task.status].icon, { className: 'w-3 h-3' })}
                  <span>{statusConfig[task.status].label}</span>
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(task.assigned_at).toLocaleString('zh-TW')}
              </span>
            </div>

            <div className="flex items-start space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                {task.disaster_request.village} {task.disaster_request.street}
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">{task.disaster_request.description}</p>

            {task.status === 'confirmed' && (
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>聯絡受災戶 {task.disaster_request.contact_phone}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
        active
          ? 'bg-red-600 text-white'
          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300'
      }`}
    >
      {label}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

function ProfilePage({ volunteer }) {
  return (
    <div className="space-y-4">
      {/* 個人資料卡片 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{volunteer.name}</h2>
            <p className="text-sm text-gray-600">{volunteer.id}</p>
            <p className="text-sm text-gray-600">{volunteer.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{volunteer.memberCount}</p>
            <p className="text-xs text-gray-600">可派遣人數</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">12</p>
            <p className="text-xs text-gray-600">完成任務數</p>
          </div>
        </div>

        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition">
          編輯個人資料
        </button>
      </div>

      {/* 版本資訊 */}
      <div className="text-center text-sm text-gray-500 py-4">
        <p>花蓮縣光復救災資源管理系統</p>
        <p>志工版 v1.0.0</p>
      </div>
    </div>
  );
}