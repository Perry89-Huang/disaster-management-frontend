import { gql } from '@apollo/client';

// ========== 志工管理 Mutations ==========

// 志工註冊（初始狀態為 off）
export const REGISTER_VOLUNTEER = gql`
  mutation RegisterVolunteer(
    $name: String!
    $phone: String!
    $email: String
    $member_count: Int
  ) {
    insert_volunteers_one(
      object: {
        name: $name
        phone: $phone
        email: $email
        member_count: $member_count
        status: "off"
      }
    ) {
      id
      name
      phone
      email
      member_count
      status
      created_at
    }
  }
`;

// 新增志工（管理員用）
export const CREATE_VOLUNTEER = gql`
  mutation CreateVolunteer(
    $name: String!
    $phone: String!
    $member_count: Int
    $nickname: String
    $notes: String
  ) {
    insert_volunteers_one(
      object: {
        name: $name
        phone: $phone
        member_count: $member_count
        nickname: $nickname
        notes: $notes
        status: "off"
      }
    ) {
      id
      name
      phone
      member_count
      status
    }
  }
`;

// 更新志工資料
export const UPDATE_VOLUNTEER = gql`
  mutation UpdateVolunteer(
    $id: uuid!
    $name: String
    $phone: String
    $member_count: Int
    $nickname: String
    $notes: String
  ) {
    update_volunteers_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        phone: $phone
        member_count: $member_count
        nickname: $nickname
        notes: $notes
      }
    ) {
      id
      name
      phone
      status
    }
  }
`;

// 刪除志工
export const DELETE_VOLUNTEER = gql`
  mutation DeleteVolunteer($id: uuid!) {
    delete_volunteers_by_pk(id: $id) {
      id
      name
    }
  }
`;

// V4: 志工上線（off → available）
export const VOLUNTEER_GO_ONLINE = gql`
  mutation VolunteerGoOnline($id: uuid!) {
    update_volunteers_by_pk(
      pk_columns: { id: $id }
      _set: { status: "available" }
    ) {
      id
      name
      status
    }
  }
`;

// V5: 志工下線（available → off）
export const VOLUNTEER_GO_OFFLINE = gql`
  mutation VolunteerGoOffline($id: uuid!) {
    update_volunteers_by_pk(
      pk_columns: { id: $id }
      _set: { status: "off" }
    ) {
      id
      name
      status
    }
  }
`;

// ========== 需求管理 Mutations ==========

// R1/A3: 建立需求（受災戶或管理員）
export const CREATE_REQUEST = gql`
  mutation CreateRequest(
    $request_type: String!
    $village: String!
    $street: String!
    $contact_name: String!
    $contact_phone: String!
    $description: String!
    $required_volunteers: Int
    $priority: String
    $address_detail: String
    $notes: String
    $created_by: String
  ) {
    insert_disaster_requests_one(
      object: {
        request_type: $request_type
        village: $village
        street: $street
        contact_name: $contact_name
        contact_phone: $contact_phone
        description: $description
        required_volunteers: $required_volunteers
        priority: $priority
        address_detail: $address_detail
        notes: $notes
        status: "pending"
        created_by: $created_by
      }
    ) {
      id
      description
      status
      created_by
    }
  }
`;

// 更新需求
export const UPDATE_REQUEST = gql`
  mutation UpdateRequest(
    $id: uuid!
    $request_type: String
    $village: String
    $street: String
    $contact_name: String
    $contact_phone: String
    $description: String
    $required_volunteers: Int
    $priority: String
  ) {
    update_disaster_requests_by_pk(
      pk_columns: { id: $id }
      _set: {
        request_type: $request_type
        village: $village
        street: $street
        contact_name: $contact_name
        contact_phone: $contact_phone
        description: $description
        required_volunteers: $required_volunteers
        priority: $priority
      }
    ) {
      id
      description
      status
    }
  }
`;

// ========== 派單流程 Mutations ==========

// A1: 管理員派單（需同時更新志工和需求狀態）
export const ASSIGN_VOLUNTEER = gql`
  mutation AssignVolunteer(
    $volunteer_id: uuid!
    $request_id: uuid!
  ) {
    # 建立派單記錄（status: pending）
    insert_assignments_one(
      object: {
        volunteer_id: $volunteer_id
        request_id: $request_id
        status: "pending"
      }
    ) {
      id
      status
      volunteer {
        id
        name
        phone
      }
      disaster_request {
        id
        description
      }
    }
    
    # 更新志工狀態：available → assigning
    update_volunteers_by_pk(
      pk_columns: { id: $volunteer_id }
      _set: { status: "assigning" }
    ) {
      id
      status
    }
    
    # 更新需求狀態：pending → assigning
    update_disaster_requests_by_pk(
      pk_columns: { id: $request_id }
      _set: { status: "assigning" }
    ) {
      id
      status
    }
  }
`;

