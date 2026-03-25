import boto3
from botocore.config import Config
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

router = APIRouter()

class UploadRequest(BaseModel):
    filename: str
    content_type: str

@router.post("/presigned")
async def get_presigned_url(req: UploadRequest):
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            config=Config(signature_version='s3v4')
        )
        
        bucket_name = os.getenv("AWS_S3_BUCKET_NAME", "swifttor-emergency-uploads")
        # Ensure unique filename to prevent collisions
        import uuid
        ext = os.path.splitext(req.filename)[1]
        unique_key = f"emergency_{uuid.uuid4()}{ext}"

        url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket_name,
                'Key': unique_key,
                'ContentType': req.content_type
            },
            ExpiresIn=3600
        )
        
        return {
            "url": url,
            "fields": {},
            "key": unique_key
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 Error: {str(e)}")
