import { gql } from '@apollo/client';

// 查詢所有志工
export const GET_VOLUNTEERS = gql`
  query GetVolunteers {
    volunteers(order_by: { created_at: desc }) {
      id
      name
      phone
      member_count
      nickname
      status
      notes
      created_at
    }
  }
`;

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
      created_at
    }
  }
`;

// 查詢所有派單
export const GET_ASSIGNMENTS = gql`
  query GetAssignments {
    assignments(order_by: { assigned_at: desc }) {
      id
      status
      assigned_at
      confirmed_at
      completed_at
      volunteer {
        id
        name
        phone
        member_count
      }
      disaster_request {
        id
        description
        village
        street
        contact_name
        contact_phone
      }
    }
  }
`;

// 儀表板統計數據
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    available_volunteers: volunteers_aggregate(
      where: { status: { _eq: "available" } }
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
    in_progress_assignments: assignments_aggregate(
      where: { status: { _in: ["pending", "confirmed", "in_progress"] } }
    ) {
      aggregate {
        count
      }
    }
    completed_assignments: assignments_aggregate(
      where: { status: { _eq: "completed" } }
    ) {
      aggregate {
        count
      }
    }
  }
`;