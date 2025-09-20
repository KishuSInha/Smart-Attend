import os
import base64
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
from deepface import DeepFace
import DataBase_attendance as db
from datetime import datetime
import csv

# Initialize Flask app
app = Flask(__name__)
# Configure CORS to allow requests from the frontend
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:8080", "http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:8081"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Origin", "Accept"],
    "supports_credentials": True
}})# Directory to store known faces
KNOWN_FACES_DIR = "/Users/utkarshsinha/Documents/Final Model/Backend/known_faces"

# Global variables for known faces and encodings
known_face_encodings = []
known_face_names = []
known_face_roll_numbers = []

def load_known_faces():
    """
    Loads images from the known_faces directory and generates face encodings.
    """
    global known_face_encodings, known_face_names, known_face_roll_numbers
    
    print("Loading known faces...")
    known_face_encodings = []
    known_face_names = []
    known_face_roll_numbers = []

    for name_folder in os.listdir(KNOWN_FACES_DIR):
        if name_folder.startswith('.'):
            continue
        
        name, roll_number = name_folder.rsplit('_', 1)
        person_dir = os.path.join(KNOWN_FACES_DIR, name_folder)
        
        # Get actual student name from database
        conn = db.sqlite3.connect("attendance_demo.db")
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM students WHERE reg_no = ?", (roll_number,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            db_name = result[0]
            if db_name == roll_number:
                actual_name = name.replace('-', ' ').title()
            else:
                actual_name = db_name
        else:
            actual_name = name.replace('-', ' ').title()
        
        if os.path.isdir(person_dir):
            for filename in os.listdir(person_dir):
                if filename.startswith('.'):
                    continue
                
                if filename.endswith(('.jpg', '.jpeg', '.png')):
                    image_path = os.path.join(person_dir, filename)
                    image = face_recognition.load_image_file(image_path)
                    encodings = face_recognition.face_encodings(image)
                    
                    if encodings:
                        known_face_encodings.append(encodings[0])
                        known_face_names.append(actual_name)
                        known_face_roll_numbers.append(roll_number)
                        print(f"Loaded encoding for {actual_name} ({roll_number}) from {filename}")

def update_known_faces():
    """
    Refreshes the known faces database by calling load_known_faces.
    """
    load_known_faces()

# Initial load of known faces
load_known_faces()

@app.route('/api/save-attendance-csv', methods=['POST'])
def save_attendance_to_csv(student_name, roll_number, date_str, time_str):
    """
    Saves attendance data to a CSV file.
    """
    import csv
    import os
    
    try:
        # Create attendance directory if it doesn't exist
        attendance_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'attendance_records')
        print(f"Creating attendance directory at: {attendance_dir}")
        if not os.path.exists(attendance_dir):
            os.makedirs(attendance_dir)
            print(f"Created attendance directory")
        
        # CSV file path with date in filename
        csv_file = os.path.join(attendance_dir, f'attendance_{date_str}.csv')
        file_exists = os.path.exists(csv_file)
        print(f"CSV file path: {csv_file}, exists: {file_exists}")
    
        # Write to CSV file
        with open(csv_file, mode='a', newline='') as file:
            writer = csv.writer(file)
            if not file_exists:
                writer.writerow(['Name', 'Roll Number', 'Date', 'Time', 'Status'])
            writer.writerow([student_name, roll_number, date_str, time_str, 'Present'])
            print(f"Successfully wrote attendance for {student_name} to CSV")
        return True
    except Exception as e:
        print(f"Error saving attendance to CSV: {str(e)}")
        raise

