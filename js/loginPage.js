const firebaseConfig = {
    apiKey: "AIzaSyDfdUKiKHzPs0MN0WUQ9Mm9tMR4njm6U-s",
    authDomain: "poll-app-8877f.firebaseapp.com",
    databaseURL: "https://poll-app-8877f.firebaseio.com",
    projectId: "poll-app-8877f",
    storageBucket: "poll-app-8877f.appspot.com",
    messagingSenderId: "275134846597",
    appId: "1:275134846597:web:0865c7c0a10dc59a1ffbec",
    measurementId: "G-QMNV123VEJ"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

function login() {

}

function signUp() {

}

function sendResetPasswordLink() {

}

function showForgotPasswordDiv() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("forgotPasswordForm").style.display = "block";
    document.getElementById("sign_in_button").style.display = "initial";
    document.getElementById("sign_up_button").style.display = "initial";
    document.getElementById("forgot_pswd_button").style.display = "none";
    location.hash = "forgotPassword";
}

function showSignUpDiv() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "block";
    document.getElementById("forgotPasswordForm").style.display = "none";
    document.getElementById("sign_in_button").style.display = "initial";
    document.getElementById("sign_up_button").style.display = "none";
    document.getElementById("forgot_pswd_button").style.display = "initial";
    location.hash = "signUp";
}
function showSignInDiv() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("forgotPasswordForm").style.display = "none";
    document.getElementById("sign_in_button").style.display = "none";
    document.getElementById("sign_up_button").style.display = "initial";
    document.getElementById("forgot_pswd_button").style.display = "initial";
    location.hash = "signIn";
}
