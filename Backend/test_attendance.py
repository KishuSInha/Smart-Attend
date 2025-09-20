import requests
import base64

# Read the image and convert to base64
with open('demo_photos/102.png', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode()

# Send the request
response = requests.post(
    'http://localhost:5000/api/recognize',
    json={'image': image_data}
)

# Print the response
print(response.json())