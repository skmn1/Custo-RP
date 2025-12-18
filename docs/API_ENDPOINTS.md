# API Endpoints Documentation - Staff Scheduler Pro

**Document Version:** 1.0  
**Last Updated:** December 18, 2024  
**Base URL:** `https://api.schedulerpro.com/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Organizations](#organizations)
4. [Employees](#employees)
5. [Shifts](#shifts)
6. [Schedules](#schedules)
7. [Time-Off Requests](#time-off-requests)
8. [Shift Swaps](#shift-swaps)
9. [Availability](#availability)
10. [Payroll](#payroll)
11. [Notifications](#notifications)
12. [Reports](#reports)
13. [Common Patterns](#common-patterns)

---

## Authentication

### Register New User

Creates a new user account with email verification.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationId": "org_123456"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "user_789",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "emailVerified": false,
    "createdAt": "2024-12-18T10:00:00Z"
  },
  "message": "Registration successful. Please verify your email."
}
```

**Validation Rules:**
- Email: Valid email format, unique
- Password: Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
- firstName/lastName: 2-100 characters

---

### Login User

Authenticates user and returns JWT tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_789",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee",
      "organizationId": "org_123456"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account disabled or email not verified

---

### Refresh Access Token

Generates a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Logout User

Invalidates current tokens.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Forgot Password

Sends password reset email.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Reset Password

Resets password using token from email.

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecureP@ss123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Get Current User

Retrieves authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_789",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "organizationId": "org_123456",
    "emailVerified": true,
    "createdAt": "2024-12-18T10:00:00Z"
  }
}
```

---

### Update Current User

Updates authenticated user's profile.

**Endpoint:** `PUT /auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_789",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890",
    "updatedAt": "2024-12-18T11:00:00Z"
  }
}
```

---

## Users

### List Users

Retrieves paginated list of users (Admin only).

**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `role` (string, optional) - Filter by role
- `search` (string, optional) - Search by name or email
- `isActive` (boolean, optional) - Filter by active status

**Example:** `GET /users?page=1&limit=20&role=manager&search=john`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "user_789",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "manager",
      "isActive": true,
      "createdAt": "2024-12-18T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### Get User by ID

Retrieves specific user details.

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_789",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manager",
    "phone": "+1234567890",
    "isActive": true,
    "emailVerified": true,
    "lastLoginAt": "2024-12-18T09:00:00Z",
    "createdAt": "2024-12-18T10:00:00Z",
    "updatedAt": "2024-12-18T11:00:00Z"
  }
}
```

---

### Create User

Creates new user (Admin only).

**Endpoint:** `POST /users`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecureP@ss123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "employee"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "user_890",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "employee",
    "createdAt": "2024-12-18T12:00:00Z"
  }
}
```

---

### Update User

Updates user details.

**Endpoint:** `PUT /users/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Johnson",
  "phone": "+1987654321",
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_890",
    "firstName": "Jane",
    "lastName": "Johnson",
    "phone": "+1987654321",
    "updatedAt": "2024-12-18T13:00:00Z"
  }
}
```

---

### Delete User

Soft deletes a user (Admin only).

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Update User Role

Updates user role (Admin only).

**Endpoint:** `PATCH /users/:id/role`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "role": "manager"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_890",
    "role": "manager",
    "updatedAt": "2024-12-18T14:00:00Z"
  }
}
```

---

## Organizations

### List Organizations

Retrieves all organizations (Super Admin only).

**Endpoint:** `GET /organizations`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "org_123456",
      "name": "Acme Hospital",
      "slug": "acme-hospital",
      "email": "admin@acme.com",
      "subscriptionTier": "premium",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Get Organization

Retrieves organization details.

**Endpoint:** `GET /organizations/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "org_123456",
    "name": "Acme Hospital",
    "slug": "acme-hospital",
    "email": "admin@acme.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State 12345",
    "subscriptionTier": "premium",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-12-18T10:00:00Z"
  }
}
```

---

### Create Organization

Creates new organization (Super Admin only).

