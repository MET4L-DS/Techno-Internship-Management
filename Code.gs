/**
 * Google Apps Script Backend for Attendance System
 * This script serves as a REST API to handle attendance data in Google Sheets
 */

// ========== CONFIGURATION ==========
const SHEET_NAME = "Attendance Records";
const STUDENTS_SHEET = "Students";
const WORK_LOCATIONS_SHEET = "Work Locations";

/**
 * Initialize the spreadsheet with required sheets and headers
 */
function setupSpreadsheet() {
	const ss = SpreadsheetApp.getActiveSpreadsheet();

	// Create Attendance Records sheet
	let attendanceSheet = ss.getSheetByName(SHEET_NAME);
	if (!attendanceSheet) {
		attendanceSheet = ss.insertSheet(SHEET_NAME);
		attendanceSheet.appendRow([
			"Timestamp",
			"Student ID",
			"Student Name",
			"Date",
			"Location (Lat)",
			"Location (Lng)",
			"Weather",
			"Signature Data",
			"Photo Data",
			"Status",
		]);
		attendanceSheet
			.getRange("A1:J1")
			.setFontWeight("bold")
			.setBackground("#4a90e2")
			.setFontColor("#ffffff");
	}

	// Create Students sheet
	let studentsSheet = ss.getSheetByName(STUDENTS_SHEET);
	if (!studentsSheet) {
		studentsSheet = ss.insertSheet(STUDENTS_SHEET);
		studentsSheet.appendRow([
			"Student ID",
			"Name",
			"Email",
			"Total Present",
			"Total Absent",
			"Attendance %",
		]);
		studentsSheet
			.getRange("A1:F1")
			.setFontWeight("bold")
			.setBackground("#00b894")
			.setFontColor("#ffffff");

		// Add sample student data
		studentsSheet.appendRow([
			"STU001",
			"John Doe",
			"john@example.com",
			0,
			0,
			"0%",
		]);
	}

	return "Spreadsheet setup complete!";
}

/**
 * Handle GET requests - Retrieve attendance data
 * @param {Object} e - Event parameter containing query parameters
 */
function doGet(e) {
	try {
		const action = e.parameter.action;

		switch (action) {
			case "getStudentStats":
				return getStudentStats(e.parameter.studentId);

			case "checkTodayAttendance":
				return checkTodayAttendance(e.parameter.studentId);

			case "getAllRecords":
				return getAllRecords(e.parameter.studentId);

			case "verifyData":
				return verifyData(e.parameter.studentId);

			case "getWorkLocations":
				return getWorkLocations(e.parameter.studentId);

			default:
				return createResponse(false, "Invalid action");
		}
	} catch (error) {
		return createResponse(false, "Error: " + error.message);
	}
}

/**
 * Handle POST requests - Submit attendance data
 * @param {Object} e - Event parameter containing POST data
 */
function doPost(e) {
	try {
		const data = JSON.parse(e.postData.contents);
		const action = data.action;

		switch (action) {
			case "markAttendance":
				return markAttendance(data);

			case "updateStudent":
				return updateStudent(data);

			case "addWorkLocation":
				return addWorkLocation(data);

			case "deleteWorkLocation":
				return deleteWorkLocation(data);

			default:
				return createResponse(false, "Invalid action");
		}
	} catch (error) {
		return createResponse(false, "Error: " + error.message);
	}
}

/**
 * Mark attendance for a student
 * @param {Object} data - Attendance data
 */
