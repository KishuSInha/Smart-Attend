import sqlite3
import os
import zipfile
import csv
from datetime import datetime

# ----------------------------
# 1. Connect & create tables
# ----------------------------
def init_db():
    conn = sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (  
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reg_no TEXT UNIQUE,
        class TEXT,
        section TEXT,
        photo_path TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        date TEXT,
        time TEXT,
        status TEXT CHECK(status IN ('Present','Absent')) DEFAULT 'Present',
        FOREIGN KEY (student_id) REFERENCES students (id),
        UNIQUE(student_id, date)  -- prevents duplicate entries per student per day
    )
    """)
    conn.commit()
    conn.close()

# ----------------------------
# 2. Insert student
# ----------------------------
def add_student(name, reg_no=None, class_name=None, section=None, photo_path=None):
    conn = sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR IGNORE INTO students (name, reg_no, class, section, photo_path)
        VALUES (?, ?, ?, ?, ?)
    """, (name, reg_no, class_name, section, photo_path))
    conn.commit()
    conn.close()

# ----------------------------
# 3. Extract & register students from ZIP (with reg_no)
# ----------------------------
def register_students_from_zip(zip_file, extract_dir="demo_photos"):
    if not os.path.exists(extract_dir):
        os.makedirs(extract_dir)

    with zipfile.ZipFile(zip_file, "r") as zip_ref:
        zip_ref.extractall(extract_dir)

    # assign reg_no starting from 101
    reg_counter = 101
    for file in sorted(os.listdir(extract_dir)):
        if file.endswith(".png"):
            # Format student name properly from filename
            student_name = os.path.splitext(file)[0]
            student_name = student_name.replace('-', ' ').title()
            photo_path = os.path.join(extract_dir, file)
            reg_no = str(reg_counter)
            add_student(student_name, reg_no, None, None, photo_path)
            reg_counter += 1


# ----------------------------
# 4. Import attendance (from Code1 CSV)
# ----------------------------
def import_attendance_from_csv(csv_file):
    conn = sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()

    with open(csv_file, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["NAME"]
            time_str = row["TIME"]
            date_str = datetime.now().strftime("%d-%m-%Y")


            cursor.execute("SELECT id FROM students WHERE name=?", (name,))
            result = cursor.fetchone()
            if result:
                student_id = result[0]
                try:
                    cursor.execute("""
                        INSERT INTO attendance (student_id, date, time, status)
                        VALUES (?, ?, ?, ?)
                    """, (student_id, date_str, time_str, "Present"))
                except sqlite3.IntegrityError:
                    print(f"⚠️ {name} already marked present on {date_str}. Skipping...")
    conn.commit()
    conn.close()

# ----------------------------
# 5. Mark absentees
# ----------------------------
def mark_absentees(date_str=None):
    if date_str is None:
        date_str = datetime.now().strftime("%d-%m-%Y")

    conn = sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()

    # Get all students
    cursor.execute("SELECT id FROM students")
    all_students = [row[0] for row in cursor.fetchall()]

    # Get already marked students
    cursor.execute("SELECT student_id FROM attendance WHERE date=?", (date_str,))
    present_students = [row[0] for row in cursor.fetchall()]

    absentees = set(all_students) - set(present_students)

    for student_id in absentees:
        cursor.execute("""
            INSERT OR IGNORE INTO attendance (student_id, date, time, status)
            VALUES (?, ?, ?, 'Absent')
        """, (student_id, date_str, "--:--:--"))

    conn.commit()
    conn.close()
    print(f"✅ Absentees marked for {date_str}")

# ----------------------------
# 6. View attendance (modified)
# ----------------------------
def view_attendance(date_str=None):
    conn = sqlite3.connect("attendance_demo.db")
    cursor = conn.cursor()

    if date_str:
        cursor.execute("""
        SELECT students.reg_no, students.class, attendance.date, attendance.time, attendance.status
        FROM attendance
        JOIN students ON students.id = attendance.student_id
        WHERE attendance.date=?
        GROUP BY students.reg_no, attendance.date   -- 🚀 ensures no repetition
        ORDER BY students.reg_no
        """, (date_str,))
    else:
        cursor.execute("""
        SELECT students.reg_no, students.class, attendance.date, attendance.time, attendance.status
        FROM attendance
        JOIN students ON students.id = attendance.student_id
        GROUP BY students.reg_no, attendance.date
        ORDER BY attendance.date, students.reg_no
        """)

    rows = cursor.fetchall()
    conn.close()
    return rows


# ----------------------------
# Demo
# ----------------------------
if __name__ == "__main__":
    # Initialize database and register students
    init_db()
    register_students_from_zip("final_images.zip")