**Endpoint:** `POST /organizations`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "New Clinic",
  "slug": "new-clinic",
  "email": "admin@newclinic.com",
  "phone": "+1987654321",
  "address": "456 Elm St, City, State 67890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "org_234567",
    "name": "New Clinic",
    "slug": "new-clinic",
    "email": "admin@newclinic.com",
    "subscriptionTier": "free",
    "createdAt": "2024-12-18T15:00:00Z"
  }
}
```

---

### Update Organization

Updates organization details.

**Endpoint:** `PUT /organizations/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "New Clinic Updated",
  "phone": "+1555555555",
  "address": "789 Oak Ave, City, State 11111"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "org_234567",
    "name": "New Clinic Updated",
    "phone": "+1555555555",
    "updatedAt": "2024-12-18T16:00:00Z"
  }
}
```

---

### Get Organization Settings

Retrieves organization-specific settings.

**Endpoint:** `GET /organizations/:id/settings`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "timezone": "America/New_York",
    "weekStartDay": "monday",
    "overtimeThreshold": 40,
    "overtimeRate": 1.5,
    "notificationPreferences": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

---

### Update Organization Settings

Updates organization settings.

**Endpoint:** `PUT /organizations/:id/settings`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "timezone": "America/Los_Angeles",
  "overtimeThreshold": 45,
  "overtimeRate": 2.0
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "timezone": "America/Los_Angeles",
    "overtimeThreshold": 45,
    "overtimeRate": 2.0,
    "updatedAt": "2024-12-18T17:00:00Z"
  }
}
```

---

## Employees

### List Employees

Retrieves paginated list of employees.

**Endpoint:** `GET /employees`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `department` (string, optional)
- `search` (string, optional)
- `isActive` (boolean, optional)

**Example:** `GET /employees?page=1&limit=20&department=ICU&search=sarah`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "emp_456",
      "employeeCode": "EMP001",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah@example.com",
      "phone": "+1234567890",
      "department": "ICU",
      "jobTitle": "Senior Nurse",
      "hourlyRate": 35.50,
      "maxHoursPerWeek": 40,
      "hireDate": "2022-01-15",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 85,
    "totalPages": 5
  }
}
```

---

### Get Employee by ID

Retrieves specific employee details.

**Endpoint:** `GET /employees/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "emp_456",
    "employeeCode": "EMP001",
    "userId": "user_789",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah@example.com",
    "phone": "+1234567890",
    "department": "ICU",
    "jobTitle": "Senior Nurse",
    "hourlyRate": 35.50,
    "maxHoursPerWeek": 40,
    "color": "#3B82F6",
    "hireDate": "2022-01-15",
    "isActive": true,
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-12-18T10:00:00Z"
  }
}
```

---

### Create Employee

Creates new employee.

**Endpoint:** `POST /employees`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "employeeCode": "EMP002",
  "firstName": "Michael",
  "lastName": "Chen",
  "email": "michael@example.com",
  "phone": "+1987654321",
  "department": "Emergency",
  "jobTitle": "Doctor",
  "hourlyRate": 75.00,
  "maxHoursPerWeek": 50,
  "hireDate": "2024-12-18"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "emp_567",
    "employeeCode": "EMP002",
    "firstName": "Michael",
    "lastName": "Chen",
    "email": "michael@example.com",
    "department": "Emergency",
    "jobTitle": "Doctor",
    "hourlyRate": 75.00,
    "createdAt": "2024-12-18T18:00:00Z"
  }
}
```

---

### Update Employee

Updates employee details.

**Endpoint:** `PUT /employees/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "phone": "+1111111111",
  "jobTitle": "Lead Doctor",
  "hourlyRate": 85.00,
  "maxHoursPerWeek": 55
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "emp_567",
    "phone": "+1111111111",
    "jobTitle": "Lead Doctor",
    "hourlyRate": 85.00,
    "maxHoursPerWeek": 55,
    "updatedAt": "2024-12-18T19:00:00Z"
  }
}
```

---

### Delete Employee

Soft deletes an employee.

**Endpoint:** `DELETE /employees/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

### Get Employee Shifts

Retrieves all shifts for an employee.

**Endpoint:** `GET /employees/:id/shifts`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate` (date, required) - YYYY-MM-DD
- `endDate` (date, required) - YYYY-MM-DD

**Example:** `GET /employees/emp_456/shifts?startDate=2024-12-18&endDate=2024-12-24`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "shift_111",
      "employeeId": "emp_456",
      "shiftDate": "2024-12-18",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "breakDuration": 30,
      "shiftType": "day",
      "department": "ICU",
      "status": "scheduled"
    }
  ],
  "summary": {
    "totalShifts": 5,
    "totalHours": 42.5,
    "overtimeHours": 2.5
  }
}
```

---

## Shifts

### List Shifts

Retrieves shifts with filtering.

**Endpoint:** `GET /shifts`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate` (date, required) - YYYY-MM-DD
- `endDate` (date, required) - YYYY-MM-DD
- `employeeId` (string, optional)
- `department` (string, optional)
- `status` (string, optional) - scheduled, completed, cancelled

