import os
import json
from transformers import pipeline

# Load zero-shot classification model
print("⏳ Loading classification model...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("✅ Model loaded successfully!")

UPLOADS_DIR = os.path.join(os.getcwd(), "backend", "uploads")

def structure_transcript(raw_transcript: str):
    """
    Classify each line in the raw transcript as Doctor or Patient
    """
    structured = []
    lines = raw_transcript.split("\n")

    for line in lines:
        if not line.strip():
            continue

        text_clean = line.strip()

        # Use zero-shot classification
        result = classifier(
            text_clean,
            candidate_labels=["Doctor", "Patient"]
        )
        speaker = result["labels"][0]

        structured.append({"speaker": speaker, "text": text_clean})

    return structured


def process_transcript_file(input_filename: str, output_filename: str = None):
    """
    Read transcript text file from uploads folder, classify it,
    and save structured JSON output in the same folder.
    """
    input_path = os.path.join(UPLOADS_DIR, input_filename)
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")

    with open(input_path, "r", encoding="utf-8") as f:
        raw_text = f.read()

    structured = structure_transcript(raw_text)

    # Set output file name
    if not output_filename:
        output_filename = input_filename.rsplit(".", 1)[0] + "_structured.json"

    output_path = os.path.join(UPLOADS_DIR, output_filename)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(structured, f, ensure_ascii=False, indent=4)

    print(f"✅ Structured transcript saved at {output_path}")
    return output_path


if __name__ == "__main__":
    # Example usage
    print("🔍 Processing 'conversation.txt' from backend/uploads")
    process_transcript_file("conversation.txt")
