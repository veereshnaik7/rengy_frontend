# Mini CRM Frontend

React frontend for the Mini CRM MERN application. It provides a complete authentication UI, protected dashboard routes, responsive contacts management, pagination, validation, contact activity logs, profile management, and CSV export.

## Live Project Links

- Live frontend URL: https://rengy-frontend-lake.vercel.app/
- Live backend API URL: http://localhost:3000/api
- Backend base URL: http://localhost:3000/
- Frontend GitHub repository: https://github.com/veereshnaik7/rengy_frontend
- Backend GitHub repository: https://github.com/veereshnaik7/rengy_backend

## Project Status

This frontend currently implements the required assignment frontend features:

- Sign up page
- Login page
- Email OTP verification page
- Forgot password page
- Reset password page
- JWT cookie-based session handling with backend
- Session restore using refresh-token API
- Protected frontend routes
- Redirect to login when user is not authenticated
- Contacts dashboard after login
- Add contact
- Edit contact
- Delete contact
- View contacts list
- View contact details
- Search contacts by name/email
- Filter contacts by status
- Contact pagination: 10 items per page
- Per-contact activity logs
- Activity log pagination: 3 logs per page
- Field-level activity changes for add/edit/delete events
- Responsive layout for desktop, tablet, and mobile
- Responsive stats cards: 2 per row on mobile/tablet, odd final stat spans full row
- Form validation with Yup
- Form handling with Formik
- Profile update
- Change password
- Toast notifications
- CSV export for contacts
- Unit tests with Vitest

## Tech Stack

- React
- TypeScript
- Vite
- Redux Toolkit
- React Redux
- React Router
- Axios
- Formik
- Yup
- Tailwind CSS
- Lucide React icons
- Vitest

## Folder Structure

```txt
frontend/
  public/
  src/
    app/
      hooks.ts                 # Typed Redux hooks
      store.ts                 # Redux store
    assets/
      hero.png
    components/
      ProtectedRoute.tsx       # Frontend auth guard
      ToastProvider.tsx        # Toast notification context
    features/
      api.ts                   # Main Axios client + refresh retry
      auth/
        authApi.ts             # Auth Axios client
        authSlice.ts           # Auth state and async actions
    pages/
      auth/
        AuthBox.tsx
        ForgotPassword.tsx
        Login.tsx
        Register.tsx
        ResetPassword.tsx
        VerifyUser.tsx
      Dashboard/
        Contacts.tsx           # Main CRM dashboard
        Dashboard.tsx          # Protected shell + sidebar
        Profile.tsx            # Profile and change password
    validation/
      formSchemas.ts           # Yup schemas
      formSchemas.test.ts      # Unit tests
    App.tsx
    main.tsx
```

## Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

For deployment, set this to the live backend API:

```env
VITE_API_URL=http://localhost:3000/api
```

## Local Setup

Local URLs:

```txt
Frontend dev server: http://localhost:5173
Backend API server: http://localhost:3000/api
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run unit tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

## App Routes

Public routes:

```txt
/login
/register
/verify-user
/forgot-password
/reset-password
```

Protected routes:

```txt
/contacts
/profile
```

Default route behavior:

- `/` opens login.
- Authenticated dashboard index redirects to `/contacts`.
- Unknown protected paths redirect to `/contacts`.
- Unauthenticated protected-route access redirects to `/login`.

## Authentication Flow

1. User registers on `/register`.
2. Frontend sends name, email, password, and confirm password to backend.
3. Backend sends OTP to the user's email.
4. Frontend redirects to `/verify-user?email=user@example.com`.
5. User verifies OTP.
6. User logs in on `/login`.
7. Backend sets HTTP-only access and refresh token cookies.
8. Frontend stores only safe user/auth state in Redux.
9. `ProtectedRoute` blocks dashboard access until session is confirmed.
10. On app reload, frontend calls refresh-token API and then loads `/users/me`.
11. If access token expires during API use, Axios refreshes and retries the request.
12. Logout clears backend cookies and frontend auth state.

## Token Handling

The frontend does not store JWTs in localStorage or sessionStorage.

Axios is configured with:

```ts
withCredentials: true
```

This allows the backend to manage secure HTTP-only cookies.

The main API client includes a `401` interceptor:

- If a request fails with `401`, it calls `/auth/refresh-token`.
- After refresh succeeds, it retries the original request.
- Refresh requests are deduplicated so multiple failed requests do not trigger multiple refresh calls.

## Contacts Dashboard

After login, users land on the Contacts Dashboard.

Contact fields:

- Name
- Email
- Phone
- Company
- Status: Lead / Prospect / Customer
- Notes
- CreatedAt
- UpdatedAt

Dashboard features:

- Summary stats
- Search by name/email
- Filter by status
- Add contact modal
- Edit contact modal
- Delete contact action
- View contact details modal
- Per-contact activity modal
- Contact list pagination
- CSV export

## Pagination

Contacts:

```txt
10 contacts per page
```

Activity logs:

```txt
3 logs per page
```

Activity log serial numbers continue across pages:

```txt
Page 1: 01, 02, 03
Page 2: 04, 05, 06
```

## Activity Logs

Each contact row has an `Activity` button.

The activity modal shows:

- Serial number
- Action: created / updated / deleted
- Message
- User who performed the action
- Timestamp
- Field-level changes

Example edit activity:

```txt
Status: Lead -> Customer
Phone: 98765 -> 99999
```

Example create activity:

```txt
Email: set to asha@example.com
Company: set to Jaimax
```

Example delete activity:

```txt
Company: was Jaimax
Status: was Customer
```

If a contact edit submits the same values, backend returns `No content changed`; the frontend shows that message and no new activity is added.

## CSV Export

The Contacts Dashboard downloads CSV from the backend using the logged-in user's protected session. Export respects the current search and status filters, but it is not limited to the current 10-item page.

Exported fields:

- User ID
- Contact ID
- Name
- Email
- Phone
- Company
- Status
- Notes
- Created At
- Updated At

## Profile Management

The Profile page supports:

- Load logged-in user profile
- Update name/email
- Update Redux user state immediately after save
- Change password
- Logout after password change

## Validation

Validation is implemented with Yup.

Forms covered:

- Login
- Register
- Email verification OTP
- Forgot password
- Reset password
- Profile update
- Change password
- Contact create/edit

Contact validation:

- Name required, 2-80 characters
- Valid email required
- Phone required with valid phone characters
- Company required, 2-100 characters
- Status must be Lead, Prospect, or Customer
- Notes max 1000 characters

## Responsive UI

The app is responsive across desktop, tablet, and mobile:

- Mobile dashboard uses a slide-in sidebar.
- Desktop dashboard uses a sticky sidebar.
- Stats cards show 2 per row on mobile/tablet.
- If stats count is odd, the final card spans the full row.
- Contact rows collapse into readable stacked layouts on smaller screens.
- Modals are constrained to the viewport and scroll internally.
- Activity pagination buttons stack on small screens.

## State Management

Redux Toolkit manages authentication state:

```txt
user
loading
error
message
isAuthenticated
authChecked
```

Async auth actions:

- `registerUser`
- `loginUser`
- `verifyUser`
- `restoreSession`
- `logoutUser`
- `forgotPassword`
- `resetPassword`

Profile updates use `updateCurrentUser` so the sidebar updates without requiring a page refresh.

## API Integration

Frontend calls the backend through Axios.

Main API client:

```txt
src/features/api.ts
```

Auth API client:

```txt
src/features/auth/authApi.ts
```

Important API paths used:

```txt
POST /auth/register
POST /auth/isverify
POST /auth/login
POST /auth/refresh-token
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/change-password

