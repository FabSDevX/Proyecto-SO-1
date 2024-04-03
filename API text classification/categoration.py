import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import language_v2
from dotenv import load_dotenv
# .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Instantiates a client
language_client = language_v2.LanguageServiceClient(client_options={"api_key": os.getenv("API_KEY"), "quota_project_id": os.getenv("QUOTA_PROJECT_ID")})

def classify(text):
    print(text)
    """Classify the input text into categories."""
    document = language_v2.Document(
        content=text, type_=language_v2.Document.Type.PLAIN_TEXT
    )
    response = language_client.classify_text(request={"document": document})
    categories = response.categories
    print(categories)
    result = {}
    if(len(categories)==0):
        result["Imagen poco descriptiva"] = 0
    for category in categories[:3]:
        
        # Turn the categories into a dictionary of the form:
        # {category.name: category.confidence}, so that they can
        # be treated as a sparse vector.
        singleCategories = category.name.split("/")
        if((singleCategories[len(singleCategories) - 1])== "Other"):
            result[singleCategories[len(singleCategories) - 2]] = category.confidence
        else:
            result[singleCategories[len(singleCategories) - 1]] = category.confidence
    print(result)
    return result

@app.route('/', methods=['GET'])
def index():
    return "Hola Mundo"

@app.route('/api/classify', methods=['POST'])
def api_classify():
    text = request.json.get('text')
    if text:
        result = classify(text)
        return jsonify(result)
    else:
        return jsonify({"error": "No text provided"}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)