**Example:** `GET /shifts?startDate=2024-12-18&endDate=2024-12-24&department=ICU`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "shift_111",
      "employeeId": "emp_456",
      "employee": {
        "id": "emp_456",
        "firstName": "Sarah",
        "lastName": "Johnson"
      },
      "shiftDate": "2024-12-18",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "breakDuration": 30,
      "shiftType": "day",
      "department": "ICU",
      "status": "scheduled",
      "createdAt": "2024-12-15T10:00:00Z"
    }
  ]
}
```

---

### Get Shift by ID

Retrieves specific shift details.

**Endpoint:** `GET /shifts/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "shift_111",
    "employeeId": "emp_456",
    "employee": {
      "id": "emp_456",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "department": "ICU"
    },
    "scheduleId": "schedule_999",
    "shiftDate": "2024-12-18",
    "startTime": "08:00:00",
    "endTime": "17:00:00",
    "breakDuration": 30,
    "shiftType": "day",
    "department": "ICU",
    "location": "Building A, Floor 3",
    "notes": "Training new staff",
    "status": "scheduled",
    "createdBy": "user_789",
    "createdAt": "2024-12-15T10:00:00Z",
    "updatedAt": "2024-12-15T10:00:00Z"
  }
}
```

---

### Create Shift

Creates a new shift.

**Endpoint:** `POST /shifts`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "employeeId": "emp_456",
  "shiftDate": "2024-12-19",
  "startTime": "14:00:00",
  "endTime": "22:00:00",
  "breakDuration": 30,
  "shiftType": "evening",
  "department": "ICU",
  "location": "Building A, Floor 3",
  "notes": "Cover for evening shift"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "shift_112",
    "employeeId": "emp_456",
    "shiftDate": "2024-12-19",
    "startTime": "14:00:00",
    "endTime": "22:00:00",
    "breakDuration": 30,
    "shiftType": "evening",
    "department": "ICU",
    "status": "scheduled",
    "createdAt": "2024-12-18T20:00:00Z"
  },
  "message": "Shift created and notification sent"
}
```

---

### Update Shift

Updates shift details.

**Endpoint:** `PUT /shifts/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "startTime": "13:00:00",
  "endTime": "21:00:00",
  "notes": "Time adjusted per request"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "shift_112",
    "startTime": "13:00:00",
    "endTime": "21:00:00",
    "notes": "Time adjusted per request",
    "updatedAt": "2024-12-18T21:00:00Z"
  },
  "message": "Shift updated and notification sent"
}
```

---

### Delete Shift

Deletes a shift.

**Endpoint:** `DELETE /shifts/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Shift deleted successfully"
}
```

---

### Create Bulk Shifts

Creates multiple shifts in one request.

**Endpoint:** `POST /shifts/bulk`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "shifts": [
    {
      "employeeId": "emp_456",
      "shiftDate": "2024-12-20",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "shiftType": "day",
      "department": "ICU"
    },
    {
      "employeeId": "emp_567",
      "shiftDate": "2024-12-20",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "shiftType": "day",
      "department": "Emergency"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "created": 2,
    "shifts": [
      {
        "id": "shift_113",
        "employeeId": "emp_456",
        "shiftDate": "2024-12-20"
      },
      {
        "id": "shift_114",
        "employeeId": "emp_567",
        "shiftDate": "2024-12-20"
      }
    ]
  },
  "message": "2 shifts created successfully"
}
```

---

### Check Shift Conflicts

Checks for scheduling conflicts.

**Endpoint:** `GET /shifts/conflicts`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `employeeId` (string, required)
- `shiftDate` (date, required)
- `startTime` (time, required)
- `endTime` (time, required)

**Example:** `GET /shifts/conflicts?employeeId=emp_456&shiftDate=2024-12-20&startTime=08:00:00&endTime=17:00:00`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "hasConflicts": true,
    "conflicts": [
      {
        "type": "overlapping_shift",
        "message": "Employee already has a shift on this date",
        "existingShift": {
          "id": "shift_100",
          "shiftDate": "2024-12-20",
          "startTime": "06:00:00",
          "endTime": "14:00:00"
        }
      },
      {
        "type": "time_off_request",
        "message": "Employee has approved time-off",
        "timeOffRequest": {
          "id": "timeoff_50",
          "startDate": "2024-12-20",
          "endDate": "2024-12-22",
          "type": "vacation"
        }
      }
    ]
  }
}
```

