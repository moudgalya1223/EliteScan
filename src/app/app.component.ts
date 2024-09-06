import { Component, OnInit } from '@angular/core';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'EliteScan';
  videoOptions: MediaTrackConstraints = {
    facingMode: 'user',
    width: 1080,
    height: 720,
  };
  all:any
  public trigger: Subject<void> = new Subject<void>();
  public model: mobilenet.MobileNet | undefined;
  image?: string;

  constructor() {}

  async ngOnInit(): Promise<void> {
    console.log('Component initializing');
    await this.loadModel();
    console.log('Model loaded in ngOnInit');
  }

  async loadModel(): Promise<void> {
    try {
      console.log('Starting model loading');
      this.model = await mobilenet.load();
      console.log('Model loaded');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  triggerSnapshot(): void {
    this.trigger.next(); // Trigger the snapshot
  }

  handleImage(webcamImage: WebcamImage): void {
    this.image = webcamImage.imageAsDataUrl; // The captured image as a base64 encoded data URL
    console.log('Image captured');
    this.detectImage(this.image); // Call detection function
  }

  async detectImage(imageDataUrl: string): Promise<void> {
    try {
      const image = new Image();
      image.src = imageDataUrl;
      image.onload = async () => {
        const imageTensor = tf.browser.fromPixels(image);
        console.log('Image tensor created:', imageTensor);

        if (this.model) {
          try {
            const predictions = await this.model.classify(imageTensor);
            this.all=JSON.stringify(predictions)
            console.log('Predictions:', predictions);
            console.log('all:', this.all[0]);
          } catch (error) {
            console.error('Error during classification:', error);
          }
        } else {
          console.error('Model not loaded');
        }
      };
      image.onerror = (error) => {
        console.error('Error loading image:', error);
      };
    } catch (error) {
      console.error('Error during image detection:', error);
    }
  }

  handleInitError(error: WebcamInitError): void {
    console.error('Error initializing webcam:', error);
  }
}
