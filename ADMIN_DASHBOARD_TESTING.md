# Admin Dashboard Testing Guide

## Quick Start

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Admin Dashboard

- URL: `http://localhost:5173/admin-dashboard`
- Requires Clerk authentication
- User must have `publicMetadata.isAdmin = true`

## Testing the Admin Dashboard

### Test 1: Language Switching

1. Go to `/admin-dashboard`
2. Locate Language Switcher (typically in top-right)
3. Click dropdown
4. Select different language
5. **Expected**:
   - All text updates immediately
   - Arabic shows RTL layout (text right-aligned)
   - Language preference saved to localStorage
   - Refresh page - language persists

### Test 2: Overview Tab

1. Click "Overview" tab
2. **Expected**:
   - Dashboard statistics load from backend
   - Shows cards for Users, Creations, Videos, Complaints
   - All numbers display correctly
   - No loading spinner after data loads

### Test 3: Users Tab

1. Click "Users" tab
2. **Expected**:
   - User table loads with data
   - Shows 10 users per page
   - Pagination controls visible
   - Can click "Block" to block/unblock users
   - Can click "Delete" to delete users
   - Toast shows success message

**Test Block/Unblock User**:

1. Click "Block" button on any user
2. **Expected**: Toast shows "User blocked successfully"
3. Button changes to "Unblock"
4. Click "Unblock"
5. **Expected**: Toast shows "User unblocked successfully"

### Test 4: Plans (Packs) Tab

1. Click "Plans" tab
2. **Expected**:
   - Card grid displays all existing packs
   - Shows pack name, price, description, monthly limit
   - "Create New Plan" button visible at top
   - Each pack has Edit and Delete buttons

**Test Create Plan**:

1. Click "Create New Plan"
2. Fill form:
   - Name: "Premium Plus"
   - Description: "Best plan for professionals"
   - Price: "49.99"
   - Monthly Limit: "500"
3. Click "Save"
4. **Expected**:
   - Modal closes
   - Toast shows "Plan created successfully"
   - New plan appears in card grid

**Test Edit Plan**:

1. Click "Edit" on any plan
2. Modify price to "59.99"
3. Click "Save"
4. **Expected**:
   - Toast shows "Plan updated successfully"
   - Plan card updates with new price

**Test Delete Plan**:

1. Click "Delete" on any plan
2. Confirm in dialog
3. **Expected**:
   - Toast shows "Plan deleted successfully"
   - Plan disappears from grid

### Test 5: FAQs Tab

1. Click "FAQs" tab
2. **Expected**:
   - List displays all FAQs
   - Shows question, answer, category
   - "Create New FAQ" button visible
   - Each FAQ has Edit and Delete buttons

**Test Create FAQ**:

1. Click "Create New FAQ"
2. Fill form:
   - Question: "How do I upgrade my plan?"
   - Answer: "Click on the Plans page and select the new plan you want."
   - Category: "Subscription"
3. Click "Save"
4. **Expected**:
   - Modal closes
   - Toast shows "FAQ created successfully"
   - New FAQ appears in list

**Test Edit FAQ**:

1. Click "Edit" on any FAQ
2. Modify answer
3. Click "Save"
4. **Expected**:
   - Toast shows "FAQ updated successfully"
   - FAQ updates in list

### Test 6: Complaints Tab

1. Click "Complaints" tab
2. **Expected**:
   - List of all complaints loads
   - Shows title, from (email), status, description
   - Status badges show correct colors:
     - Red for "Open"
     - Yellow for "In Progress"
     - Green for "Resolved"

**Test Respond to Complaint**:

1. Click "Respond" on any open complaint
2. Type response: "Thank you for reporting this issue. We'll look into it."
3. Click "Save"
4. **Expected**:
   - Modal closes
   - Toast shows "Complaint updated successfully"
   - Complaint status changes to "Resolved"
   - Admin response visible in complaint

### Test 7: Analytics Tab (Future)

1. Click "Analytics" tab
2. **Expected**:
   - Placeholder message visible
   - "Coming soon..." text displays

## Language-Specific Testing

### English (Default)

- All labels in English
- LTR (left-to-right) layout
- Standard western UI layout

### Français (French)

- All labels translated to French
- LTR layout
- Proper French terminology used

### العربية (Arabic)

- All labels in Arabic
- **RTL (right-to-left) layout**
- Text alignment changes
- UI components mirror
- Proper Arabic typography

**Arabic-Specific Test**:

1. Switch language to Arabic
2. Check that:
   - Page direction changes to RTL
   - Text is right-aligned
   - Input fields right-aligned
   - Buttons properly positioned
   - No text overflow
   - All icons display correctly

## API Testing

The admin dashboard makes requests to these endpoints:

### Dashboard Stats

```bash
GET /api/admin/dashboard-stats
```

### Users

```bash
GET /api/admin/get-all-users?page=1&limit=10
PUT /api/admin/toggle-user-status/:id
DELETE /api/admin/delete-user/:id
```

### Packs

```bash
GET /api/packs/get-all-packs
POST /api/packs/create-pack
PUT /api/packs/update-pack/:id
DELETE /api/packs/delete-pack/:id
```

### FAQs

```bash
GET /api/support/get-faqs
POST /api/support/create-faq
PUT /api/support/update-faq/:id
DELETE /api/support/delete-faq/:id
```

### Complaints

```bash
GET /api/support/get-all-complaints
PUT /api/support/update-complaint/:id
```

## Troubleshooting

### Admin Dashboard Not Accessible

- Check that user is logged in with Clerk
- Verify `publicMetadata.isAdmin = true` in Clerk user settings
- Check browser console for auth errors

### Language Not Switching

- Check that localStorage is enabled
- Refresh page after switching language
- Check browser console for i18n errors

### Data Not Loading

- Check that backend server is running
- Verify API endpoints are working (test with Postman)
- Check network tab in browser DevTools
- Verify authentication token is valid

### RTL Not Working for Arabic

- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check that `dir="rtl"` is set on html element

## Performance Notes

- Dashboard loads statistics on mount
- Each tab loads data when clicked
- Pagination prevents loading too many users
- All operations show loading states
- Error handling prevents blank screens

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Notes

- Admin credentials required to access dashboard
- All operations are logged for audit trail
- Data persistence handled by PostgreSQL backend
- i18n configuration persists language choice to localStorage
- RTL support auto-activates for Arabic language