---

## Schedules

### List Schedules

Retrieves all schedules.

**Endpoint:** `GET /schedules`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional) - draft, published, archived

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule_999",
      "name": "Week of Dec 18, 2024",
      "startDate": "2024-12-18",
      "endDate": "2024-12-24",
      "status": "published",
      "publishedAt": "2024-12-15T10:00:00Z",
      "publishedBy": {
        "id": "user_789",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-12-14T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

### Get Schedule by ID

Retrieves schedule with all shifts.

**Endpoint:** `GET /schedules/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "schedule_999",
    "name": "Week of Dec 18, 2024",
    "startDate": "2024-12-18",
    "endDate": "2024-12-24",
    "status": "published",
    "publishedAt": "2024-12-15T10:00:00Z",
    "publishedBy": {
      "id": "user_789",
      "firstName": "John",
      "lastName": "Doe"
    },
    "shifts": [
      {
        "id": "shift_111",
        "employeeId": "emp_456",
        "shiftDate": "2024-12-18",
        "startTime": "08:00:00",
        "endTime": "17:00:00"
      }
    ],
    "summary": {
      "totalShifts": 45,
      "totalEmployees": 15,
      "totalHours": 360,
      "departmentBreakdown": {
        "ICU": 120,
        "Emergency": 150,
        "General": 90
      }
    }
  }
}
```

---

### Create Schedule

Creates a new schedule.

**Endpoint:** `POST /schedules`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "Week of Dec 25, 2024",
  "startDate": "2024-12-25",
  "endDate": "2024-12-31",
  "notes": "Holiday week - reduced staff"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "schedule_1000",
    "name": "Week of Dec 25, 2024",
    "startDate": "2024-12-25",
    "endDate": "2024-12-31",
    "status": "draft",
    "createdAt": "2024-12-18T22:00:00Z"
  }
}
```

---

### Update Schedule

Updates schedule details.

**Endpoint:** `PUT /schedules/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "Holiday Week Schedule",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "schedule_1000",
    "name": "Holiday Week Schedule",
    "notes": "Updated notes",
    "updatedAt": "2024-12-18T23:00:00Z"
  }
}
```

---

### Publish Schedule

Publishes a schedule and notifies employees.

**Endpoint:** `POST /schedules/:id/publish`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "schedule_1000",
    "status": "published",
    "publishedAt": "2024-12-19T00:00:00Z",
    "publishedBy": "user_789"
  },
  "message": "Schedule published and 15 employees notified"
}
```

---

### Export Schedule

Exports schedule as PDF or CSV.

**Endpoint:** `GET /schedules/:id/export`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `format` (string, required) - pdf or csv

**Example:** `GET /schedules/schedule_999/export?format=pdf`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "url": "https://s3.amazonaws.com/schedulerpro/exports/schedule_999.pdf",
    "expiresAt": "2024-12-19T01:00:00Z"
  }
}
```

---

## Time-Off Requests

### List Time-Off Requests

Retrieves time-off requests.

**Endpoint:** `GET /employees/:id/time-off`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `status` (string, optional) - pending, approved, denied

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "timeoff_50",
      "employeeId": "emp_456",
      "requestType": "vacation",
      "startDate": "2024-12-25",
      "endDate": "2024-12-31",
      "reason": "Holiday vacation",
      "status": "pending",
      "createdAt": "2024-12-10T10:00:00Z"
    }
  ]
}
```

---

### Create Time-Off Request

Creates a new time-off request.

**Endpoint:** `POST /employees/:id/time-off`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "requestType": "vacation",
  "startDate": "2024-12-25",
  "endDate": "2024-12-31",
  "reason": "Family holiday"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "timeoff_51",
    "employeeId": "emp_456",
    "requestType": "vacation",
    "startDate": "2024-12-25",
    "endDate": "2024-12-31",
    "reason": "Family holiday",
    "status": "pending",
    "createdAt": "2024-12-18T10:00:00Z"
  },
  "message": "Time-off request submitted"
}
```

---

### Approve Time-Off Request

Approves a time-off request (Manager/Admin only).

**Endpoint:** `PUT /time-off/:id/approve`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "reviewNotes": "Approved - coverage arranged"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "timeoff_51",
    "status": "approved",
    "reviewedBy": "user_789",
    "reviewedAt": "2024-12-18T11:00:00Z",
    "reviewNotes": "Approved - coverage arranged"
  },
  "message": "Time-off request approved and employee notified"
}
```

---

### Deny Time-Off Request

