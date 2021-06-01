import firebase from "firebase";

var firebaseConfig = {
    apiKey: "AIzaSyC8fpNzpymEw0lk5BXwbvdlmdq5JwlcEK8",
    authDomain: "chat-application-6dc31.firebaseapp.com",
    projectId: "chat-application-6dc31",
    storageBucket: "chat-application-6dc31.appspot.com",
    messagingSenderId: "63827329645",
    appId: "1:63827329645:web:fd0a7378327de46695f564"
};

firebase.initializeApp(firebaseConfig);

export const f = firebase;
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
