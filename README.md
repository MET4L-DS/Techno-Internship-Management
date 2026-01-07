# Attendance Management System - Documentation

## Overview

The **Attendance Management System** is a web-based application that allows students to mark their attendance using multi-factor verification including camera capture, digital signature, and geolocation tracking. The system provides real-time statistics and supports both light and dark themes.

## Features

### 🎯 Core Functionality

-   **One-Click Attendance Marking** - Simple interface to mark daily attendance
-   **Multi-Factor Verification** - Ensures authenticity through:
    -   Live camera preview
    -   Digital signature capture
    -   GPS location tracking with interactive map
    -   Weather information display
-   **Duplicate Prevention** - Prevents marking attendance multiple times on the same day
-   **Persistent Storage** - Uses browser localStorage to maintain attendance records

### 📊 Analytics & Visualization

-   **Doughnut Chart** - Visual representation of attendance statistics
-   **Percentage Display** - Shows attendance percentage at a glance
-   **Present/Absent Counts** - Detailed breakdown of attendance record

### 🎨 User Experience

-   **Dark Mode Support** - Toggle between light and dark themes
-   **Responsive Design** - Works seamlessly on desktop and mobile devices
-   **Modern UI** - Clean, professional interface with smooth animations
-   **Real-time Feedback** - Instant visual confirmation when attendance is marked

## Technologies Used

### Frontend

-   **HTML5** - Semantic markup structure
-   **CSS3** - Advanced styling with CSS custom properties (variables)
-   **JavaScript (ES6+)** - Modern JavaScript with async/await

### External Libraries & APIs

| Library                    | Version | Purpose                               |
| -------------------------- | ------- | ------------------------------------- |
| **Font Awesome**           | 6.4.0   | Icon library for UI elements          |
| **Google Fonts (Poppins)** | -       | Typography                            |
| **Leaflet.js**             | 1.9.4   | Interactive maps for location display |
| **Chart.js**               | Latest  | Data visualization (doughnut chart)   |
| **Signature Pad**          | 4.1.7   | Digital signature capture             |

### Browser APIs

-   **MediaDevices API** - Camera access
-   **Geolocation API** - GPS coordinates
-   **LocalStorage API** - Data persistence

## File Structure

```
attendanceMenu1.html
├── HEAD Section
│   ├── Meta tags (charset, viewport)
│   ├── External stylesheets (fonts, icons, Leaflet)
│   ├── External scripts (Leaflet, Chart.js, Signature Pad)
│   └── Internal styles
├── BODY Section
│   ├── Container
│   │   ├── Navigation Header
│   │   │   ├── Back button
│   │   │   └── Theme toggle
│   │   ├── Page Header
│   │   └── Grid Layout
│   │       ├── Attendance Marking Card
│   │       │   ├── Status message (success state)
│   │       │   └── Attendance area
│   │       │       ├── Mark attendance button
│   │       │       └── Verification steps
│   │       │           ├── Camera preview
│   │       │           ├── Signature pad
│   │       │           ├── Location map & data
│   │       │           ├── Submit button
│   │       │           └── Reset button
│   │       └── Statistics Card
│   │           ├── Doughnut chart
│   │           └── Count summary
│   └── JavaScript Logic
└── END
```

## How It Works

### 1. **Page Initialization**

```javascript
const TOTAL_DAYS = 22; // Total attendance period
let presentCount = parseInt(localStorage.getItem("att_present") || "15");
const lastDate = localStorage.getItem("att_date");
const isMarked = lastDate === new Date().toDateString();
```

-   Loads attendance data from localStorage
-   Checks if attendance was already marked today
-   Displays appropriate UI based on marking status

### 2. **Attendance Marking Workflow**

#### Step 1: User clicks "Mark My Attendance"

-   Hides the initial button
-   Shows verification interface

#### Step 2: Camera Activation

```javascript
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
elements.video.srcObject = stream;
```

-   Requests camera permission
-   Displays live video preview

#### Step 3: Location Tracking