def save_attendance_to_db(roll_number):
    """
    Saves attendance to the database using the student's roll number.
    This function will be called directly from recognize_face.
    """
    # Connect to the database
    conn = db.sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()

    try:
        # Find the student's ID and name using their roll number (reg_no)
        cursor.execute("SELECT id, name FROM students WHERE reg_no = ?", (roll_number,))
        result = cursor.fetchone()

        if result:
            student_id, student_name = result
            date_str = datetime.now().strftime("%Y-%m-%d")
            time_str = datetime.now().strftime("%H:%M:%S")

            # Check if attendance is already marked for today to avoid duplicates
            cursor.execute("""
                SELECT 1 FROM attendance WHERE student_id = ? AND date = ?
            """, (student_id, date_str))

            if not cursor.fetchone():
                # Insert the new attendance record if it doesn't exist
                cursor.execute("""
                    INSERT INTO attendance (student_id, date, time, status)
                    VALUES (?, ?, ?, 'Present')
                """, (student_id, date_str, time_str))
                conn.commit()
                # Save to CSV as well
                save_attendance_to_csv(student_name, roll_number, date_str, time_str)
                print(f"Attendance marked for {student_name} ({roll_number})")
                return True
            else:
                print(f"Attendance already marked for {student_name} ({roll_number})")
                return False
        else:
            print(f"Student with roll number {roll_number} not found in the database.")
            return False
            
    except Exception as e:
        conn.rollback()
        print(f"Error saving attendance: {e}")
        return False
    finally:
        conn.close()


