from flask import Flask, jsonify, request
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import re

# Create Flask application instance
app = Flask(__name__)
CORS(app)

# Regular expression pattern to extract YouTube video ID
pattern = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})')

# Function to extract video ID from URL
def getVideoId(url):
    match = pattern.search(url)
    if match:
        return match.group(1)
    return None

# Define endpoint to fetch transcript
@app.route('/transcript')
def get_data():
    url = request.args.get('video_url')
    videoId = getVideoId(url)
    transcript_list = YouTubeTranscriptApi.list_transcripts(videoId)
    for transcript in transcript_list:
        return jsonify(transcript.fetch())

# Create WSGI application object
application = app
