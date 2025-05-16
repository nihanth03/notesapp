// s3.jsx
import React, { useEffect, useState } from "react";
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { Buffer } from 'buffer';

const REGION = "ap-south-1";
const IDENTITY_POOL_ID = "ap-south-1:8c628519-6098-49c3-a41c-5a4ffd9fe0be";
const USER_POOL_ID = "ap-south-1_dZWoKMzXu";
const BUCKET_NAME = "file-upload-practice-test";

// Allowed video formats
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
];

export default function S3({ idToken }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idToken) return;
    fetchFiles();
  }, [idToken]);

  const fetchFiles = async () => {
    try {
      const credentials = fromCognitoIdentityPool({
        identityPoolId: IDENTITY_POOL_ID,
        clientConfig: { region: REGION },
        logins: {
          [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken
        }
      });

      const s3 = new S3Client({
        region: REGION,
        credentials
      });

      const identityId = (await credentials()).identityId;
      const prefix = `${identityId}/videos/`;

      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix
      });
      const response = await s3.send(listCommand);
      setFiles(response.Contents || []);
    } catch (err) {
      console.error("Error listing S3 files", err);
      setError("Failed to load videos. Please try again.");
    }
  };

  const validateVideoFile = (file) => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error('Invalid video format. Please upload MP4, WebM, OGG, or QuickTime videos.');
    }
    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      throw new Error('Video file is too large. Maximum size is 500MB.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateVideoFile(file);
      setSelectedFile(file);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSelectedFile(null);
      e.target.value = ''; // Reset input
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !idToken) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      const credentials = fromCognitoIdentityPool({
        identityPoolId: IDENTITY_POOL_ID,
        clientConfig: { region: REGION },
        logins: {
          [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken
        }
      });

      const s3 = new S3Client({
        region: REGION,
        credentials
      });

      const identityId = (await credentials()).identityId;
      const key = `${identityId}/videos/${selectedFile.name}`;

      // Convert file to buffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: selectedFile.type
      });

      await s3.send(uploadCommand);
      setUploadProgress(100);
      alert("Video uploaded successfully!");
      
      // Refresh file list and reset state
      await fetchFiles();
      setSelectedFile(null);
      setIsUploading(false);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error("Error uploading video", err);
      setError("Failed to upload video. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Your Videos in S3</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3>Upload a Video</h3>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          style={{ marginBottom: '10px' }}
        />
        {selectedFile && (
          <div style={{ marginTop: '10px' }}>
            <p>Selected file: {selectedFile.name}</p>
            <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        )}
        <button 
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          style={{
            padding: '8px 16px',
            backgroundColor: !selectedFile || isUploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer'
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
        {isUploading && (
          <div style={{ marginTop: '10px' }}>
            Uploading: {uploadProgress}%
          </div>
        )}
      </div>

      <div>
        <h3>Your Videos</h3>
        {files.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {files.map((file) => (
              <li 
                key={file.Key}
                style={{
                  padding: '10px',
                  marginBottom: '5px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                📹 {file.Key?.split("/").pop()}
                <span style={{ marginLeft: 'auto', color: '#666' }}>
                  {(file.Size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 