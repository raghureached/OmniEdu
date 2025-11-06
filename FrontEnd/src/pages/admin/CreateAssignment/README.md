# Assignment Manager V2 - Enhanced Assignment Creation

## Overview

This is a comprehensive assignment creation system built with React, featuring a 4-step wizard interface for creating and managing learning content assignments. The implementation is based on the `Assignment_V2.html` reference file and maintains the app's existing theming.

## Features

### ✨ Core Functionality

1. **4-Step Wizard Interface**
   - Step 1: Select Content Type & Item
   - Step 2: Select Users/Teams
   - Step 3: Schedule & Settings
   - Step 4: Review & Confirm

2. **Content Selection**
   - Support for Modules, Assessments, Surveys, and Learning Paths
   - Filter by team and sub-team
   - Visual content type indicators with badges
   - Single item selection with radio buttons

3. **User Selection (3 Modes)**
   - **Individual Users**: Select specific users with search and filters
   - **Team Assignment**: Assign to entire teams/groups
   - **Bulk Email Entry**: Enter up to 50 email addresses (one per line)

4. **Advanced Scheduling**
   - Assign date & time (immediate or scheduled)
   - Due date & time (optional)
   - Email notifications toggle
   - Reminder notifications (auto-calculated based on due date)
   - Progress reset option for re-assignments
   - Recurring assignments with custom intervals

5. **Recurring Assignments**
   - Predefined intervals (1m, 3m, 6m, 1y)
   - Custom interval configuration
   - Automatic progress reset with each cycle
   - Continuous until deactivation

6. **Real-time Summary Panel**
   - Live updates as you configure
   - Content type and item display
   - User count tracking
   - Schedule summary
   - Notification settings overview
   - Total assignments calculation
   - Warning for large assignments (>50)

7. **Review & Confirmation**
   - Complete assignment review
   - Confirmation modal with all details
   - Save as draft option
   - Final confirmation before creation

## File Structure

```
CreateAssignment/
├── components/
│   ├── Step1ContentSelection.jsx    # Content type & item selection
│   ├── Step2UserSelection.jsx       # User/team/bulk email selection
│   ├── Step3ScheduleSettings.jsx    # Scheduling & advanced settings
│   ├── Step4ReviewConfirm.jsx       # Review & confirmation modal
│   └── SummaryPanel.jsx             # Real-time summary sidebar
├── CreateAssignmentEnhanced.jsx     # Main component (NEW)
├── CreateAssignment.jsx             # Original component (PRESERVED)
├── CreateAssignment.css             # Original styles (PRESERVED)
├── CreateAssignmentV2.css           # New V2 styles
└── Assignment_V2.html               # Reference HTML file
```

## Usage

### Import and Use

```jsx
import CreateAssignmentEnhanced from './pages/admin/CreateAssignment/CreateAssignmentEnhanced';

// In your router or parent component
<CreateAssignmentEnhanced />
```

### Component Props

The main component doesn't require any props. It uses Redux for state management and fetches all necessary data on mount.

### Redux Dependencies

The component requires the following Redux slices:
- `adminModule` - For modules/content
- `globalAssessments` - For assessments
- `surveys` - For surveys
- `learningPaths` - For learning paths
- `users` - For user list
- `adminAssignmnetSlice` - For creating assignments

## Key Features Explained

### 1. Content Type Selection (Step 1)

- **Radio button interface** for selecting content type
- **Dynamic filtering** by team and sub-team
- **Visual badges** for each content type:
  - 🔵 Module (blue)
  - 🟣 Assessment (purple)
  - 🟠 Survey (orange)
  - 🟢 Learning Path (green)

### 2. User Selection (Step 2)

**Individual Mode:**
- Search by name or email
- Filter by team and sub-team
- Checkbox selection for multiple users
- Visual selection feedback

**Team Mode:**
- Select entire teams/groups
- Multiple team selection supported
- Search teams by name

**Bulk Email Mode:**
- Paste up to 50 email addresses
- One email per line
- Real-time counter with warnings
- Validation for maximum limit

### 3. Schedule & Settings (Step 3)

**Date/Time Configuration:**
- Assign date & time (optional - defaults to immediate)
- Due date & time (optional)
- Validation: due date must be after assign date

**Toggle Options:**
- ✉️ **Email Notification**: Send email when assigned
- 🔔 **Reminders**: Auto-reminder based on due date
  - With due date: 2 days before
  - Without due date: 7 working days after assignment
- 🔄 **Reset Progress**: Reset existing user progress
- 🔁 **Recurring Assignment**: Auto-reassign after completion

