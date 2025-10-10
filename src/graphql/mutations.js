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
    $township: String
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
        township: $township
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
      request_type
      township
      village
      street
      address_detail
      priority
    }
  }
`;

// 更新需求
export const UPDATE_REQUEST = gql`
  mutation UpdateRequest(
    $id: uuid!
    $request_type: String
    $township: String
    $village: String
    $street: String
    $address_detail: String
    $contact_name: String
    $contact_phone: String
    $description: String
    $required_volunteers: Int
    $priority: String
    $notes: String
  ) {
    update_disaster_requests_by_pk(
      pk_columns: { id: $id }
      _set: {
        request_type: $request_type
        township: $township
        village: $village
        street: $street
        address_detail: $address_detail
        contact_name: $contact_name
        contact_phone: $contact_phone
        description: $description
        required_volunteers: $required_volunteers
        priority: $priority
        notes: $notes
      }
    ) {
      id
      description
      status
      request_type
      priority
      township
      village
      street
      address_detail
      contact_name
      contact_phone
      required_volunteers
      notes
    }
  }
`;

// ========== 派單流程 Mutations ==========

// A1: 管理員派單（新版流程：pending → in_progress）
export const ASSIGN_VOLUNTEER = gql`
  mutation AssignVolunteer(
    $volunteer_id: uuid!
    $request_id: uuid!
  ) {
    # 建立派單記錄（status: pending），如果已存在則更新
    insert_assignments_one(
      object: {
        volunteer_id: $volunteer_id
        request_id: $request_id
        status: "pending"
        assigned_at: "now()"
        rejected_at: null
        rejection_reason: null
        cancelled_at: null
        cancellation_reason: null
      }
      on_conflict: {
        constraint: assignments_volunteer_id_request_id_key
        update_columns: [status, assigned_at, rejected_at, rejection_reason, cancelled_at, cancellation_reason]
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
    
    # 更新需求狀態：pending → in_progress（一派單就進入進行中）
    update_disaster_requests_by_pk(
      pk_columns: { id: $request_id }
      _set: { status: "in_progress" }
    ) {
      id
      status
    }
  }
`;

// V1: 志工確認派單 ✅ 修正：移除 request_id 參數
export const CONFIRM_ASSIGNMENT = gql`
  mutation ConfirmAssignment(
    $assignment_id: uuid!
    $volunteer_id: uuid!
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
  }
`;

// V2: 志工拒絕派單 ✅ 修正：移除 request_id 參數
export const REJECT_ASSIGNMENT = gql`
  mutation RejectAssignment(
    $assignment_id: uuid!
    $volunteer_id: uuid!
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
    
    # 更新需求狀態為 completed
    update_disaster_requests_by_pk(
      pk_columns: { id: $request_id }
      _set: { status: "completed" }
    ) {
      id
      status
    }
  }
`;

// A2/R2: 取消整個需求（管理員或受災戶）
export const CANCEL_REQUEST = gql`
  mutation CancelRequest(
    $request_id: uuid!
    $cancellation_reason: String
  ) {
    # 取消所有相關的派單
    update_assignments(
      where: { 
        request_id: { _eq: $request_id }
        status: { _in: ["pending", "confirmed"] }
      }
      _set: { 
        status: "cancelled"
        cancelled_at: "now()"
        cancellation_reason: $cancellation_reason
      }
    ) {
      affected_rows
      returning {
        id
        volunteer_id
      }
    }
    
    # 更新需求狀態為 cancelled
    update_disaster_requests_by_pk(
      pk_columns: { id: $request_id }
      _set: { status: "cancelled" }
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

export const VOLUNTEER_APPLY_DEMAND = gql`
  mutation VolunteerApplyDemand(
    $volunteer_id: uuid!
    $request_id: uuid!
  ) {
    insert_assignments_one(
      object: {
        volunteer_id: $volunteer_id
        request_id: $request_id
        status: "pending"
      }
    ) {
      id
      status
      assigned_at
    }
  }
`;


// 新增需求者（註冊申請）
export const CREATE_REQUESTER = gql`
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
        status: "pending"
      }
    ) {
      id
      name
      phone
      organization
      status
      created_at
    }
  }
`;

// 管理員直接新增需求者（已核准狀態）
export const ADMIN_CREATE_REQUESTER = gql`
  mutation AdminCreateRequester(
    $name: String!
    $phone: String!
    $organization: String
    $notes: String
    $approved_by: String
  ) {
    insert_requesters_one(
      object: {
        name: $name
        phone: $phone
        organization: $organization
        notes: $notes
        status: "approved"
        approved_at: "now()"
        approved_by: $approved_by
      }
    ) {
      id
      name
      phone
      status
    }
  }
`;

// 核准需求者
export const APPROVE_REQUESTER = gql`
  mutation ApproveRequester(
    $id: uuid!
    $approved_by: String!
  ) {
    update_requesters_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: "approved"
        approved_at: "now()"
        approved_by: $approved_by
      }
    ) {
      id
      name
      status
      approved_at
      approved_by
    }
  }
`;

// 拒絕需求者
export const REJECT_REQUESTER = gql`
  mutation RejectRequester(
    $id: uuid!
    $rejection_reason: String
  ) {
    update_requesters_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: "rejected"
        rejection_reason: $rejection_reason
      }
    ) {
      id
      name
      status
      rejection_reason
    }
  }
`;

// 更新需求者資料
export const UPDATE_REQUESTER = gql`
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
      updated_at
    }
  }
`;

// 刪除需求者
export const DELETE_REQUESTER = gql`
  mutation DeleteRequester($id: uuid!) {
    delete_requesters_by_pk(id: $id) {
      id
      name
    }
  }
`;

// ========== 更新 disaster_requests 的 Mutation ==========

// 需求者建立需求（含 requester_id）
export const REQUESTER_CREATE_REQUEST = gql`
  mutation RequesterCreateRequest(
    $requester_id: uuid!
    $request_type: String!
    $township: String
    $village: String!
    $street: String!
    $contact_name: String!
    $contact_phone: String!
    $description: String!
    $required_volunteers: Int
    $priority: String
    $address_detail: String
    $notes: String
  ) {
    insert_disaster_requests_one(
      object: {
        requester_id: $requester_id
        request_type: $request_type
        township: $township
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
        created_by: "requester"
      }
    ) {
      id
      requester_id
      description
      status
      created_at
    }
  }
`;
