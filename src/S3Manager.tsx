// S3Manager.tsx
import React, { useEffect, useState } from "react";
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  _Object
} from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

const REGION = "ap-south-1";
const IDENTITY_POOL_ID = "ap-south-1:8c628519-6098-49c3-a41c-5a4ffd9fe0be";
const USER_POOL_ID = "ap-south-1_dZWoKMzXu";
const BUCKET_NAME = "file-upload-practice-test";

export default function S3Manager({ idToken }: { idToken: string }) {
  const [files, setFiles] = useState<_Object[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!idToken) return;

    const fetchFiles = async () => {
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

      // First get Identity ID (used for folder prefix)
      const identityId = (await credentials()).identityId;
      const prefix = `${identityId}/`;

      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: prefix
        });
        const response = await s3.send(listCommand);
        setFiles(response.Contents || []);
      } catch (err) {
        console.error("Error listing S3 files", err);
      }
    };

    fetchFiles();
  }, [idToken]);

  const handleUpload = async () => {
    if (!selectedFile || !idToken) return;

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
    const key = `${identityId}/${selectedFile.name}`;

    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: selectedFile,
        ContentType: selectedFile.type
      });

      await s3.send(uploadCommand);
      alert("Upload successful!");
    } catch (err) {
      console.error("Error uploading file", err);
    }
  };

  return (
    <div>
      <h2>Your Files in S3</h2>
      <ul>
        {files.map((file) => (
          <li key={file.Key}>{file.Key?.split("/").pop()}</li>
        ))}
      </ul>

      <hr />

      <h3>Upload a file</h3>
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload}>Upload to S3</button>
    </div>
  );
}
