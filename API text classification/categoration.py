import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import language_v2
from dotenv import load_dotenv
# .env
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Instantiates a client
language_client = language_v2.LanguageServiceClient(client_options={"api_key": os.getenv("API_KEY"), "quota_project_id": os.getenv("quota_project_id")})

def classify(text):
    """Classify the input text into categories."""
    document = language_v2.Document(
        content=text, type_=language_v2.Document.Type.PLAIN_TEXT
    )
    response = language_client.classify_text(request={"document": document})
    categories = response.categories

    result = {}

    for category in categories:
        # Turn the categories into a dictionary of the form:
        # {category.name: category.confidence}, so that they can
        # be treated as a sparse vector.
        result[category.name] = category.confidence

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


# from google.cloud import language_v2 

# # Instantiates a client

# def classify(text, verbose=True):
#     """Classify the input text into categories."""

#     language_client = language_v2.LanguageServiceClient(client_options={"api_key": "AQUI VA API KEY", "quota_project_id":"AQUI VA QUOTA_PROJECT_ID"})

#     document = language_v2.Document(
#         content=text, type_=language_v2.Document.Type.PLAIN_TEXT
#     )
#     response = language_client.classify_text(request={"document": document})
#     categories = response.categories

#     result = {}

#     for category in categories:
#         # Turn the categories into a dictionary of the form:
#         # {category.name: category.confidence}, so that they can
#         # be treated as a sparse vector.
#         result[category.name] = category.confidence

#     if verbose:
#         print(text)
#         for category in categories:
#             print("=" * 20)
#             print("{:<16}: {}".format("category", category.name))
#             print("{:<16}: {}".format("confidence", category.confidence))

#     return result

# classify("Hola Juan, quiere ir a ver una pelicula? Yo creo que esa de Marvel va a estar buenísima, también podríamos ver de acción.")
