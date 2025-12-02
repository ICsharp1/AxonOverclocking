# Authentication Testing Guide

Quick guide to test the authentication system is working correctly.

## Prerequisites

1. Development server is running: `npm run dev`
2. Server should be at: http://localhost:3000
3. Database is set up and migrations are applied

## Test Flow

### 1. Test Registration

1. Open browser to: http://localhost:3000/register
2. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create Account"
4. Expected result: Auto-login and redirect to /dashboard
5. You should see: "Welcome, testuser!" on the dashboard

### 2. Test Logout

1. On the dashboard page, click "Sign Out"
2. Expected result: Redirect to home page (/)

### 3. Test Login

1. Navigate to: http://localhost:3000/login
2. Enter credentials:
   - Username: `testuser`
   - Password: `password123`
3. Click "Sign In"
4. Expected result: Redirect to /dashboard
5. Dashboard should show your username and user info

### 4. Test Failed Login

1. Navigate to: http://localhost:3000/login
2. Enter incorrect credentials:
   - Username: `testuser`
   - Password: `wrongpassword`
3. Click "Sign In"
4. Expected result: Error message "Invalid username or password"
5. Should remain on login page

### 5. Test Route Protection

1. Sign out if logged in
2. Try to access: http://localhost:3000/dashboard
3. Expected result: Automatic redirect to /login?callbackUrl=/dashboard
4. After logging in, should redirect back to /dashboard

### 6. Test Duplicate Prevention

1. Sign out if logged in
2. Try to register again with:
   - Username: `testuser` (same as before)
   - Email: `newemail@example.com`
   - Password: `password456`
3. Expected result: Error "Username already taken"

4. Try again with:
   - Username: `newuser`
   - Email: `test@example.com` (same as before)
   - Password: `password456`
5. Expected result: Error "Email already registered"

### 7. Test Session Persistence

1. Log in to the dashboard
2. Refresh the page (F5)
3. Expected result: Should stay logged in, no redirect
4. Dashboard should still show your user info

### 8. Verify Database

1. Open Prisma Studio: `npx prisma studio`
2. Navigate to: http://localhost:5555
3. Check the User table:
   - Should see your registered user
   - Password field should be a long hash (not plaintext)
   - Username and email should match what you entered

## Validation Tests

### Username Validation

1. Try to register with username: `ab` (too short)
2. Expected: Error "Username must be at least 3 characters"

3. Try username: `user@name` (invalid character)
4. Expected: Error about alphanumeric characters only

### Email Validation

1. Try to register with email: `notanemail`
2. Expected: Error "Please enter a valid email address"

### Password Validation

1. Try to register with password: `12345` (too short)
2. Expected: Error "Password must be at least 6 characters"

3. Try password: `password123`, confirm: `password456`
4. Expected: Error "Passwords do not match"

## Google OAuth Testing (Optional)

If you've configured Google OAuth credentials:

1. Navigate to: http://localhost:3000/login
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Expected result: Account created or linked, redirect to /dashboard

## Common Issues

### Port Already in Use
- Stop other dev servers
- Kill node processes: `taskkill //F //IM node.exe` (Windows)

### Database Errors
- Run migrations: `npx prisma migrate dev`
- Reset database: `npx prisma migrate reset` (dev only)

### Module Not Found
- Install dependencies: `npm install`
- Restart dev server

### Session Not Persisting
- Check NEXTAUTH_SECRET is set in .env
- Clear browser cookies
- Restart dev server

## Success Criteria

All tests should pass:
- [x] Can register new user
- [x] Password is hashed in database
- [x] Can login with correct credentials
- [x] Login fails with wrong credentials
- [x] Duplicate username/email blocked
- [x] Protected routes redirect when not authenticated
- [x] Session persists across refreshes
- [x] Logout works correctly
- [x] Validation errors display correctly

## Next Steps

Once all tests pass, you're ready to:
1. Proceed to Phase 3 (Content Service)
2. Build training modules that use authentication
3. Implement user progress tracking
4. Create personalized experiences

---

**Current Status**: Development server running at http://localhost:3000
**Ready for**: Manual testing and Phase 3 integration
