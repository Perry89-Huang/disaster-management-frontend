import { gql } from '@apollo/client';

// ========== 志工相關查詢 ==========

// 志工登入驗證
export const VERIFY_VOLUNTEER = gql`
  query VerifyVolunteer($phone: String!, $name: String!) {
    volunteers(
      where: {
        phone: { _eq: $phone }
        name: { _eq: $name }
      }
      limit: 1
    ) {
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

// 取得志工完整資料（包含派單）
export const GET_VOLUNTEER_PROFILE = gql`
  query GetVolunteerProfile($id: uuid!) {
    volunteers_by_pk(id: $id) {
      id
      name
      phone
      email
      member_count
      nickname
      status
      notes
      created_at
      assignments(order_by: { assigned_at: desc }) {
        id
        status
        assigned_at
        confirmed_at
        rejected_at
        completed_at
        rejection_reason
        disaster_request {
          id
          description
          village
          street
          contact_name
          contact_phone
          priority
          request_type
          status
        }
      }
    }
  }
`;

// 查詢所有志工（管理員用）
export const GET_VOLUNTEERS = gql`
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
      updated_at
    }
  }
`;

// 查詢可派遣的志工（狀態為 available）
export const GET_AVAILABLE_VOLUNTEERS = gql`
  query GetAvailableVolunteers {
    volunteers(
      where: { status: { _eq: "available" } }
      order_by: { created_at: desc }
    ) {
      id
      name
      phone
      member_count
      nickname
      status
      notes
    }
  }
`;

// ========== 需求相關查詢 ==========

// 查詢所有需求
export const GET_REQUESTS = gql`
  query GetRequests {
    disaster_requests(order_by: { created_at: desc }) {
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
      required_volunteers
      status
      notes
      created_by
      created_at
    }
  }
`;

// 查詢待支援需求（pending 狀態）
export const GET_PENDING_REQUESTS = gql`
  query GetPendingRequests {
    disaster_requests(
      where: { status: { _eq: "pending" } }
      order_by: { priority: asc, created_at: desc }
    ) {
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
    }
  }
`;

// ========== 派單相關查詢 ==========

// 查詢所有派單
export const GET_ASSIGNMENTS = gql`
  query GetAssignments {
    assignments(order_by: { assigned_at: desc }) {
      id
      status
      assigned_at
      confirmed_at
      rejected_at
      cancelled_at
      completed_at
      rejection_reason
      cancellation_reason
      volunteer {
        id
        name
        phone
        member_count
        status
      }
      disaster_request {
        id
        description
        village
        street
        contact_name
        contact_phone
        priority
        status
      }
    }
  }
`;

// 查詢志工的派單（志工端使用）
export const GET_VOLUNTEER_ASSIGNMENTS = gql`
  query GetVolunteerAssignments($volunteer_id: uuid!, $status: String) {
    assignments(
      where: {
        volunteer_id: { _eq: $volunteer_id }
        status: { _eq: $status }
      }
      order_by: { assigned_at: desc }
    ) {
      id
      status
      assigned_at
      confirmed_at
      rejected_at
      completed_at
      disaster_request {
        id
        description
        village
        street
        contact_name
        contact_phone
        priority
        request_type
      }
    }
  }
`;

// ========== 儀表板統計 ==========

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    # 可派遣志工（available狀態）
    available_volunteers: volunteers_aggregate(
      where: { status: { _eq: "available" } }
    ) {
      aggregate {
        count
      }
    }
    
    # 已派遣志工（assigning + assigned狀態）
    assigned_volunteers: volunteers_aggregate(
      where: { status: { _in: ["assigning", "assigned"] } }
    ) {
      aggregate {
        count
      }
    }
    
    # 離線志工
    offline_volunteers: volunteers_aggregate(
      where: { status: { _eq: "off" } }
    ) {
      aggregate {
        count
      }
    }
    
    # 待支援需求（pending狀態）
    pending_requests: disaster_requests_aggregate(
      where: { status: { _eq: "pending" } }
    ) {
      aggregate {
        count
      }
    }
    
    # 派單中需求（assigning狀態）
    assigning_requests: disaster_requests_aggregate(
      where: { status: { _eq: "assigning" } }
    ) {
      aggregate {
        count
      }
    }
    
    # 進行中需求（in_progress狀態）
    in_progress_requests: disaster_requests_aggregate(
      where: { status: { _eq: "in_progress" } }
    ) {
      aggregate {
        count
      }
    }
    
    # 已完成需求
    completed_requests: disaster_requests_aggregate(
      where: { status: { _eq: "completed" } }
    ) {
      aggregate {
        count
      }
    }
    
    # 待確認派單（pending狀態）
    pending_assignments: assignments_aggregate(
      where: { status: { _eq: "pending" } }
    ) {
      aggregate {
        count
      }
    }
    
    # 已確認派單（confirmed狀態）
    confirmed_assignments: assignments_aggregate(
      where: { status: { _eq: "confirmed" } }
    ) {
      aggregate {
        count
      }
    }
    
    # 已完成派單
    completed_assignments: assignments_aggregate(
      where: { status: { _eq: "completed" } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

// ========== 通知相關查詢 ==========

export const GET_VOLUNTEER_NOTIFICATIONS = gql`
  query GetVolunteerNotifications($volunteer_id: uuid!, $is_read: Boolean) {
    notifications(
      where: {
        volunteer_id: { _eq: $volunteer_id }
        is_read: { _eq: $is_read }
      }
      order_by: { created_at: desc }
      limit: 20
    ) {
      id
      type
      message
      is_read
      created_at
      assignment {
        id
        status
        disaster_request {
          description
          village
          street
        }
      }
    }
  }
`;