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
var lastHash="";
window.onhashchange = hashChanged;
firebase.initializeApp(firebaseConfig);
firebase.analytics();

function login(){
    
}

function signUp(){

}

function sendResetPasswordLink(){

}

function showForgotPasswordDiv(){
    document.getElementById("loginForm").style.display="none";
    document.getElementById("forgotPasswordForm").style.display="block";
    document.getElementById("forgotPasswordButton").style.display="none";
    document.getElementById("createAccountButton").style.display="none";
    location.hash="forgotPassword";
}

function showSignUpDiv(){
    document.getElementById("loginForm").style.display="none";
    document.getElementById("signUpForm").style.display="block";
    document.getElementById("forgotPasswordButton").style.display="none";
    document.getElementById("createAccountButton").style.display="none";
    location.hash="signUp";
}

function hashChanged(){
    if(lastHash=="#forgotPassword" || lastHash=="#signUp"){
        document.getElementById("signUpForm").style.display="none";
        document.getElementById("forgotPasswordForm").style.display="none";
        document.getElementById("loginForm").style.display="block";
        document.getElementById("forgotPasswordButton").style.display="inline";
        document.getElementById("createAccountButton").style.display="inline";
	}
    lastHash=location.hash;
}
