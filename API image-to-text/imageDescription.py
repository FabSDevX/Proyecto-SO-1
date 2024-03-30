import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials
from azure.storage.blob import BlobServiceClient

# .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Cloud Storage credentials and clients
connection_string = os.getenv('CONNECTION_STRING')
blob_service_client = BlobServiceClient.from_connection_string(connection_string)
container_name = "myimagecontainer"
container_client = blob_service_client.get_container_client(container_name)

# Computer Vision credentials and client
endpoint = os.getenv('ENDPOINT')
api_key = os.getenv('API_KEY')
computervision_client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(api_key))

@app.route('/', methods=['GET'])
def index():
    return 'Hello Image'

@app.route('/api/upload_and_describe_image', methods=['POST'])
def upload_and_describe_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

       
        building_text = ""
        for key in request.files.to_dict(flat=False):
            for value in request.files.getlist(key):
                image_file = value
                # image_file = request.files['image']
                if image_file.filename == '':
                    return jsonify({'error': 'No selected image'}), 400
                                
                # Save the image to a temporary location
                image_path = 'temp/' + str(uuid.uuid4()) +'.jpg'
                print(image_path)
                image_file.save(image_path)
                # Generate a unique blob name using UUID
                blob_name = str(uuid.uuid4()) + ".jpg"
                
                # Upload image to Azure Blob Storage
                blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
                with open(image_path, "rb") as image:
                    blob_client.upload_blob(image)

                # Describe the uploaded image
                blob_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{blob_name}"
                description_results = computervision_client.describe_image(blob_url)
                if description_results.captions:
                    building_text += description_results.captions[0].text + '\n'
                else:
                    building_text += "No description found." + ' \n '

                # Delete the uploaded image from Blob Storage
                blob_client.delete_blob()
                

        return jsonify({'description': building_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
