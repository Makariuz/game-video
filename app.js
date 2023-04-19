const video = document.getElementById('video');
import * as faceapi from './face-api.js';

// Request permission to access the user's camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    // Set the video element's source to the camera stream
    video.srcObject = stream;
    video.play();
  })
  .catch(error => {
    console.error('Error accessing camera:', error);
  });


  // Load the face-api.js models
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/face-api.js/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/face-api.js/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('/face-api.js/weights')
  ]).then(startVideo)
    .catch(error => {
      console.error('Error loading face-api.js models:', error);
    });
  
  // Start the video stream and smile detection
  function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // Set the video element's source to the camera stream
        video.srcObject = stream;
        video.play();
        // Start smile detection
        setInterval(detectSmile, 100);
      })
      .catch(error => {
        console.error('Error accessing camera:', error);
      });
  }
  
  // Detect smiles in the video stream
  function detectSmile() {
    // Create a canvas element to draw the video frame on
    const canvas = faceapi.createCanvasFromMedia(video);
    // Append the canvas element to the body
    document.body.append(canvas);
    // Get the video element's dimensions
    const dimensions = {
      width: video.videoWidth,
      height: video.videoHeight
    };
    // Set the canvas element's dimensions to match the video element's dimensions
    faceapi.matchDimensions(canvas, dimensions);
    // Detect faces in the video stream
    faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .then(results => {
        // Draw the video frame and face landmarks on the canvas
        const resizedResults = faceapi.resizeResults(results, dimensions);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedResults);
        faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
        // Check if each face is smiling
        resizedResults.forEach(result => {
          const { expressions } = result;
          if (expressions.happy > 0.7) {
            // Replace this with the action you want to take when a smile is detected
            console.log('Smile detected!');
          }
        });
      })
      .catch(error => {
        console.error('Error detecting faces:', error);
      });
  }
  