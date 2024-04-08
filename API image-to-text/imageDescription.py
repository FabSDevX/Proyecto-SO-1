import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials
from azure.storage.blob import BlobServiceClient
from azure.cognitiveservices.vision.contentmoderator import ContentModeratorClient
from msrest.authentication import CognitiveServicesCredentials

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

#Content Moderator credentials and client
moderator_endpoint = os.getenv('MODERATION_ENDPOINT')
moderator_key = os.getenv('MODERATION_KEY')
moderator_client = ContentModeratorClient(endpoint=moderator_endpoint, credentials=CognitiveServicesCredentials(moderator_key))

namesList = []
moderation_name_list = []

def deleteRelatedImages():
    for name in namesList:
        blob_client = container_client.get_blob_client(name)
        blob_client.delete_blob()
    namesList.clear()         

@app.route('/', methods=['GET'])
def index():
    return 'Hello Image'

@app.route('/api/upload_and_describe_image', methods=['POST'])
def upload_and_describe_image():
    try:

        # clean_container()
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        #clean moderation_name_list
        moderation_name_list.clear()  
       
        building_text = ""
        for key in request.files.to_dict(flat=False):
            for value in request.files.getlist(key):
                image_file = value
                # image_file = request.files['image']
                if image_file.filename == '':
                    return jsonify({'error': 'No selected image'}), 400
                                
                encriptor = str(uuid.uuid4())
                # Save the image to a temporary location
                image_path = 'temp' + encriptor +'.jpg'
                print(image_path)
                image_file.save(image_path)
                # Generate a unique blob name using UUID
                blob_name = encriptor + image_file.filename

                if blob_name not in namesList:
                    namesList.append(blob_name)
               
                # Upload image to Azure Blob Storage
                blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
                with open(image_path, "rb") as image:
                    blob_client.upload_blob(image)              
                
                # Remove temporary file
                os.remove(image_path) 
                print("Hola")
                # Describe the uploaded image
                blob_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{blob_name}"
                description_results = computervision_client.describe_image(blob_url, language = "es")
                if description_results.captions:
                    building_text += description_results.captions[0].text + ' '
                else:
                    building_text += "No description found. "

                evaluation = moderator_client.image_moderation.evaluate_url_input(
                    content_type="application/json",
                    cache_image=True,
                    data_representation="URL",
                    value=blob_url
                )  
                result = evaluation.as_dict()
                if((result['is_image_adult_classified'] == True) or (result['is_image_racy_classified'] == True)):
                    moderation_name_list.append(image_file.filename)
        print(building_text)
        print(moderation_name_list)
        deleteRelatedImages()  
        return jsonify({'description': building_text, 'moderation_list':moderation_name_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
