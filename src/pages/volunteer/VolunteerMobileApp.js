import React, { useState } from 'react';
import { Bell, MapPin, Phone, Clock, CheckCircle, AlertCircle, User, LogOut, Home } from 'lucide-react';

export default function VolunteerMobileApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [volunteer] = useState({
    id: 'V-001',
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
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'tasks' && <TasksPage />}
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

function HomePage() {
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
            <p className="text-red-100">可派遣人數</p>
            <p className="text-xl font-bold">3 人</p>
          </div>
          <div className="h-8 w-px bg-white bg-opacity-30"></div>
          <div>
            <p className="text-red-100">完成任務</p>
            <p className="text-xl font-bold">12 件</p>
          </div>
        </div>
      </div>

      {/* 快速切換狀態 */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="font-bold text-gray-800 mb-3">快速切換狀態</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatusButton status="available" label="可派遣" color="green" active />
          <StatusButton status="busy" label="忙碌中" color="yellow" />
          <StatusButton status="inactive" label="暫時離線" color="gray" />
          <StatusButton status="assigned" label="執行中" color="blue" disabled />
        </div>
      </div>

      {/* 待確認派單 */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">待確認派單</h3>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
            2 件
          </span>
        </div>
        <div className="space-y-3">
          <PendingAssignment
            id="DR-089"
            location="光復鄉 東富村 佛祖街"
            description="協助清淤作業"
            time="30分鐘前"
            urgent
          />
          <PendingAssignment
            id="DR-091"
            location="光復鄉 大興村 民族街"
            description="協助搬運物資"
            time="1小時前"
          />
        </div>
      </div>

      {/* 今日統計 */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="font-bold text-gray-800 mb-3">今日統計</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">2</p>
            <p className="text-xs text-gray-600">接受任務</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">1</p>
            <p className="text-xs text-gray-600">完成任務</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">6.5</p>
            <p className="text-xs text-gray-600">服務時數</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusButton({ status, label, color, active, disabled }) {
  const colors = {
    green: 'border-green-500 text-green-700',
    yellow: 'border-yellow-500 text-yellow-700',
    gray: 'border-gray-400 text-gray-700',
    blue: 'border-blue-500 text-blue-700',
  };

  const activeColors = {
    green: 'bg-green-500 text-white border-green-500',
    yellow: 'bg-yellow-500 text-white border-yellow-500',
    gray: 'bg-gray-400 text-white border-gray-400',
    blue: 'bg-blue-500 text-white border-blue-500',
  };

  return (
    <button
      disabled={disabled}
      className={`p-3 rounded-lg border-2 font-medium text-sm transition ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-gray-100'
          : active
          ? activeColors[color]
          : `${colors[color]} hover:bg-${color}-50`
      }`}
    >
      {label}
    </button>
  );
}

function PendingAssignment({ id, location, description, time, urgent }) {
  return (
    <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-800">{id}</span>
          {urgent && (
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              緊急
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <div className="flex items-start space-x-2 mb-3">
        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">{location}</p>
      </div>
      <p className="text-sm text-gray-700 mb-4">{description}</p>
      <div className="flex space-x-2">
        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition">
          接受任務
        </button>
        <button className="px-4 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium transition">
          查看詳情
        </button>
      </div>
    </div>
  );
}

function TasksPage() {
  const [filter, setFilter] = useState('all');

  const tasks = [
    {
      id: 'A-001',
      requestId: 'DR-089',
      location: '光復鄉 東富村 佛祖街',
      description: '協助清淤作業',
      status: 'pending',
      time: '30分鐘前',
    },
    {
      id: 'A-002',
      requestId: 'DR-085',
      location: '光復鄉 大興村 光豐路',
      description: '協助搬運物資',
      status: 'in_progress',
      startTime: '09:30',
    },
    {
      id: 'A-003',
      requestId: 'DR-078',
      location: '光復鄉 大富村 民生路',
      description: '道路清理',
      status: 'completed',
      completedTime: '昨天 16:45',
    },
  ];

  const statusConfig = {
    pending: { label: '待確認', color: 'yellow', icon: <Clock /> },
    in_progress: { label: '進行中', color: 'blue', icon: <AlertCircle /> },
    completed: { label: '已完成', color: 'green', icon: <CheckCircle /> },
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">我的任務</h2>

      {/* 篩選器 */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <FilterChip label="全部" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label="待確認" active={filter === 'pending'} onClick={() => setFilter('pending')} badge={2} />
        <FilterChip label="進行中" active={filter === 'in_progress'} onClick={() => setFilter('in_progress')} badge={1} />
        <FilterChip label="已完成" active={filter === 'completed'} onClick={() => setFilter('completed')} />
      </div>

      {/* 任務列表 */}
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-800">{task.requestId}</span>
                <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-${statusConfig[task.status].color}-100 text-${statusConfig[task.status].color}-800`}>
                  {React.cloneElement(statusConfig[task.status].icon, { className: 'w-3 h-3' })}
                  <span>{statusConfig[task.status].label}</span>
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {task.time || task.startTime || task.completedTime}
              </span>
            </div>

            <div className="flex items-start space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{task.location}</p>
            </div>

            <p className="text-sm text-gray-600 mb-4">{task.description}</p>

            {task.status === 'pending' && (
              <div className="flex space-x-2">
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition">
                  接受任務
                </button>
                <button className="flex-1 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition">
                  拒絕
                </button>
              </div>
            )}

            {task.status === 'in_progress' && (
              <div className="space-y-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>聯絡受災戶</span>
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition">
                  完成任務
                </button>
              </div>
            )}

            {task.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 font-medium">任務已完成，感謝您的付出！</span>
              </div>
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
      {badge && (
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

      {/* 服務統計 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">服務統計</h3>
        <div className="space-y-3">
          <StatRow label="總服務時數" value="48.5 小時" />
          <StatRow label="本月服務" value="12.5 小時" />
          <StatRow label="本週服務" value="6.5 小時" />
          <StatRow label="服務起始日" value="2024-09-15" />
        </div>
      </div>

      {/* 設定選項 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <SettingItem icon={<Bell />} label="通知設定" />
        <SettingItem icon={<Phone />} label="聯絡方式" />
        <SettingItem icon={<AlertCircle />} label="緊急聯絡人" />
        <SettingItem icon={<LogOut />} label="登出" danger />
      </div>

      {/* 版本資訊 */}
      <div className="text-center text-sm text-gray-500 py-4">
        <p>花蓮縣光復救災資源管理系統</p>
        <p>志工版 v1.0.0</p>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

function SettingItem({ icon, label, danger }) {
  return (
    <button className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${danger ? 'text-red-600' : 'text-gray-700'}`}>
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      <span className="flex-1 text-left font-medium">{label}</span>
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}