import os
import cv2
import face_recognition
import pickle


flat_dir = '/Users/utkarshsinha/Desktop/Projects/SIH/Final Model/Images'
group_dir = 'captured_faces'

face_encodings = {}


if os.path.exists(flat_dir):
    path_list = os.listdir(flat_dir)
    for path in path_list:
        student_id = os.path.splitext(path)[0]
        img_path = os.path.join(flat_dir, path)
        img = cv2.imread(img_path)
        if img is None:
            print(f"⚠️ Skipping invalid image: {path}")
            continue
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(img_rgb)
        if encodings:
            face_encodings[student_id] = encodings[0]
        else:
            print(f"⚠️ No face found in {path}")


if os.path.exists(group_dir):
    for person_name in os.listdir(group_dir):
        person_dir = os.path.join(group_dir, person_name)
        if not os.path.isdir(person_dir):
            continue
        all_encodings = []
        for image_file in os.listdir(person_dir):
            image_path = os.path.join(person_dir, image_file)
            img = cv2.imread(image_path)
            if img is None:
                print(f"⚠️ Skipping invalid image: {image_path}")
                continue
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encodings = face_recognition.face_encodings(img_rgb)
            if encodings:
                all_encodings.append(encodings[0])
            else:
                print(f"⚠️ No face found in {image_file} for {person_name}")
        if all_encodings:
            avg_encoding = sum(all_encodings) / len(all_encodings)
            face_encodings[person_name] = avg_encoding


with open("Encoded_File.pkl", "wb") as f:
    pickle.dump(face_encodings, f)

print("Face encodings including student id's saved successfully.")
