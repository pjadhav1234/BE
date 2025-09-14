import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from prescription import process_transcript_file

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (for frontend)

UPLOADS_DIR = os.path.join(os.getcwd(), "backend", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@app.route("/api/upload-transcript", methods=["POST"])
def upload_transcript():
    """
    API endpoint to upload a raw doctor-patient conversation .txt file
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Save file in uploads directory
    filepath = os.path.join(UPLOADS_DIR, file.filename)
    file.save(filepath)

    try:
        # Process the file using prescription.py
        output_path = process_transcript_file(file.filename)

        # Read the structured JSON content
        with open(output_path, "r", encoding="utf-8") as f:
            structured_data = f.read()

        return jsonify({
            "message": "File processed successfully",
            "structured_json": structured_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