// V1: 志工確認派單（需同時更新所有相關狀態）
export const CONFIRM_ASSIGNMENT = gql`
  mutation ConfirmAssignment(
    $assignment_id: uuid!
    $volunteer_id: uuid!
    $request_id: uuid!
  ) {
    # 更新派單狀態：pending → confirmed
    update_assignments_by_pk(
      pk_columns: { id: $assignment_id }
      _set: { 
        status: "confirmed"
        confirmed_at: "now()"
      }
    ) {
      id
      status
      confirmed_at
    }
    
    # 更新志工狀態：assigning → assigned
    update_volunteers_by_pk(
      pk_columns: { id: $volunteer_id }
      _set: { status: "assigned" }
    ) {
      id
      status
    }
    
    # 更新需求狀態：assigning → in_progress
    update_disaster_requests_by_pk(
      pk_columns: { id: $request_id }
      _set: { status: "in_progress" }
    ) {
      id
      status
    }
  }
`;

// V2: 志工拒絕派單
export const REJECT_ASSIGNMENT = gql`
  mutation RejectAssignment(
    $assignment_id: uuid!
    $volunteer_id: uuid!
    $request_id: uuid!
    $rejection_reason: String
  ) {
    # 更新派單狀態：pending → rejected
    update_assignments_by_pk(
      pk_columns: { id: $assignment_id }
      _set: { 
        status: "rejected"
        rejected_at: "now()"
        rejection_reason: $rejection_reason
      }
    ) {
      id
      status
      rejected_at
    }
    
    # 更新志工狀態：assigning → available
    update_volunteers_by_pk(
      pk_columns: { id: $volunteer_id }
      _set: { status: "available" }
    ) {
      id
      status
    }
    
    # 更新需求狀態：assigning → pending（重新等待派單）
    update_disaster_requests_by_pk(
      pk_columns: { id: $request_id }
      _set: { status: "pending" }
    ) {
      id
      status
    }
  }
`;

// A2: 管理員取消派單
export const CANCEL_ASSIGNMENT = gql`
  mutation CancelAssignment(
    $assignment_id: uuid!
    $volunteer_id: uuid!
    $request_id: uuid!
    $cancellation_reason: String
  ) {
    # 更新派單狀態 → cancelled
    update_assignments_by_pk(
      pk_columns: { id: $assignment_id }
      _set: { 
        status: "cancelled"
        cancelled_at: "now()"
        cancellation_reason: $cancellation_reason
      }
    ) {
      id
      status
      cancelled_at
    }
    
    # 更新志工狀態 → available
    update_volunteers_by_pk(
      pk_columns: { id: $volunteer_id }
      _set: { status: "available" }
    ) {
      id
      status
    }
    
    # 更新需求狀態 → pending
    update_disaster_requests_by_pk(
      pk_columns: { id: $request_id }
      _set: { status: "pending" }
    ) {
      id
      status
    }
  }
`;

// V3: 志工完成任務
export const COMPLETE_ASSIGNMENT = gql`
  mutation CompleteAssignment(
    $assignment_id: uuid!
    $volunteer_id: uuid!
    $request_id: uuid!
  ) {
    # 更新派單狀態：confirmed → completed
    update_assignments_by_pk(
      pk_columns: { id: $assignment_id }
      _set: { 
        status: "completed"
        completed_at: "now()"
      }
    ) {
      id
      status
      completed_at
    }
    
    # 更新志工狀態：assigned → available
    update_volunteers_by_pk(
      pk_columns: { id: $volunteer_id }
      _set: { status: "available" }
    ) {
      id
      status
    }
    
    # 更新需求狀態：in_progress → completed
    update_disaster_requests_by_pk(
      pk_columns: { id: $request_id }
      _set: { status: "completed" }
    ) {
      id
      status
    }
  }
`;

// ========== 通知管理 Mutations ==========

// 建立通知
export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification(
    $volunteer_id: uuid!
    $assignment_id: uuid
    $type: String!
    $message: String!
  ) {
    insert_notifications_one(
      object: {
        volunteer_id: $volunteer_id
        assignment_id: $assignment_id
        type: $type
        message: $message
        is_read: false
      }
    ) {
      id
      type
      message
      created_at
    }
  }
`;

// 標記通知為已讀
export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: uuid!) {
    update_notifications_by_pk(
      pk_columns: { id: $id }
      _set: { is_read: true }
    ) {
      id
      is_read
    }
  }
`;

// 標記所有通知為已讀
export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead($volunteer_id: uuid!) {
    update_notifications(
      where: { 
        volunteer_id: { _eq: $volunteer_id }
        is_read: { _eq: false }
      }
      _set: { is_read: true }
    ) {
      affected_rows
    }
  }
`;

// ========== 系統管理 Mutations ==========

// S1: 系統每日重置所有志工為 off 狀態（排程任務用）
export const RESET_ALL_VOLUNTEERS_TO_OFF = gql`
  mutation ResetAllVolunteersToOff {
    update_volunteers(
      where: { status: { _neq: "off" } }
      _set: { status: "off" }
    ) {
      affected_rows
      returning {
        id
        name
        status
      }
    }
  }
`;