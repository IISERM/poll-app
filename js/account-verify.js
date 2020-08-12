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

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        if (!user.emailVerified) {
            showContent();
        } else {
            window.location = "polls.html";
        }
    } else {
        window.location = "index.html";
    }
});

function resendVerificationLink() {
    displayMessage("");
    firebase.auth().currentUser.sendEmailVerification()
        .then(function (){
            console.log("Verification link sent.")
            hideContent();
            displayMessage("Account verification mail has been sent. Refresh after verification.");
        })
        .catch(function (error) {
            console.log(error.code, error.message)
            displayMessage("There was an error in sending the link. Please retry.");
        });
}

function displayMessage(str) {
    document.getElementById("message").innerHTML = str;
}

function signOut() {
    firebase.auth().signOut()
        .catch(function (error) {
            displayMessage("Couldn't sign you out.");
            console.log(error.code);
            console.log(error.message);
        });
}

function showContent() {
    document.getElementById("verifyMsg").style.visibility = "visible";
    document.getElementById("button").style.visibility = "visible";
}

function hideContent() {
    document.getElementById("verifyMsg").style.visibility = "hidden";
    document.getElementById("button").style.visibility = "hidden";
}