Denies a time-off request (Manager/Admin only).

**Endpoint:** `PUT /time-off/:id/deny`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "reviewNotes": "Cannot accommodate during holiday season"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "timeoff_51",
    "status": "denied",
    "reviewedBy": "user_789",
    "reviewedAt": "2024-12-18T12:00:00Z",
    "reviewNotes": "Cannot accommodate during holiday season"
  },
  "message": "Time-off request denied and employee notified"
}
```

---

## Shift Swaps

### Request Shift Swap

Initiates a shift swap request.

**Endpoint:** `POST /shifts/:id/swap`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "toEmployeeId": "emp_567",
  "reason": "Personal appointment"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "swap_30",
    "shiftId": "shift_111",
    "fromEmployeeId": "emp_456",
    "toEmployeeId": "emp_567",
    "reason": "Personal appointment",
    "status": "pending",
    "createdAt": "2024-12-18T13:00:00Z"
  },
  "message": "Swap request sent to manager for approval"
}
```

---

### Approve Shift Swap

Approves a shift swap (Manager/Admin only).

**Endpoint:** `PUT /shift-swaps/:id/approve`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "reviewNotes": "Approved - both employees qualified"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "swap_30",
    "status": "approved",
    "reviewedBy": "user_789",
    "reviewedAt": "2024-12-18T14:00:00Z",
    "reviewNotes": "Approved - both employees qualified"
  },
  "message": "Shift swap approved and employees notified"
}
```

---

## Availability

### Get Employee Availability

Retrieves employee weekly availability.

**Endpoint:** `GET /employees/:id/availability`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "avail_1",
      "employeeId": "emp_456",
      "dayOfWeek": 1,
      "dayName": "Monday",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    },
    {
      "id": "avail_2",
      "employeeId": "emp_456",
      "dayOfWeek": 2,
      "dayName": "Tuesday",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    }
  ]
}
```

---

### Update Employee Availability

Updates weekly availability.

**Endpoint:** `PUT /employees/:id/availability`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "availability": [
    {
      "dayOfWeek": 1,
      "startTime": "06:00:00",
      "endTime": "18:00:00",
      "isAvailable": true
    },
    {
      "dayOfWeek": 0,
      "isAvailable": false
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "dayOfWeek": 1,
      "dayName": "Monday",
      "startTime": "06:00:00",
      "endTime": "18:00:00",
      "isAvailable": true
    },
    {
      "dayOfWeek": 0,
      "dayName": "Sunday",
      "isAvailable": false
    }
  ],
  "message": "Availability updated successfully"
}
```

---

## Payroll

### Calculate Payroll

Calculates payroll for a period.

**Endpoint:** `POST /payroll/calculate`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-15",
  "department": "ICU"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-12-01",
      "endDate": "2024-12-15"
    },
    "employees": [
      {
        "employeeId": "emp_456",
        "name": "Sarah Johnson",
        "regularHours": 80,
        "overtimeHours": 5,
        "regularPay": 2840.00,
        "overtimePay": 266.25,
        "totalPay": 3106.25
      }
    ],
    "summary": {
      "totalEmployees": 15,
      "totalRegularHours": 1200,
      "totalOvertimeHours": 75,
      "totalPay": 45500.00
    }
  }
}
```

---

### Get Payroll Reports

Retrieves payroll reports.

**Endpoint:** `GET /payroll/reports`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate` (date, required)
- `endDate` (date, required)
- `department` (string, optional)
- `employeeId` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalCost": 45500.00,
    "regularCost": 40000.00,
    "overtimeCost": 5500.00,
    "breakdown": [
      {
        "department": "ICU",
        "employeeCount": 8,
        "totalHours": 640,
        "totalCost": 22500.00
      }
    ]
  }
}
```

---

### Export Payroll

Exports payroll data.

**Endpoint:** `POST /payroll/export`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-15",
  "format": "csv"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "url": "https://s3.amazonaws.com/schedulerpro/exports/payroll_20241201-20241215.csv",
    "expiresAt": "2024-12-19T02:00:00Z"
  }
}
```

---

## Notifications

### Get Notifications

Retrieves user notifications.

**Endpoint:** `GET /notifications`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `isRead` (boolean, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_100",
      "type": "shift_assigned",
      "title": "New Shift Assigned",
      "message": "You have been assigned a shift on Dec 20, 2024 at 08:00 AM",
      "data": {
        "shiftId": "shift_115",
        "shiftDate": "2024-12-20"
      },
      "isRead": false,
      "sentAt": "2024-12-18T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### Mark Notification as Read

Marks a notification as read.

**Endpoint:** `PUT /notifications/:id/read`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "notif_100",
    "isRead": true,
    "readAt": "2024-12-18T16:00:00Z"
  }
}
```