```javascript
navigator.geolocation.getCurrentPosition((p) => {
	const lat = p.coords.latitude;
	const lng = p.coords.longitude;
	// Initialize map and marker
});
```

-   Gets current GPS coordinates
-   Initializes Leaflet map with OpenStreetMap tiles
-   Places marker at user's location

#### Step 4: Signature Capture

```javascript
window.sigPad = new SignaturePad(canvas);
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
```

-   Initializes signature pad library
-   Sets canvas dimensions

#### Step 5: Submit Attendance

```javascript
if (sigPad.isEmpty()) return alert("Signature required!");
localStorage.setItem("att_present", presentCount + 1);
localStorage.setItem("att_date", new Date().toDateString());
```

-   Validates signature presence
-   Increments present count
-   Saves current date to prevent duplicates
-   Reloads page to show success state

### 3. **Statistics Display**

```javascript
const absentCount = TOTAL_DAYS - presentCount;
new Chart(document.getElementById("attendanceChart"), {
	type: "doughnut",
	data: {
		datasets: [
			{
				data: [presentCount, absentCount],
				backgroundColor: ["#4a90e2", "#dfe6e9"],
			},
		],
	},
});
```

-   Calculates absent days
-   Renders doughnut chart with Chart.js
-   Updates percentage and count displays

### 4. **Theme Toggle**

```javascript
elements.themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', 'dark' or 'light');
});
```

-   Toggles `dark-mode` class on body
-   Persists preference in localStorage
-   CSS variables automatically update colors

## CSS Architecture

### Custom Properties (CSS Variables)

The system uses CSS custom properties for theming:

#### Light Theme

```css
:root {
	--primary: #4a90e2; /* Brand blue */
	--surface: #ffffff; /* White cards */
	--text-main: #2d3436; /* Dark text */
	--bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
```

#### Dark Theme

```css
body.dark-mode {
	--primary: #5fa8ff; /* Brighter blue */
	--surface: #1e1e1e; /* Dark cards */
	--text-main: #e0e0e0; /* Light text */
	--bg-gradient: linear-gradient(
		135deg,
		#0f2027 0%,
		#203a43 50%,
		#2c5364 100%
	);
}
```

### Responsive Design

```css
@media (max-width: 768px) {
	.grid-layout {
		grid-template-columns: 1fr; /* Single column on mobile */
	}
}
```

## Data Storage

### LocalStorage Keys

| Key           | Type   | Description           | Example               |
| ------------- | ------ | --------------------- | --------------------- |
| `att_present` | Number | Count of days present | `15`                  |
| `att_date`    | String | Last marked date      | `"Tue Jan 07 2026"`   |
| `theme`       | String | Theme preference      | `"dark"` or `"light"` |

### Data Persistence

-   **Survives page reload** ✅
-   **Survives browser restart** ✅
-   **Shared across tabs** ✅
-   **Cleared on browser data wipe** ⚠️

## Setup & Usage

### Prerequisites

-   Modern web browser (Chrome, Firefox, Safari, Edge)
-   Camera access permission
-   Location services enabled
-   JavaScript enabled

### Installation

1. Clone or download the project files
2. Ensure `attendanceMenu1.html` is in the correct directory
3. Open the file in a web browser

### First-Time Usage

1. Navigate to the page
2. Click **"Mark My Attendance"**
3. Allow camera and location permissions when prompted
4. Provide digital signature on the canvas
5. Click **"Submit Attendance"**
6. View confirmation and updated statistics

### Daily Usage

-   The system automatically detects if attendance is already marked
-   Users can only mark attendance once per day
-   Click **"Refresh Status"** to reload the page

## Browser Compatibility

| Browser | Version | Support          |
| ------- | ------- | ---------------- |
| Chrome  | 53+     | ✅ Full          |
| Firefox | 36+     | ✅ Full          |
| Safari  | 11+     | ✅ Full          |
| Edge    | 79+     | ✅ Full          |
| IE 11   | -       | ❌ Not supported |