@app.route('/api/recognize', methods=['POST'])
def recognize_face():
    """
    Receives an image via POST request, performs face recognition, and returns results.
    """
    data = request.get_json()
    img_data = data.get('image', None)

    if not img_data:
        return jsonify({"success": False, "message": "No image data provided."}), 400
    
    # FIX: The frontend now sends the raw base64 string without the header.
    # The split(',') is no longer needed to remove the header.
    try:
        img_bytes = base64.b64decode(img_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    except Exception as e:
        return jsonify({"success": False, "message": f"Invalid image data: {str(e)}"}), 400

    if img is None:
        return jsonify({"success": False, "message": "Could not decode image."}), 400

    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    face_locations = face_recognition.face_locations(rgb_img)
    face_encodings = face_recognition.face_encodings(rgb_img, face_locations)

    recognized_faces = []

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        name = "Unknown"
        roll_number = "N/A"
        
        if known_face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
            
            if True in matches:
                first_match_index = matches.index(True)
                name = known_face_names[first_match_index]
                roll_number = known_face_roll_numbers[first_match_index]

                save_attendance_to_db(roll_number)
                
        # Spoofing and Emotion Detection (requires a face)
        spoofed = False
        emotion = "Neutral"

        try:
            face_img = img[top:bottom, left:right]
            if face_img.size > 0:
                # Spoofing detection with DeepFace (can be resource intensive)
                # You might need a more dedicated model for this in production.
                # This is a placeholder for a more robust method.
                # A simple check for a live face might be needed here.
                # For this example, we assume no spoofing.
                
                # Emotion analysis
                # DeepFace requires a path or a numpy array
                demography = DeepFace.analyze(face_img, actions=['emotion'], enforce_detection=False)
                if demography and 'emotion' in demography[0]:
                    emotion = max(demography[0]['emotion'], key=demography[0]['emotion'].get)
            
        except Exception as e:
            print(f"DeepFace analysis failed: {e}")
            
        recognized_faces.append({
            "name": name,
            "rollNumber": roll_number,
            "spoofed": spoofed,
            "emotion": emotion,
        })
    
    if not recognized_faces:
        return jsonify({"success": True, "message": "No faces detected.", "detectedFaces": []})

    return jsonify({"success": True, "detectedFaces": recognized_faces})

# Student API endpoints
@app.route('/api/students', methods=['GET'])
def get_students():
    """
    Get all students with optional filtering by class and section
    """
    class_filter = request.args.get('class')
    section_filter = request.args.get('section')
    
    conn = db.sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()
    
    query = "SELECT id, name, reg_no, class, section, photo_path FROM students"
    params = []
    
    if class_filter or section_filter:
        query += " WHERE"
        
        if class_filter:
            query += " class = ?"
            params.append(class_filter)
            
        if class_filter and section_filter:
            query += " AND"
            
        if section_filter:
            query += " section = ?"
            params.append(section_filter)
    
    cursor.execute(query, params)
    students = [{
        "id": str(row[0]),
        "name": row[1],
        "rollNumber": row[2],
        "class": row[3],
        "section": row[4],
        "photoPath": row[5]
    } for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(students)

@app.route('/api/students/search', methods=['GET'])
def search_students():
    """
    Search students by name or roll number
    """
    query = request.args.get('q', '')
    
    conn = db.sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, name, reg_no, class, section, photo_path 
        FROM students 
        WHERE name LIKE ? OR reg_no LIKE ?
    """, (f'%{query}%', f'%{query}%'))
    
    students = [{
        "id": str(row[0]),
        "name": row[1],
        "rollNumber": row[2],
        "class": row[3],
        "section": row[4],
        "photoPath": row[5]
    } for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(students)

# Attendance API endpoints
@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    """
    Mark attendance for students
    """
    data = request.get_json()
    student_ids = data.get('studentIds', [])
    period = data.get('period', '')
    date_str = data.get('date', datetime.now().strftime("%d-%m-%Y"))
    
    conn = db.sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()
    
    success_count = 0
    for student_id in student_ids:
        try:
            time_str = datetime.now().strftime("%H:%M:%S")
            cursor.execute("""
                INSERT OR REPLACE INTO attendance (student_id, date, time, status)
                VALUES (?, ?, ?, 'Present')
            """, (student_id, date_str, time_str))
            success_count += 1
        except Exception as e:
            print(f"Error marking attendance for student {student_id}: {e}")
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True,
        "message": f"Marked {success_count} students present"
    })

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """
    Get attendance records with optional filtering
    """
    date_str = request.args.get('date')
    class_filter = request.args.get('class')
    section_filter = request.args.get('section')
    
    conn = db.sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()
    
    query = """
        SELECT students.id, students.name, students.reg_no, students.class, students.section,
               attendance.date, attendance.time, attendance.status
        FROM attendance
        JOIN students ON students.id = attendance.student_id
    """
    
    params = []
    where_clauses = []
    
    if date_str:
        where_clauses.append("attendance.date = ?")
        params.append(date_str)
    
    if class_filter:
        where_clauses.append("students.class = ?")
        params.append(class_filter)
    
    if section_filter:
        where_clauses.append("students.section = ?")
        params.append(section_filter)
    
    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)
    
    query += " ORDER BY attendance.date DESC, students.name"
    
    cursor.execute(query, params)
    
    attendance_records = [{
        "studentId": str(row[0]),
        "name": row[1],
        "rollNumber": row[2],
        "class": row[3],
        "section": row[4],
        "date": row[5],
        "time": row[6],
        "status": row[7]
    } for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        "success": True,
        "data": attendance_records
    })

def save_attendance_to_csv():
    """
    Exports all attendance data from the SQLite database to a specific CSV file.
    The filename will be 'Attendance_DD-MM-YYYY.csv' in the specified directory.
    """
    # Define the base directory and the specific filename
    base_dir = "/Users/utkarshsinha/Downloads/Final Model/Backend/Attendance/Attendance_10-09-2025.csv"
    date_str = datetime.now().strftime("%d-%m-%Y")
    filename = f"Attendance_{date_str}.csv"
    full_path = os.path.join(base_dir, filename)

    # Ensure the directory exists
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)
        print(f"Created directory: {base_dir}")

    conn = db.sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()

    try:
        # Get all attendance records along with student details
        cursor.execute("""
            SELECT students.reg_no, students.name, attendance.date, attendance.time, attendance.status
            FROM attendance
            JOIN students ON students.id = attendance.student_id
            ORDER BY attendance.date, students.name
        """)
        
        # Fetch all records
        records = cursor.fetchall()
        
        if not records:
            print("No attendance data to save to CSV.")
            return

        # Define the header for the CSV file
        header = ['Roll Number', 'Name', 'Date', 'Time', 'Status']
        
        with open(full_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(header)  # Write the header
            writer.writerows(records) # Write the data rows
            
        print(f"Attendance data successfully saved to {full_path}")

    except Exception as e:
        print(f"Error saving data to CSV: {e}")
    finally:
        conn.close()

@app.route('/api/export-csv', methods=['GET'])
def export_csv():
    """
    API endpoint to trigger the CSV export.
    """
    save_attendance_to_csv()
    
    # You might want to return the file for download here
    # For now, let's just confirm the action
    return jsonify({"success": True, "message": "CSV export initiated."})
if __name__ == '__main__':
    # Initialize the database
    db.init_db()
    
    # You can change host and port as needed for deployment
    app.run(host='0.0.0.0', port=5000, debug=True)