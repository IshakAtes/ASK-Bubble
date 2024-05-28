import { ApplicationConfig} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp } from "firebase/app";
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {provideFirebaseApp } from '@angular/fire/app';
import * as firebaseConfig from '../assets/firebaseConfig.json';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';



export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => 
    initializeApp(
      { "projectId": firebaseConfig.projectId,
        "appId":firebaseConfig.appId,
        "storageBucket":firebaseConfig.storageBucket,
        "apiKey":firebaseConfig.apiKey,
        "authDomain":firebaseConfig.authDomain,
        "messagingSenderId":firebaseConfig.messagingSenderId
      })),
      provideFirestore(() => getFirestore()), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(),

  ]
};
