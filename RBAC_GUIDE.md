# Hướng dẫn RBAC Frontend - Football Field Booking

## Tổng quan

Frontend đã được cập nhật để tương thích với hệ thống RBAC (Role-Based Access Control) mới của backend. Thay vì lưu role dưới dạng số (0, 1, 2), giờ đây user có thể có nhiều roles dưới dạng mảng strings.

## Cấu trúc mới

### 1. User Object Structure

```javascript
{
  id: 1,
  firstName: "Nguyễn",
  lastName: "Văn A",
  email: "user@example.com",
  roles: ["Customer", "Owner"], // Array of role names
  roleNames: ["Customer", "Owner"], // Backup từ backend
  // ... các trường khác
}
```

### 2. JWT Token Claims

Token JWT chứa roles trong claim `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`:
- Single role: string
- Multiple roles: array of strings

### 3. Available Roles

```javascript
import { ROLES } from "./utils/roleHelpers";

ROLES.CUSTOMER  // "Customer"
ROLES.OWNER     // "Owner"
ROLES.ADMIN     // "Admin"
```

## Sử dụng Role Helpers

### Import

```javascript
import {
  ROLES,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isCustomer,
  isOwner,
  isAdmin,
  getPrimaryRole,
  getRoleRedirectPath,
  getUserRoleDisplay
} from "./utils/roleHelpers";
```

### Kiểm tra Role

#### Kiểm tra role cụ thể

```javascript
import { hasRole, ROLES } from "./utils/roleHelpers";

if (hasRole(user, ROLES.ADMIN)) {
  // User là Admin
}
```

#### Kiểm tra nhiều roles

```javascript
import { hasAnyRole, ROLES } from "./utils/roleHelpers";

// User có ít nhất một trong các roles
if (hasAnyRole(user, [ROLES.CUSTOMER, ROLES.OWNER])) {
  // User là Customer HOẶC Owner
}
```

```javascript
import { hasAllRoles, ROLES } from "./utils/roleHelpers";

// User phải có tất cả các roles
if (hasAllRoles(user, [ROLES.CUSTOMER, ROLES.OWNER])) {
  // User vừa là Customer VÀ Owner
}
```

#### Quick check functions

```javascript
import { isCustomer, isOwner, isAdmin } from "./utils/roleHelpers";

if (isCustomer(user)) {
  // User là Customer
}

if (isOwner(user)) {
  // User là Owner
}

if (isAdmin(user)) {
  // User là Admin
}
```

### Hiển thị Role

```javascript
import { getUserRoleDisplay, getPrimaryRole } from "./utils/roleHelpers";

// Lấy primary role (role đầu tiên)
const primaryRole = getPrimaryRole(user); // "Customer"

// Hiển thị role chính bằng tiếng Việt
const roleDisplay = getUserRoleDisplay(user); // "Khách hàng"

// Hiển thị tất cả roles
const allRolesDisplay = getUserRoleDisplay(user, true); 
// "Khách hàng, Chủ sân"
```

## Protected Routes

### Cách sử dụng

```javascript
import ProtectedRoute from "./components/ProtectedRoute";
import { ROLES } from "./utils/roleHelpers";

<Route 
  path="/profile" 
  element={
    <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
      <CustomerProfile />
    </ProtectedRoute>
  } 
/>
```

### Cho phép nhiều roles

```javascript
<ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.OWNER]}>
  <SharedPage />
</ProtectedRoute>
```

### Chỉ kiểm tra authentication

```javascript
// Không truyền allowedRoles = cho phép tất cả user đã đăng nhập
<ProtectedRoute>
  <AnyAuthenticatedUserPage />
</ProtectedRoute>
```

## Auth Store

### Login/Register

Auth store tự động xử lý việc decode JWT token và extract roles:

```javascript
import useAuthStore from "./store/authStore";

const { login, register, user } = useAuthStore();

// Login
const result = await login({ email, password });
if (result.success) {
  // user.roles đã được set từ JWT token
  console.log(user.roles); // ["Customer"]
}
```

### Check trong component

