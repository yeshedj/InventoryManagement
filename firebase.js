// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArjql9TqdKnNppYxL5YzYqUP-awn98YxY",
  authDomain: "inventory-management-fa339.firebaseapp.com",
  projectId: "inventory-management-fa339",
  storageBucket: "inventory-management-fa339.appspot.com",
  messagingSenderId: "167194610377",
  appId: "1:167194610377:web:d7872c269c55269db15b18",
  measurementId: "G-S4TZS7C5MZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore=getFirestore(app)

export {firestore}