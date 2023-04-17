import { setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { firebase, userColsRef } from './firebase';
import { useEffect } from 'react';

export function addLoggedInUser(user: User) {
   if (!user) return;

   const userDoc = doc(userColsRef, user.email as string);

   const userData = {
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      isAnonymous: user.isAnonymous,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      providerId: user.providerId,
      uid: user.uid,
      comment: '',
      createdAt: serverTimestamp(),
      isPublic: true
   };

   getDoc(userDoc).then((doc) => {
      if (doc.exists()) return;
      setDoc(userDoc, userData, { merge: true });
   });
}

export enum FIREBASE_ANALYTICS_EVENTS {
   // pages
   home_page = 'home_page',
   profile = 'profile',
   time_table = 'time_table',
   free_classrooms = 'free_classrooms',
   developer = 'developer',
   contribute = 'contribute',
   notifications = 'notifications',
   // click events
   link_share_on_whatsapp = 'link_share_on_whatsapp',
   print_time_table = 'print_time_table'
}

import { logEvent } from 'firebase/analytics';

export function reportFirebaseAnalytics(key: string, val: any) {
   if (!firebase.firebaseAnalytics) return;
   logEvent(firebase.firebaseAnalytics, key, val);
}

export function useFirebaseAnalyticsReport(eventName: FIREBASE_ANALYTICS_EVENTS) {
   useEffect(() => {
      reportFirebaseAnalytics(eventName.toString(), {});
   }, []);
}
