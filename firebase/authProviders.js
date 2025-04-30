//authProviders.js
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { FirebaseAuth } from "./config";

const GoogleProvider = new GoogleAuthProvider();

export const registerUser = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(
      FirebaseAuth,
      email,
      password
    );

    const { uid, photoURL } = result.user;

    await updateProfile(FirebaseAuth.currentUser, { displayName });

    return {
      ok: true,
      uid,
      photoURL,
      email,
      displayName,
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error.message,
    };
  }
};

// Authenticate user against firebase authentication
export const authUser = async (email, password) => {
  try {
    console.log(email, password);
    console.log("Email antes de iniciar sesión:", email); // Verifica el email
    console.log("Password antes de iniciar sesión:", password); // Verifica la contraseña
    const result = await signInWithEmailAndPassword(
      FirebaseAuth,
      email,
      password
    );

    console.log(result);
    const { uid, photoURL, displayName } = result.user;

    return {
      ok: true,
      uid,
      email,
      password,
      photoURL,
      displayName,
    };
  } catch (error) {
    console.log(error);

    return {
      ok: false,
      errorMessage: error.message,
    };
  }
};

export const authWithGoogle = async () => {
  GoogleProvider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await signInWithPopup(FirebaseAuth, GoogleProvider);

    const { displayName, email, photoURL, uid } = result.user;

    return {
      ok: true,
      uid,
      photoURL,
      email,
      displayName,
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error.message,
    };
  }
};
