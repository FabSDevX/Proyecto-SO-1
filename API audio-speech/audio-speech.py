import assemblyai as aai

aai.settings.api_key = "3be785f8454e4d0daca47760c9dbd4ad"
transcriber = aai.Transcriber()

#transcript = transcriber.transcribe("https://storage.googleapis.com/aai-web-samples/news.mp4")
transcript = transcriber.transcribe("./API audio-speech/PTT-20231114-WA0044.opus")

print(transcript.text)