function markAttendance(data) {
	console.log("=== MARK ATTENDANCE START ===");
	console.log("Student ID: " + data.studentId);
	console.log("Student Name: " + data.studentName);

	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName(SHEET_NAME);

	// Check if already marked today
	const today = new Date().toDateString();
	const lastRow = sheet.getLastRow();
	console.log("Checking if already marked today: " + today);

	if (lastRow > 1) {
		const dates = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
		const studentIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues();

		for (let i = 0; i < dates.length; i++) {
			const recordDate = new Date(dates[i][0]).toDateString();
			if (recordDate === today && studentIds[i][0] === data.studentId) {
				console.log("Already marked today - aborting");
				return createResponse(false, "Attendance already marked today");
			}
		}
	}

	// Add new attendance record
	console.log("Adding new attendance record...");
	const now = new Date();
	sheet.appendRow([
		now, // Timestamp
		data.studentId, // Student ID
		data.studentName, // Student Name
		now, // Date
		data.location.lat, // Latitude
		data.location.lng, // Longitude
		data.weather || "N/A", // Weather
		data.signatureData || "", // Signature (base64)
		data.photoData || "", // Photo (base64)
		"Present", // Status
	]);

	// Format timestamp columns as datetime
	const lastRowNum = sheet.getLastRow();
	sheet.getRange(lastRowNum, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
	sheet.getRange(lastRowNum, 4).setNumberFormat("yyyy-mm-dd");
	console.log("Attendance record added at row: " + lastRowNum);

	// Update student statistics
	console.log("Calling updateStudentStats for: " + data.studentId);
	const updateResult = updateStudentStats(data.studentId);
	console.log("updateStudentStats returned: " + updateResult);

	// Force a small delay to ensure update completes
	SpreadsheetApp.flush();
	Utilities.sleep(500);

	console.log("=== MARK ATTENDANCE END ===");
	return createResponse(true, "Attendance marked successfully");
}

/**
 * Get student attendance statistics
 * @param {string} studentId - Student identifier
 */
function getStudentStats(studentId) {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const studentsSheet = ss.getSheetByName(STUDENTS_SHEET);

	// First, try to get data from Students sheet
	if (studentsSheet) {
		const lastRow = studentsSheet.getLastRow();
		if (lastRow >= 2) {
			const studentIds = studentsSheet
				.getRange(2, 1, lastRow - 1, 1)
				.getValues();

			// Find the student row
			for (let i = 0; i < studentIds.length; i++) {
				if (studentIds[i][0] === studentId) {
					const studentRow = i + 2;
					const studentData = studentsSheet
						.getRange(studentRow, 1, 1, 6)
						.getValues()[0];

					const presentCount = studentData[3] || 0; // Column D
					const absentCount = studentData[4] || 0; // Column E
					const totalDays = presentCount + absentCount;
					const percentage =
						totalDays > 0
							? Math.round((presentCount / totalDays) * 100)
							: 0;

					return createResponse(
						true,
						"Stats retrieved from Students sheet",
						{
							presentCount: presentCount,
							absentCount: absentCount,
							totalDays: totalDays,
							percentage: percentage,
						}
					);
				}
			}
		}
	}

	// Fallback: If student not found in Students sheet, return defaults
	return createResponse(true, "Student not found in Students sheet", {
		presentCount: 0,
		absentCount: 0,
		totalDays: 0,
		percentage: 0,
	});
}

/**
 * Check if attendance is already marked today
 * @param {string} studentId - Student identifier
 */
function checkTodayAttendance(studentId) {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName(SHEET_NAME);
	const lastRow = sheet.getLastRow();

	if (lastRow < 2) {
		return createResponse(true, "Not marked", { isMarked: false });
	}

	const today = new Date().toDateString();
	const dates = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
	const studentIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues();

	for (let i = 0; i < dates.length; i++) {
		const recordDate = new Date(dates[i][0]).toDateString();
		if (recordDate === today && studentIds[i][0] === studentId) {
			return createResponse(true, "Already marked", { isMarked: true });
		}
	}

	return createResponse(true, "Not marked", { isMarked: false });
}

/**
 * Get all attendance records for a student
 * @param {string} studentId - Student identifier
 */
function getAllRecords(studentId) {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName(SHEET_NAME);
	const lastRow = sheet.getLastRow();

	if (lastRow < 2) {
		return createResponse(true, "No records", { records: [] });
	}

	const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
	const records = [];

	for (let i = 0; i < data.length; i++) {
		if (data[i][1] === studentId) {
			records.push({
				timestamp: data[i][0],
				date: data[i][3],
				location: { lat: data[i][4], lng: data[i][5] },
				weather: data[i][6],
				status: data[i][9],
			});
		}
	}

	return createResponse(true, "Records retrieved", { records: records });
}

/**
 * Update student statistics in Students sheet
 * @param {string} studentId - Student identifier
 */
function updateStudentStats(studentId) {
	console.log(">>> updateStudentStats called for: " + studentId);
	try {
		const ss = SpreadsheetApp.getActiveSpreadsheet();
		const studentsSheet = ss.getSheetByName(STUDENTS_SHEET);

		if (!studentsSheet) {
			console.log("ERROR: Students sheet not found");
			return false;
		}

		const lastRow = studentsSheet.getLastRow();
		console.log("Students sheet last row: " + lastRow);

		if (lastRow < 2) {
			console.log("ERROR: No students found in sheet");
			return false;
		}

		const studentIds = studentsSheet
			.getRange(2, 1, lastRow - 1, 1)
			.getValues();
		console.log(
			"Student IDs in sheet: " + JSON.stringify(studentIds.flat())
		);

		// Find student row
		let studentRow = -1;
		for (let i = 0; i < studentIds.length; i++) {
			console.log(`Comparing: "${studentIds[i][0]}" === "${studentId}"`);
			if (studentIds[i][0] === studentId) {
				studentRow = i + 2;
				console.log("✓ Student found at row: " + studentRow);
				break;
			}
		}

		if (studentRow === -1) {
			console.log("ERROR: Student not found: " + studentId);
			return false;
		}

		// Read current values from Students sheet
		const currentData = studentsSheet
			.getRange(studentRow, 1, 1, 6)
			.getValues()[0];
		const currentPresent = currentData[3] || 0; // Column D
		const currentAbsent = currentData[4] || 0; // Column E
		const totalDays = currentPresent + currentAbsent;

		console.log(
			`Current stats for ${studentId}: Present=${currentPresent}, Absent=${currentAbsent}, Total=${totalDays}`
		);

		// INCREMENT present count by 1 (instead of recounting)
		const newPresentCount = currentPresent + 1;
		const newAbsentCount = currentAbsent > 0 ? currentAbsent - 1 : 0;
		const newPercentage =
			totalDays > 0 ? Math.round((newPresentCount / totalDays) * 100) : 0;

		console.log(
			`NEW VALUES: Present=${newPresentCount}, Absent=${newAbsentCount}, %=${newPercentage} (Total=${totalDays})`
		);

		// Update student record
		console.log("Writing to Students sheet row " + studentRow + "...");
		studentsSheet.getRange(studentRow, 4).setValue(newPresentCount);
		studentsSheet.getRange(studentRow, 5).setValue(newAbsentCount);
		studentsSheet.getRange(studentRow, 6).setValue(newPercentage + "%");

		// Force save
		SpreadsheetApp.flush();
		console.log("SpreadsheetApp.flush() called");

		console.log("✓✓✓ Student stats updated successfully ✓✓✓");
		return true;
	} catch (error) {
		console.log("!!! ERROR in updateStudentStats: " + error.message);
		console.log("Stack trace: " + error.stack);
		return false;
	}
}

/**
 * Verify data integrity - check both sheets
 * @param {string} studentId - Student identifier
 */
function verifyData(studentId) {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const studentsSheet = ss.getSheetByName(STUDENTS_SHEET);
	const attendanceSheet = ss.getSheetByName(SHEET_NAME);

	// Get Students sheet data
	const studentsLastRow = studentsSheet.getLastRow();
	const studentIds = studentsSheet
		.getRange(2, 1, studentsLastRow - 1, 1)
		.getValues();

	let studentRowData = null;
	for (let i = 0; i < studentIds.length; i++) {
		if (studentIds[i][0] === studentId) {
			const row = i + 2;
			studentRowData = studentsSheet
				.getRange(row, 1, 1, 6)
				.getValues()[0];
			break;
		}
	}

	// Count records in Attendance Records
	const attLastRow = attendanceSheet.getLastRow();
	let recordCount = 0;
	if (attLastRow >= 2) {
		const attData = attendanceSheet
			.getRange(2, 2, attLastRow - 1, 2)
			.getValues();
		for (let i = 0; i < attData.length; i++) {
			if (attData[i][0] === studentId) {
				recordCount++;
			}
		}
	}

	return createResponse(true, "Verification complete", {
		studentsSheetData: {
			studentId: studentRowData ? studentRowData[0] : null,
			name: studentRowData ? studentRowData[1] : null,
			email: studentRowData ? studentRowData[2] : null,
			totalPresent: studentRowData ? studentRowData[3] : null,
			totalAbsent: studentRowData ? studentRowData[4] : null,
			percentage: studentRowData ? studentRowData[5] : null,
		},
		attendanceRecordsCount: recordCount,
		sheetsMatch: studentRowData ? studentRowData[3] === recordCount : false,
	});
}

/**
 * Create standardized JSON response
 * @param {boolean} success - Whether the operation succeeded
 * @param {string} message - Response message
 * @param {Object} data - Additional data to return
 */
function createResponse(success, message, data = {}) {
	const response = {
		success: success,
		message: message,
		data: data,
		timestamp: new Date().toISOString(),
	};

	return ContentService.createTextOutput(
		JSON.stringify(response)
	).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function to verify setup
 */
function testAPI() {
	console.log(setupSpreadsheet());

	// Test marking attendance
	const testData = {
		action: "markAttendance",
		studentId: "STU001",
		studentName: "John Doe",
		location: { lat: 28.6139, lng: 77.209 },
		weather: "25°C Clear",
		signatureData: "test_signature",
		photoData: "test_photo",
	};

	console.log(markAttendance(testData));
	console.log(getStudentStats("STU001"));
}

/**
 * Direct test to update stats manually
 */
function testUpdateStats() {
	console.log("========== STARTING MANUAL UPDATE TEST ==========");

	const studentId = "STU001";
	console.log("Testing for student: " + studentId);

	// Call the update function directly
	const result = updateStudentStats(studentId);

	console.log("Update result: " + result);
	console.log("========== TEST COMPLETE ==========");
}

/**
 * Check current state of both sheets
 */
function checkCurrentState() {
	console.log("========== CHECKING CURRENT STATE ==========");

	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const studentsSheet = ss.getSheetByName(STUDENTS_SHEET);
	const attendanceSheet = ss.getSheetByName(SHEET_NAME);

	// Students sheet
	console.log("--- Students Sheet ---");
	const studentData = studentsSheet.getRange(2, 1, 1, 6).getValues()[0];
	console.log("Student ID: " + studentData[0]);
	console.log("Name: " + studentData[1]);
	console.log("Email: " + studentData[2]);
	console.log("Total Present: " + studentData[3]);
	console.log("Total Absent: " + studentData[4]);
	console.log("Percentage: " + studentData[5]);

	// Attendance Records
	console.log("--- Attendance Records ---");
	const attLastRow = attendanceSheet.getLastRow();
	console.log("Total records (including header): " + attLastRow);

	if (attLastRow >= 2) {
		const records = attendanceSheet
			.getRange(2, 1, attLastRow - 1, 10)
			.getValues();
		console.log("Total attendance records: " + records.length);

		let stu001Count = 0;
		for (let i = 0; i < records.length; i++) {
			if (records[i][1] === "STU001") {
				stu001Count++;
				console.log(
					`  Row ${i + 2}: ${records[i][0]} - ${records[i][1]} - ${
						records[i][9]
					}`
				);
			}
		}
		console.log("Total STU001 records: " + stu001Count);
	}

	console.log("========== STATE CHECK COMPLETE ==========");
}

// ========== WORK LOCATIONS FUNCTIONS ==========

/**
 * Get all work locations for a student
 * @param {string} studentId - Student identifier
 */
function getWorkLocations(studentId) {
	try {
		const ss = SpreadsheetApp.getActiveSpreadsheet();
		const sheet = ss.getSheetByName(WORK_LOCATIONS_SHEET);

		if (!sheet) {
			return createResponse(false, "Work Locations sheet not found", {
				locations: [],
			});
		}

		const lastRow = sheet.getLastRow();
		if (lastRow < 2) {
			return createResponse(true, "No locations found", {
				locations: [],
			});
		}

		const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
		const locations = [];

		for (let i = 0; i < data.length; i++) {
			// Column A: Location ID, B: Student ID, C: Name, D: Lat, E: Lng
			if (data[i][1] === studentId) {
				locations.push({
					id: data[i][0],
					studentId: data[i][1],
					name: data[i][2],
					lat: data[i][3],
					lng: data[i][4],
				});
			}
		}

		return createResponse(true, "Locations retrieved", {
			locations: locations,
		});
	} catch (error) {
		return createResponse(false, "Error: " + error.message, {
			locations: [],
		});
	}
}

/**
 * Add a new work location
 * @param {Object} data - Location data { studentId, name, lat, lng }
 */
function addWorkLocation(data) {
	try {
		const ss = SpreadsheetApp.getActiveSpreadsheet();
		let sheet = ss.getSheetByName(WORK_LOCATIONS_SHEET);

		// Create sheet if it doesn't exist
		if (!sheet) {
			sheet = ss.insertSheet(WORK_LOCATIONS_SHEET);
			sheet.appendRow([
				"Location ID",
				"Student ID",
				"Name",
				"Latitude",
				"Longitude",
			]);
			sheet
				.getRange("A1:E1")
				.setFontWeight("bold")
				.setBackground("#6c5ce7")
				.setFontColor("#ffffff");
		}

		// Generate unique location ID
		const locationId =
			"LOC_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);

		// Add new location
		sheet.appendRow([
			locationId,
			data.studentId,
			data.name,
			data.lat,
			data.lng,
		]);

		SpreadsheetApp.flush();

		return createResponse(true, "Location added successfully", {
			location: {
				id: locationId,
				studentId: data.studentId,
				name: data.name,
				lat: data.lat,
				lng: data.lng,
			},
		});
	} catch (error) {
		return createResponse(false, "Error adding location: " + error.message);
	}
}

/**
 * Delete a work location
 * @param {Object} data - { locationId }
 */
function deleteWorkLocation(data) {
	try {
		const ss = SpreadsheetApp.getActiveSpreadsheet();
		const sheet = ss.getSheetByName(WORK_LOCATIONS_SHEET);

		if (!sheet) {
			return createResponse(false, "Work Locations sheet not found");
		}

		const lastRow = sheet.getLastRow();
		if (lastRow < 2) {
			return createResponse(false, "No locations to delete");
		}

		const locationIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

		// Find and delete the row
		for (let i = 0; i < locationIds.length; i++) {
			if (locationIds[i][0] === data.locationId) {
				sheet.deleteRow(i + 2); // +2 because array is 0-indexed and row 1 is header
				SpreadsheetApp.flush();
				return createResponse(true, "Location deleted successfully");
			}
		}

		return createResponse(false, "Location not found");
	} catch (error) {
		return createResponse(
			false,
			"Error deleting location: " + error.message
		);
	}
}