### Required Browser Features

-   ES6+ JavaScript support
-   CSS Grid & Flexbox
-   CSS Custom Properties
-   getUserMedia API
-   Geolocation API
-   Canvas API

## Security Considerations

### Current Implementation

⚠️ **Client-Side Only** - All data stored in browser localStorage

-   No server-side validation
-   No authentication
-   Easy to manipulate via DevTools

### Recommended Enhancements

1. **Server Integration** - Send attendance data to backend API
2. **User Authentication** - Login system to verify identity
3. **Photo Capture** - Store actual camera photo, not just preview
4. **Signature Verification** - Save signature image to server
5. **Location Validation** - Verify user is within allowed geofence
6. **Timestamp Recording** - Server-side timestamp to prevent manipulation
7. **Device Fingerprinting** - Track unique device identifiers

## Known Limitations

1. **No Server Backend** - Data only stored locally
2. **Static Weather** - Shows hardcoded "22°C Clear" (not real API)
3. **No Photo Capture** - Camera shows preview but doesn't save image
4. **No Data Export** - Cannot download or print attendance report
5. **Browser Dependent** - Data lost if localStorage is cleared
6. **Single User** - No multi-user support or profiles

## Future Enhancements

### Phase 1 - Backend Integration

-   [ ] Node.js/Express API server
-   [ ] PostgreSQL database for attendance records
-   [ ] RESTful API endpoints for CRUD operations
-   [ ] User authentication with JWT

### Phase 2 - Enhanced Verification

-   [ ] Actual photo capture and storage
-   [ ] Face recognition validation
-   [ ] Real-time weather API integration (OpenWeatherMap)
-   [ ] Geofencing (verify location within campus)
-   [ ] QR code scanning option

### Phase 3 - Analytics & Reporting

-   [ ] Monthly/semester reports
-   [ ] Export to PDF/Excel
-   [ ] Email notifications for low attendance
-   [ ] Admin dashboard for teachers
-   [ ] Historical trend analysis

### Phase 4 - Mobile App

-   [ ] Progressive Web App (PWA)
-   [ ] Native mobile apps (React Native)
-   [ ] Offline support with sync
-   [ ] Push notifications

## Code Maintenance

### Key Variables to Modify

```javascript
const TOTAL_DAYS = 22; // Change based on semester/month length
```

### Adding New Themes

1. Create new CSS variable set in `:root`
2. Add theme class to body
3. Update theme toggle logic

### Customizing Colors

Modify CSS custom properties in `:root` and `body.dark-mode`

## Troubleshooting

### Camera Not Working

-   Check browser permissions
-   Ensure HTTPS or localhost (getUserMedia requires secure context)
-   Try different browser

### Location Not Loading

-   Enable location services in browser settings
-   Check GPS on mobile devices
-   Grant permission when prompted

### Signature Not Saving

-   Ensure you draw on the canvas before submitting
-   Check for JavaScript errors in console

### Chart Not Displaying

-   Verify Chart.js CDN is loading
-   Check browser console for errors
-   Ensure canvas element exists

## Google Sheets Backend Integration

### Overview

The system can be integrated with Google Sheets using Google Apps Script as a serverless backend. This provides:

-   Cloud-based data storage
-   Real-time synchronization
-   No server setup required
-   Free hosting (within Google's quotas)

### Setup Instructions

#### 1. Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Attendance Management"
3. Note the Spreadsheet ID from the URL

#### 2. Deploy Apps Script

1. In your spreadsheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Copy the entire content from `Code.gs` file
4. Click **Save** (💾 icon)
5. Name your project "Attendance API"

#### 3. Run Setup Function

1. In Apps Script editor, select `setupSpreadsheet` from function dropdown
2. Click **Run** (▶️ icon)
3. Grant necessary permissions when prompted
4. Two sheets will be created: "Attendance Records" and "Students"

#### 4. Deploy as Web App

1. Click **Deploy > New deployment**
2. Click **Select type** ⚙️ > **Web app**
3. Configure:
    - **Description**: "Attendance API v1"
    - **Execute as**: Me
    - **Who has access**: Anyone
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this!

#### 5. Update HTML File

1. Open `attendanceMenu-GoogleSheets.html`
2. Find line: `const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
3. Replace with your copied Web App URL
4. Update `STUDENT_ID` and `STUDENT_NAME` with actual values

#### 6. Test the Integration

1. Open `attendanceMenu-GoogleSheets.html` in browser
2. Mark attendance
3. Check your Google Sheet - new row should appear!

### API Endpoints

#### GET Requests

```javascript
// Check if attendance marked today
GET: ?action=checkTodayAttendance&studentId=STU001

// Get student statistics
GET: ?action=getStudentStats&studentId=STU001

// Get all records for student
GET: ?action=getAllRecords&studentId=STU001
```

#### POST Requests

```javascript
// Mark attendance
POST: {
  action: 'markAttendance',
  studentId: 'STU001',
  studentName: 'John Doe',
  location: { lat: 28.6139, lng: 77.2090 },
  weather: '25°C Clear',
  signatureData: 'base64_string',
  photoData: 'base64_string'
}
```

### Data Schema

#### Attendance Records Sheet

| Column         | Type     | Description               |
| -------------- | -------- | ------------------------- |
| Timestamp      | DateTime | When record was created   |
| Student ID     | String   | Unique student identifier |
| Student Name   | String   | Full name                 |
| Date           | Date     | Attendance date           |
| Location (Lat) | Number   | GPS latitude              |
| Location (Lng) | Number   | GPS longitude             |
| Weather        | String   | Weather info              |
| Signature Data | String   | Base64 signature image    |
| Photo Data     | String   | Base64 photo              |
| Status         | String   | Present/Absent            |

#### Students Sheet

| Column        | Type   | Description       |
| ------------- | ------ | ----------------- |
| Student ID    | String | Unique identifier |
| Name          | String | Full name         |
| Email         | String | Email address     |
| Total Present | Number | Days present      |
| Total Absent  | Number | Days absent       |
| Attendance %  | String | Percentage        |

### Important Notes

⚠️ **CORS Limitations**: Google Apps Script requires `mode: 'no-cors'` which means you can't read the response directly. The script assumes success if no error is thrown.

⚠️ **Quotas**: Google Apps Script has usage quotas:

-   URL Fetch calls: 20,000/day
-   Script runtime: 6 min/execution
-   Triggers: 90 min/day

⚠️ **Response Time**: First request may be slow (~2-5 seconds) as script initializes

⚠️ **Image Storage**: Base64 images stored in cells. Large images may hit cell size limits (50,000 characters)

### Troubleshooting Apps Script

**Issue**: "Script function not found"

-   Solution: Make sure you saved the script and refreshed the deployment

**Issue**: "Permission denied"

-   Solution: Re-run setup and grant all requested permissions

**Issue**: "Cannot read property of undefined"

-   Solution: Check that sheet names match exactly: "Attendance Records" and "Students"

**Issue**: Data not appearing in sheet

-   Solution: Check browser console for errors, verify SCRIPT_URL is correct

### Upgrading from localStorage

To migrate existing localStorage data to Google Sheets:

```javascript
// Run this in browser console on old page
const present = localStorage.getItem("att_present");
console.log("Present count:", present);
// Manually add initial record to Google Sheet
```

## Credits

-   **Map Integration**: @Atul Prakash
-   **Icons**: Font Awesome
-   **Fonts**: Google Fonts (Poppins)
-   **Maps**: Leaflet.js with OpenStreetMap tiles
-   **Charts**: Chart.js
-   **Signature**: Signature Pad library
-   **Backend**: Google Apps Script & Google Sheets

## License

This project is part of the Techno Internship Management system.

---

**Last Updated**: January 2026  
**Version**: 2.0 (Google Sheets Integration)  
**Author**: ManageThem Team