GET /users/me
PATCH /users/update

GET /contacts
POST /contacts
PATCH /contacts/:id
DELETE /contacts/:id

GET /activity-logs/contacts/:contactId
```

## Tests

The frontend uses Vitest.

Run:

```bash
npm test
```

Current frontend tests cover:

- Valid contact form values
- Invalid contact status validation

## Deployment On Vercel

### 1. Push Frontend To GitHub

Frontend repository:

```txt
https://github.com/veereshnaik7/rengy_frontend
```

### 2. Create Vercel Project

In Vercel:

- Import the frontend GitHub repository.
- Framework preset: Vite
- Build command:

```bash
npm run build
```

- Output directory:

```txt
dist
```

### 3. Add Environment Variable

In Vercel project settings:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Update Backend CORS

In Render backend env variables:

```env
FRONTEND_URL=https://rengy-frontend-lake.vercel.app
```

This value must not include a trailing slash because the backend checks the exact frontend origin for credentialed CORS and HTTP-only cookies.

### 5. Redeploy

Redeploy both services after environment changes:

- Backend on Render
- Frontend on Vercel

## Backend Dependency

This frontend expects the backend to be running with:

- MongoDB configured
- Email credentials configured for OTP
- Upstash Redis configured for login rate limiting
- CORS `FRONTEND_URL` set correctly
- Cookie auth enabled

## Assignment Checklist

Frontend requirements:

- [x] React frontend
- [x] Responsive layout
- [x] Authentication pages
- [x] Login page
- [x] Signup page
- [x] OTP verification page
- [x] Forgot/reset password pages
- [x] Contacts dashboard page
- [x] Form validation
- [x] Protected routes
- [x] Redirect if not logged in
- [x] Contact list
- [x] Add contact
- [x] Edit contact
- [x] Delete contact
- [x] Search by name/email
- [x] Filter by status
- [x] Pagination: 10 contacts per page
- [x] Activity logs for add/edit/delete
- [x] Activity log pagination
- [x] Unit tests
- [x] CSV export
- [x] Profile management
- [x] Admin/User role displayed in auth data when backend provides it
- [x] Vercel deployment ready

Full project deliverables:

- [x] Live frontend URL: https://rengy-frontend-lake.vercel.app/
- [x] Live backend API URL: https://rengy-backend-nrla.onrender.com/api
- [x] GitHub frontend repository: https://github.com/veereshnaik7/rengy_frontend
- [x] GitHub backend repository: https://github.com/veereshnaik7/rengy_backend
- [x] Frontend README
- [x] Backend README

## Notes

- Tokens are handled by backend cookies, not browser storage.
- New users must verify email OTP before login.
- Login rate limiting is enforced by the backend.
- Contacts are loaded 10 per page.
- Activity logs are opened per contact from the row-level Activity button.
- Activity logs show exact changed fields.
- CSV export downloads all matching contacts from the backend for the logged-in user.
