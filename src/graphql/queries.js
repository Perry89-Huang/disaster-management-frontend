import { gql } from '@apollo/client';

// 新增志工
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

// 更新志工
export const UPDATE_VOLUNTEER = gql`
  mutation UpdateVolunteer(
    $id: uuid!
    $name: String
    $phone: String
    $member_count: Int
    $nickname: String
    $notes: String
    $status: String
  ) {
    update_volunteers_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        phone: $phone
        member_count: $member_count
        nickname: $nickname
        notes: $notes
        status: $status
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

// 新增需求
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
      }
    ) {
      id
      description
      status
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
    $status: String
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
        status: $status
      }
    ) {
      id
      description
      status
    }
  }
`;

// 建立派單
export const CREATE_ASSIGNMENT = gql`
  mutation CreateAssignment($volunteer_id: uuid!, $request_id: uuid!) {
    insert_assignments_one(
      object: { 
        volunteer_id: $volunteer_id
        request_id: $request_id 
      }
    ) {
      id
      status
      volunteer {
        name
        phone
      }
      disaster_request {
        description
      }
    }
  }
`;

// 更新派單狀態
export const UPDATE_ASSIGNMENT_STATUS = gql`
  mutation UpdateAssignmentStatus($id: uuid!, $status: String!) {
    update_assignments_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
    }
  }
`;