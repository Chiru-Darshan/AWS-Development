const util = require('util');
var jimp = require('jimp');
const AWS = require('aws-sdk')
const s3 = new AWS.S3();
const stepFunctions = new AWS.StepFunctions({
  region: "us-east-1"
});


module.exports.executeStepFunction = async (event, context, callback) => {
  console.log(`The Execution Started.....`)
  const stateMachineName = "ImageProcessingMachine"
  try {

    console.log(`Listing State Machines`)
    const listStateMachines = await stepFunctions.listStateMachines({}).promise()
    console.log(` Searching a State Machine : ${listStateMachines}`)
    for (let i = 0; i < listStateMachines.stateMachines.length; i++) {
      let item = listStateMachines.stateMachines[i]
      if (item.name.indexOf(stateMachineName) >= 0) {

        console.log(`Found the Step Machine : ${JSON.stringify(item)}`)
        const eventData = event.Records[0]

        var params = {
          stateMachineArn: item.stateMachineArn,
          input: JSON.stringify({
            objectKey: eventData.s3.object.key,
            bucketName: eventData.s3.bucket.name
          })
        }

        console.log(`Start Execution....`)
        const startExecution = await stepFunctions.startExecution(params).promise().then(() => {
          return context.succeed('OK')
        })

      }
    }



  } catch (err) {
    console.log("Error Ocuured: " + err)
    return context.fail(error)

  }



}


module.exports.resizeImage = async (event, context, callback) => {

  console.log("Reading options from event:\n", util.inspect(event, {
    depth: 5
  }));
  const srcBucket = event.bucketName
  const srcKey = event.objectKey

  //const srcBucket = event.Records[0].s3.bucket.name;;
  // Object key may have spaces or unicode non-ASCII characters.
  //const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const dstBucket = srcBucket + "-resized";
  const dstKey = "resized-" + srcKey;

  // Infer the image type from the file suffix.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return;
  }

  // Check that the image type is supportedj
  const imageType = typeMatch[1].toLowerCase();
  if (imageType != "jpg" && imageType != "png") {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  // Download the image from the S3 source bucket.

  try {
    const params = {
      Bucket: srcBucket,
      Key: srcKey
    };
    console.log(`Bucket : ${srcBucket} and key : ${srcKey}`)
    var origimage = await s3.getObject(params).promise();

  } catch (error) {
    console.log(error);
    return;
  }

  // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
  const width = 200;

  // Use the sharp module to resize the image and save in a buffer.
  var buffer = ''
  try {
    //var buffer = await sharp(origimage.Body).resize(width).toBuffer();
    const jimpImage = await jimp.read(origimage.Body);
    const mime = jimpImage.getMIME();

    buffer = await jimpImage.scaleToFit(width, 200).getBufferAsync(mime);
    console.log(`Jimp got buffer ${buffer}`)
  } catch (error) {
    console.log(error);
    return;
  }

  // Upload the thumbnail image to the destination bucket
  try {
    console.log(`Bucket : ${srcBucket} and key : ${dstKey}`)
    const destparams = {
      Bucket: srcBucket,
      Key: dstKey,
      Body: buffer,
      ContentType: "image"
    };

    const putResult = await s3.putObject(destparams).promise();

  } catch (error) {
    console.log(error);
    return;
  }

  console.log('Successfully resized ' + srcBucket + '/' + srcKey +
    ' and uploaded to ' + dstBucket + '/' + dstKey);




};

module.exports.saveImageMetaData = async (event, context, callback) => {
  console.log(`SaveImageMetaData was Called....`)
  callback(null, {
    message: "thumbnail got invoked....."
  })
}

module.exports.thumbnails = async (event, context, callback) => {

  const srcBucket = event.Records[0].s3.bucket.name;
  console.log(` Thumbnail function got called! ${srcBucket}`)
  callback(null, {
    message: "thumbnail got invoked....."
  })

}