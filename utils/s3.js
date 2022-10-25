require('dotenv').config();
const S3 = require('aws-sdk/clients/s3');

const fs = require('fs');
const bucketName =  process.env.AWS_BUCKET;
const region =  process.env.AWS_REGION;
const accessKeyId =  process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KET;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

// uploads a file to s3
function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path)
  
    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: file.filename
    }
  
    return s3.upload(uploadParams).promise()
  }
  exports.uploadFile = uploadFile
  
  
  // downloads a file from s3
  function getFileStream(fileKey) {
    const downloadParams = {
      Key: fileKey,
      Bucket: bucketName
    }
  
    return s3.getObject(downloadParams).createReadStream()
  }

  exports.getFileStream = getFileStream;

  function deleteFileStream(fileKey) {
    const deleteParams = {
        Key: fileKey,
        Bucket: bucketName
    }
    s3.deleteObject(deleteParams, async (err, data) => {
            if(err) {
                console.log(err);
            }
        }
    )
  }


  exports.deleteFileStream = deleteFileStream;
 