# Rahmath Organics

## Current State
Admin panel uses Internet Identity for auth.

## Requested Changes (Diff)

### Add
- Username/password login form (username: admin, password: rahmath@2024)
- Auth state in localStorage key rahmath_admin_auth

### Modify
- Replace Internet Identity login UI with username/password form
- Replace logout to clear local auth
- Remove backend isAdmin check

### Remove
- useInternetIdentity hook and useIsCallerAdmin from AdminPage.tsx

## Implementation Plan
1. Add local isLoggedIn state backed by localStorage
2. Show login card with username + password inputs
3. Validate against hardcoded credentials on submit
4. Clear localStorage on logout