```javascript
import useAuthStore from "./store/authStore";
import { hasRole, ROLES } from "./utils/roleHelpers";

function MyComponent() {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  if (hasRole(user, ROLES.ADMIN)) {
    return <AdminView />;
  }
  
  return <RegularView />;
}
```

## Migration từ hệ thống cũ

### Trước đây (role number)

```javascript
// ❌ Cũ - không dùng nữa
if (user.role === 0) { // Customer
  // ...
}

if (user.role === 2) { // Admin
  // ...
}

<ProtectedRoute allowedRoles={[0, 1]}>
```

### Bây giờ (role names)

```javascript
// ✅ Mới - sử dụng
import { hasRole, ROLES } from "./utils/roleHelpers";

if (hasRole(user, ROLES.CUSTOMER)) {
  // ...
}

if (hasRole(user, ROLES.ADMIN)) {
  // ...
}

<ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.OWNER]}>
```

## Best Practices

### 1. Luôn import ROLES constant

```javascript
// ✅ Good
import { ROLES } from "./utils/roleHelpers";
if (hasRole(user, ROLES.CUSTOMER)) { ... }

// ❌ Bad - hardcode string
if (hasRole(user, "Customer")) { ... }
```

### 2. Sử dụng helper functions

```javascript
// ✅ Good
import { isAdmin } from "./utils/roleHelpers";
if (isAdmin(user)) { ... }

// ❌ Bad - manual check
if (user.roles && user.roles.includes("Admin")) { ... }
```

### 3. Null check

Helpers đã xử lý null/undefined, nhưng nên check authentication:

```javascript
// ✅ Good
const { user, isAuthenticated } = useAuthStore();

if (isAuthenticated && isAdmin(user)) {
  // Safe to use
}

// ⚠️ OK nhưng không cần thiết
if (user && user.roles && isAdmin(user)) {
  // isAdmin() đã check rồi
}
```

## API Response Structure

### Login/Register Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "email": "user@example.com",
      "roleNames": ["Customer"],
      "avatarUrl": null,
      "status": 1,
      "createdAt": "2025-11-25T..."
    },
    "expiresAt": "2025-11-25T..."
  }
}
```

### JWT Token Payload

```json
{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "1",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "user@example.com",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "Nguyễn Văn A",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Customer",
  "phone": "0123456789",
  "exp": 1732567890,
  "iss": "FootballFieldAPI",
  "aud": "FootballFieldClient"
}
```

## Troubleshooting

### User không có roles

```javascript
// Kiểm tra trong console
console.log(user);
console.log(user.roles);
console.log(user.roleNames);

// Nếu cả 2 đều undefined, kiểm tra:
// 1. JWT token có đúng không
// 2. Backend có trả về roleNames không
// 3. AuthStore có decode đúng không
```

### Role check không hoạt động

```javascript
// Debug
import { hasRole, ROLES } from "./utils/roleHelpers";

console.log(user.roles); // Should be array: ["Customer"]
console.log(ROLES.CUSTOMER); // Should be: "Customer"
console.log(hasRole(user, ROLES.CUSTOMER)); // Should be: true
```

## Tương lai - Permission-based

Hệ thống hiện tại đã hỗ trợ RBAC với permissions ở backend. Frontend có thể được mở rộng để check permissions trực tiếp:

```javascript
// TODO: Implement permission checking
import { hasPermission } from "./utils/permissionHelpers";

if (hasPermission(user, "booking.create")) {
  // User có quyền tạo booking
}
```

## Files đã thay đổi

1. `src/store/authStore.js` - Xử lý RoleNames từ API và JWT
2. `src/utils/roleHelpers.js` - Helper functions cho role checking (MỚI)
3. `src/components/ProtectedRoute.jsx` - Dùng role names thay vì numbers
4. `src/App.jsx` - Cập nhật allowedRoles với ROLES constants
5. `src/components/customer/ReviewsSection.jsx` - Import roleHelpers (tùy chọn)

## Liên hệ

Nếu có vấn đề về RBAC, kiểm tra:
1. Backend API documentation: `docs/RBAC_IMPLEMENTATION.md`
2. JWT token structure
3. Browser console để xem user object và roles
