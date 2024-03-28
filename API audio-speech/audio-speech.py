from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import assemblyai as aai
from dotenv import load_dotenv
# .env
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
# Set up API key
aai.settings.api_key = os.getenv('api_key')

# Define transcription endpoint
@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        # Initialize transcription configuration
        config = aai.TranscriptionConfig(language_code='es')

        # Initialize transcriber
        transcriber = aai.Transcriber(config=config)

        # Check if the request contains a file
        if 'audio_file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        building_text = ""
        print(request.files.items)
        for key in request.files.to_dict(flat=False):
            for value in request.files.getlist(key):
                audio_file = value
                file_path = 'API audio-speech/temp/temp_audio.opus'  # Change to your desired temporary path
                # Save the file temporarily
                audio_file.save(file_path)
                # Transcribe audio
                transcript = transcriber.transcribe(file_path)
                building_text += transcript.text + '\n'
                # Remove temporary file
                print(transcript.text)
                os.remove(file_path)

        # Return transcription result
        return jsonify({'transcript': building_text}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