**Recurring Configuration:**
- Predefined intervals: 1m, 3m, 6m, 1y
- Custom interval: specify number + unit (days/weeks/months/years)
- Automatic behavior info display

**Advanced Settings (Learning Paths only):**
- Individual element scheduling (placeholder for future feature)
- Warning about recurring compatibility

### 4. Review & Confirm (Step 4)

**Review Sections:**
- 📚 Content details
- 👥 Recipient count and mode
- 📅 Schedule summary
- 🔔 Notification settings
- 📊 Total assignments

**Confirmation Modal:**
- Final review before submission
- All settings displayed
- Cancel or confirm options

**Actions:**
- ← Back to previous step
- 💾 Save as Draft
- ✓ Confirm & Assign

## Styling

The component uses a combination of:
- **CreateAssignment.css**: Original app theming (preserved)
- **CreateAssignmentV2.css**: New V2 styles matching the HTML reference

### Color Scheme

- **Primary**: `#5570f1` (blue)
- **Success**: `#27ae60` (green)
- **Warning**: `#f39c12` (orange)
- **Error**: `#e74c3c` (red)
- **Text**: `#2c3e50` (dark gray)
- **Muted**: `#7f8c8d` (gray)
- **Background**: `#f5f7fa` (light gray)

### Key CSS Classes

- `.progress-steps` - Step indicator
- `.assignment-section` - Main content card
- `.radio-option` - Content type selection
- `.item-card` - Content item card
- `.user-card` - User selection card
- `.toggle-group` - Toggle switch container
- `.summary-panel` - Sticky summary sidebar
- `.modal` - Confirmation modal

## Validation

### Step 1 Validation
- Content type must be selected
- At least one item must be selected

### Step 2 Validation
- **Individual mode**: At least one user selected
- **Team mode**: At least one team selected
- **Bulk mode**: 1-50 valid email addresses

### Step 3 Validation
- Due date must be after assign date (if both provided)
- Recurring interval must be selected if recurring enabled
- Custom interval value must be ≥ 1 if custom selected

## API Integration

The component dispatches the following action on confirmation:

```javascript
dispatch(admincreateAssignment(payload))
```

**Payload Structure:**
```javascript
{
  contentType: string,           // 'Module', 'Assessment', 'Survey', 'Learning Path'
  contentId: string,             // Selected item ID
  contentName: string,           // Selected item title
  assignDate: string,            // ISO date or current date
  dueDate: string,               // ISO date or empty
  notifyUsers: boolean,          // Email notification flag
  isRecurring: boolean,          // Recurring assignment flag
  assignedUsers: array,          // User IDs (individual mode)
  groups: array,                 // Group IDs (team mode)
  bulkEmails: array,             // Email addresses (bulk mode)
  enableReminder: boolean,       // Reminder flag
  resetProgress: boolean,        // Reset progress flag
  recurringInterval: string,     // '1m', '3m', '6m', '1y', 'custom'
  customIntervalValue: string,   // Number for custom interval
  customIntervalUnit: string     // 'days', 'weeks', 'months', 'years'
}
```

## Responsive Design

The component is fully responsive with breakpoints at:
- **968px**: Switches to single column layout
- **640px**: Stacks buttons and simplifies layout

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support
- Uses CSS Grid and Flexbox

## Future Enhancements

- [ ] Advanced element scheduling for Learning Paths
- [ ] Drag-and-drop for bulk email upload
- [ ] Assignment templates
- [ ] Batch assignment history
- [ ] Export assignment reports
- [ ] Calendar view for scheduled assignments

## Migration from Original Component

To switch from the original `CreateAssignment.jsx` to the enhanced version:

1. Update your route/import:
   ```jsx
   // Before
   import CreateAssignment from './pages/admin/CreateAssignment/CreateAssignment';
   
   // After
   import CreateAssignmentEnhanced from './pages/admin/CreateAssignment/CreateAssignmentEnhanced';
   ```

2. The component maintains the same Redux integration, so no store changes needed.

3. Both components can coexist - the original is preserved for backward compatibility.

## Troubleshooting

### Issue: Users not loading
**Solution**: Ensure `fetchUsers()` action is dispatched and users slice is properly configured.

### Issue: Styles not applying
**Solution**: Verify both CSS files are imported in the correct order:
```jsx
import './CreateAssignment.css';
import './CreateAssignmentV2.css';
```

### Issue: Assignment creation fails
**Solution**: Check Redux action `admincreateAssignment` and ensure backend endpoint is accessible.

## Credits

- Based on `Assignment_V2.html` reference design
- Maintains OmniEdu app theming and color scheme
- Built with React, Redux, and modern CSS