---

### Mark All Notifications as Read

Marks all notifications as read.

**Endpoint:** `PUT /notifications/read-all`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "45 notifications marked as read"
}
```

---

### Get Notification Preferences

Retrieves user notification preferences.

**Endpoint:** `GET /notifications/preferences`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "email": {
      "shiftAssigned": true,
      "shiftChanged": true,
      "schedulePublished": true,
      "timeOffApproved": true
    },
    "sms": {
      "shiftAssigned": false,
      "shiftChanged": true
    },
    "push": {
      "shiftAssigned": true,
      "shiftChanged": true,
      "schedulePublished": true
    }
  }
}
```

---

### Update Notification Preferences

Updates notification preferences.

**Endpoint:** `PUT /notifications/preferences`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "email": {
    "shiftAssigned": true,
    "shiftChanged": false
  },
  "push": {
    "shiftAssigned": true
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "email": {
      "shiftAssigned": true,
      "shiftChanged": false
    },
    "push": {
      "shiftAssigned": true
    }
  },
  "message": "Preferences updated successfully"
}
```

---

## Reports

### Get Labor Cost Reports

Retrieves labor cost analytics.

**Endpoint:** `GET /reports/labor-costs`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate` (date, required)
- `endDate` (date, required)
- `department` (string, optional)
- `groupBy` (string, optional) - day, week, month, department

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-12-01",
      "endDate": "2024-12-31"
    },
    "totalCost": 125000.00,
    "regularCost": 110000.00,
    "overtimeCost": 15000.00,
    "breakdown": [
      {
        "date": "2024-12-01",
        "cost": 4500.00
      }
    ]
  }
}
```

---

### Get Overtime Reports

Retrieves overtime statistics.

**Endpoint:** `GET /reports/overtime`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate` (date, required)
- `endDate` (date, required)
- `department` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalOvertimeHours": 245,
    "totalOvertimeCost": 15000.00,
    "employees": [
      {
        "employeeId": "emp_456",
        "name": "Sarah Johnson",
        "overtimeHours": 12.5,
        "overtimeCost": 665.63
      }
    ]
  }
}
```

---

### Get Attendance Reports

Retrieves attendance statistics.

**Endpoint:** `GET /reports/attendance`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate` (date, required)
- `endDate` (date, required)
- `employeeId` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employeeId": "emp_456",
        "name": "Sarah Johnson",
        "scheduledShifts": 20,
        "completedShifts": 19,
        "cancelledShifts": 1,
        "attendanceRate": 95.0
      }
    ]
  }
}
```

---

### Generate Custom Report

Generates custom report.

**Endpoint:** `POST /reports/custom`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "reportName": "Weekly Summary",
  "startDate": "2024-12-18",
  "endDate": "2024-12-24",
  "fields": ["employee", "department", "totalHours", "totalCost"],
  "filters": {
    "department": "ICU"
  },
  "groupBy": "employee",
  "sortBy": "totalHours",
  "sortOrder": "desc"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reportId": "report_555",
    "url": "https://s3.amazonaws.com/schedulerpro/reports/custom_555.pdf",
    "expiresAt": "2024-12-19T03:00:00Z"
  }
}
```

---

## Common Patterns

### Pagination

All list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### Filtering

Common filter parameters:
- `search` - Text search across relevant fields
- `startDate` / `endDate` - Date range filtering
- `department` - Filter by department
- `status` - Filter by status
- `isActive` - Filter active/inactive records

### Sorting

Sort parameters (where applicable):
- `sortBy` - Field to sort by
- `sortOrder` - `asc` or `desc`

Example: `GET /employees?sortBy=lastName&sortOrder=asc`

### Error Responses

All error responses follow this format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-12-18T10:00:00Z"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  },
  "timestamp": "2024-12-18T10:00:00Z"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  },
  "timestamp": "2024-12-18T10:00:00Z"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  },
  "timestamp": "2024-12-18T10:00:00Z"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests"
  },
  "timestamp": "2024-12-18T10:00:00Z"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  },
  "timestamp": "2024-12-18T10:00:00Z"
}
```

### Rate Limiting Headers

All responses include rate limiting headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1703000000
```

---

**Document Owner:** API Team  
**Version:** 1.0  
**Last Updated:** December 18, 2024
