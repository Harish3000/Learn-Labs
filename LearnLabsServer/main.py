from fastapi import FastAPI, HTTPException
from typing import Dict
from youtube_transcript_api import YouTubeTranscriptApi

app = FastAPI()
@app.get("/")
async def read_root():
    return {"Hello": "LearnLab"}


@app.get("/transcript/{video_id}", response_model=Dict[str, str])
async def download_transcript(video_id: str) -> Dict[str, str]:
    """
    Fetches the transcript with timestamps for a given YouTube video ID.

    Args:
        video_id (str): The ID of the YouTube video to retrieve the transcript for.

    Returns:
        Dict[str, str]: A dictionary containing the video ID and the transcript as a single string.
    """
    try:
        # Fetch the transcript for the given video ID
        transcript = YouTubeTranscriptApi.get_transcript(video_id)

        # Create a single string from the transcript
        transcript_text = "|".join([f"{entry['start']:.2f} seconds: {entry['text']}" for entry in transcript])

        # Create the response dictionary
        response = {
            "video_id": video_id,
            "transcript": transcript_text
        }
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)


