import torch
import json
from transformers import pipeline

# Load zero-shot classification model
print("⏳ Loading model...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("✅ Model loaded successfully!")

def structure_transcript(raw_transcript):
    structured = []
    lines = raw_transcript.split("\n")
    
    for line in lines:
        if not line.strip():
            continue
        
        # Clean line
        line_clean = line.replace("Doctor:", "").replace("Patient:", "").strip()
        
        # Rule-based detection for short lines
        lower = line_clean.lower()
        if any(q in lower for q in ["how", "what", "when", "do you", "are you", "can you"]):
            speaker = "Doctor"
        else:
            # Zero-shot fallback
            result = classifier(f"This sentence is spoken in a doctor-patient conversation: {line_clean}", candidate_labels=["Doctor", "Patient"])
            speaker = result["labels"][0]
        
        structured.append({"speaker": speaker, "text": line.strip()})
    
    return structured

    """
    Convert raw transcript to structured Doctor/Patient dialogues
    """
    structured = []
    lines = raw_transcript.split("\n")
    
    for line in lines:
        if not line.strip():
            continue
        
        # Zero-shot classify line
        result = classifier(line, candidate_labels=["Doctor", "Patient"])
        speaker = result["labels"][0]  # top predicted label
        
        structured.append({"speaker": speaker, "text": line.strip()})
    
    return structured

def save_to_json(structured_transcript, filename="structured_transcript.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(structured_transcript, f, ensure_ascii=False, indent=4)
    print(f"✅ Structured transcript saved to {filename}")

def main():
    print("Enter your transcript (line by line, press Enter twice to finish):")
    raw_lines = []
    while True:
        line = input()
        if line.strip() == "":
            break
        raw_lines.append(line)
    
    raw_transcript = "\n".join(raw_lines)
    
    # Convert to structured form
    structured_output = structure_transcript(raw_transcript)
    
    # Display result
    print("\nStructured Transcript:")
    for item in structured_output:
        print(f"{item['speaker']}: {item['text']}")
    
    # Save to JSON
    save_to_json(structured_output)

if __name__ == "__main__":
    main()
