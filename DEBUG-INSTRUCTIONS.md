# Debugging Google Sheets Attendance System

## Issue: Students Sheet Not Updating

### Steps to Debug in Apps Script:

1. **Open Apps Script Editor**

    - Open your Google Spreadsheet
    - Extensions > Apps Script

2. **Check Execution Logs**

    - Click **Executions** (clock icon on left sidebar)
    - Look for recent POST requests when you marked attendance
    - Check for any errors in red

3. **Run Manual Test**

    - In the Apps Script editor, select `testAPI` function from dropdown
    - Click **Run** ▶️
    - Check the **Execution log** (Ctrl+Enter or View > Logs)
    - You should see:
        ```
        Spreadsheet setup complete!
        Updating student STU001: Present=1, Absent=21, %=5
        Student stats updated successfully
        ```

4. **Verify Student ID Match**

    - Go to "Students" sheet in your spreadsheet
    - **Important:** Check that column A, row 2 exactly says `STU001` (not `Stu001` or `stu001`)
    - Check that it's in the exact format without extra spaces

5. **Common Issues:**

    **Issue A: Case Sensitivity**

    - Student ID in code: `STU001`
    - Student ID in sheet: might be `Stu001` or different case
    - **Fix:** Make both exactly match (recommended: all UPPERCASE)

    **Issue B: Extra Spaces**

    - Student ID might have spaces: `STU001 ` or ` STU001`
    - **Fix:** Trim spaces in the spreadsheet cell

    **Issue C: Sheet Not Found**

    - Check that sheet is named exactly `Students` (not `Student` or `students`)
    - **Fix:** Rename sheet to exact match

### Manual Fix to Update Students Sheet:

If automatic update isn't working, you can manually run this in Apps Script:

1. **Open Apps Script editor**
2. **Paste this code in a new function:**

```javascript
function manualUpdateStats() {
	updateStudentStats("STU001");
	Logger.log("Manual update complete");

	// Check the Students sheet
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const studentsSheet = ss.getSheetByName("Students");
	const values = studentsSheet.getRange("A2:F2").getValues();
	Logger.log("Student data: " + JSON.stringify(values));
}
```

3. **Run `manualUpdateStats` function**
4. **Check logs** (Ctrl+Enter)

### Expected Behavior:

After marking attendance:

-   **Attendance Records** sheet: New row with timestamp, student info, location, signature
-   **Students** sheet: Row 2 columns D, E, F should update:
    -   D (Total Present): Should increment (e.g., 0 → 1)
    -   E (Total Absent): Should decrement (e.g., 22 → 21)
    -   F (Attendance %): Should calculate (e.g., 0% → 5%)

### If Still Not Working:

**Re-deploy the script:**

1. In Apps Script, click **Deploy > Manage deployments**
2. Click ✏️ edit icon
3. Click **New version** in Description
4. Click **Deploy**
5. **Copy the new URL**
6. Update `SCRIPT_URL` in your HTML file

### Verify Data Flow:

**Check browser console (F12 in browser):**

-   You should see: `Stats received: {success: true, data: {presentCount: 1, ...}}`
-   If you see `presentCount: 0`, the issue is in Apps Script counting

**Check Apps Script logs:**

-   Should show: `Updating student STU001: Present=1, Absent=21, %=5`
-   If this doesn't appear, the `updateStudentStats` function isn't being called

---

## Quick Test Checklist:

-   [ ] Student ID in Students sheet (A2) is exactly `STU001`
-   [ ] Students sheet is named exactly `Students`
-   [ ] Apps Script has been deployed as Web App
-   [ ] Execution permissions granted (run `setupSpreadsheet`)
-   [ ] Re-deployed with "New version" after code changes
-   [ ] Browser console shows no CORS errors
-   [ ] Checked Apps Script execution logs for errors
