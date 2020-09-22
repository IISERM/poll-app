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
    hideOverlay();
    if (user) {
        if (!user.emailVerified) {
            firebase.auth().currentUser.sendEmailVerification()
                .then(function() {
                    console.log("Mail sent.");
                    window.location = "account-verify.html";
                })
                .catch(function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(errorCode);
                    console.log(errorMessage);
                    window.location = "account-verify.html";
                });
            
        } else {
            window.location = "polls.html";
        }
    }
});

function showError(errormsg) {
    console.log("showError: " + errormsg);
    errordiv = document.getElementById("errorDiv")
    errordiv.style.visibility = "visible"
    errorspan = document.getElementById("errorMsg")
    errorspan.innerHTML = errormsg
}
function hideError() {
    errordiv = document.getElementById("errorDiv")
    errordiv.style.visibility = "hidden"
}

function login() {
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("passwordLogin").value;
    var persistenceMode = document.getElementById("ckbxRememberMe").checked ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
    showOverlay();
    firebase.auth().setPersistence(persistenceMode)
        .then(function () {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function () {
                    console.log("Logged in.");
                })
                .catch(function (error) {
                    hideOverlay();
                    var errorMessage = error.message;
                    var errorCode = error.code;
                    console.log(errorCode);
                    console.log(errorMessage);
                    if (errorCode == "auth/user-not-found") {
                        showError("User not found. Please sign up to continue");
                    } else if (errorCode == "auth/invalid-email") {
                        showError("Invalid email");
                    } else if (errorCode == "auth/wrong-password") {
                        showError("Wrong Password");
                    } else {
                        showError("Some error has occurred. Please try again.");
                    }
                });
        })
        .catch(function (error) {
            hideOverlay();
            console.log(error.code, error.message);
        });
}

function signUp() {
    showOverlay();
    var email = document.getElementById("registrationNumber").value.trim() + "@iisermohali.ac.in";
    var password = document.getElementById("passwordSignUp").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    if (password != confirmPassword) {
        showError("The two passwords must match.");
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function () {
                hideOverlay();
                console.log("Created");
            })
            .catch(function (error) {
                hideOverlay();
                var errorCode = error.code;
                console.log(errorCode);
                console.log(error.message);
                if (errorCode == "auth/email-already-in-use") {
                    showError("You are alredy registered. Please sign in to continue.");
                } else if (errorCode == "auth/weak-password") {
                    showError("Password must be a string with at least six characters.");
                } else {
                    showError("Some error has occurred. Please try again.");
                }
            });
    }
}

function sendResetPasswordLink() {
    var email = document.getElementById("forgotPasswordEmail").value.trim();
    showOverlay();
    firebase.auth().sendPasswordResetEmail(email)
        .then(function () {
            hideOverlay();
            showError("Reset Link Sent.")
        })
        .catch(function (error) {
            var errorCode = error.code;
            console.log(errorCode);
            console.log(error.message).
            hideOverlay();
            if (error.code == "auth/user-not-found") {
                showError("That username doesn't exist.");
            } else if (errorCode == "auth/invalid-email") {
                showError("That email is invalid.");
            } else {
                showError("Some error has occurred. Please try again.")
            }
        });
}

function showForgotPasswordDiv() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("forgotPasswordForm").style.display = "block";
    document.getElementById("sign_in_button").style.display = "initial";
    document.getElementById("sign_up_button").style.display = "initial";
    document.getElementById("forgot_pswd_button").style.display = "none";
    hideError()
    document.getElementById("ckbxRememberMe").checked = false;
    location.hash = "forgotPassword";
}

function showSignUpDiv() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "block";
    document.getElementById("forgotPasswordForm").style.display = "none";
    document.getElementById("sign_in_button").style.display = "initial";
    document.getElementById("sign_up_button").style.display = "none";
    document.getElementById("forgot_pswd_button").style.display = "initial";
    hideError()
    document.getElementById("ckbxRememberMe").checked = false;
    location.hash = "signUp";
}

function showSignInDiv() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("forgotPasswordForm").style.display = "none";
    document.getElementById("sign_in_button").style.display = "none";
    document.getElementById("sign_up_button").style.display = "initial";
    document.getElementById("forgot_pswd_button").style.display = "initial";
    hideError();
    document.getElementById("ckbxRememberMe").checked = false;
    location.hash = "signIn";
}

function showOverlay() {
    document.getElementById("overlay").classList.remove("hidden");
}

function hideOverlay() {
    console.log("Hiding");
    document.getElementById("overlay").classList.add("hidden");
}