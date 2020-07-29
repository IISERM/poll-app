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

if(firebase.auth().currentUser != null){
    //Directly move to the next page;
}
firebase.auth().onAuthStateChanged(function(user){
    if(user){
        if(document.getElementById("ckbxRememberMe").checked){
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .catch(function(error){
                    console.log(error.message);
                    console.log(error.code);
                });
		}else{
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                .catch(function(error){
                    console.log(error.message);
                    console.log(error.code);
                });
		}
	}
});

function login() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("passwordLogin").value;
    firebase.auth().signInWithEmailAndPassword(email,password)
        .then(function(){
            if(firebase.auth().currentUser != null){
                console.log("Logged in");
			}
		})
        .catch(function(error){
            var errorMessage = error.message;
            var errorCode = error.code;
            console.log(errorCode);
            console.log(errorMessage);
            if(errorCode == "auth/user-not-found"){
                document.getElementById("errorMsg").innerHTML="User not found. Please sign up to continue";
			}else if(errorCode == "auth/invalid-email"){
                document.getElementById("errorMsg").innerHTML="Invalid email";
			}else{
                document.getElementById("errorMsg").innerHTML="Some error has occured. Please try again.";
			}
        });
}

function signUp() {
    var email = document.getElementById("registrationNumber").value+"@iisermohali.ac.in";
    var password = document.getElementById("passwordSignUp").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    if(password != confirmPassword){
        document.getElementById("errorMsg").innerHTML="The two passwords must match.";
	}else{
        firebase.auth().createUserWithEmailAndPassword(email,password)
            .then(function(){
                console.log("Created");
                if(firebase.auth().currentUser != null){
                    console.log("Mail sent.")
                    firebase.auth().currentUser.sendEmailVerification()
                        .catch(function(error){
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log(errorCode);
                        console.log(errorMessage)
			        });
		        }
			})
            .catch(function(error){
                var errorCode = error.code;
                console.log(errorCode);
                console.log(error.message);
                if(errorCode == "auth/email-already-in-use"){
                    document.getElementById("errorMsg").innerHTML="You are alredy registered. Please sign in to continue.";
				}else if(errorCode == "auth/invalid-password"){
                    document.getElementById("errorMsg").innerHTML="Password must be a string with at least six characters.";
                }else{
                    document.getElementById("errorMsg").innerHTML="Some error has occurred. Please try again.";
				}
		    });
	}
}

function sendResetPasswordLink() {
    var email = document.getElementById("forgotPasswordEmail").value;
    firebase.auth().sendPasswordResetEmail(email)
        .then(function(){
            document.getElementById("errorMsg").innerHTML = "Reset Link Sent."
        })
        .catch(function(error){
            var errorCode=error.code;
            console.log(errorCode);
            console.log(error.message)
            if(error.code == "auth/user-not-found"){
                document.getElementById("errorMsg").innerHTML = "That username doesn't exist.";
			}else if(errorCode == "auth/invalid-email"){
                document.getElementById("errorMsg").innerHTML = "That email is invalid.";
			}else{
                document.getElementById("errorMsg").innerHTML = "Some error has occurred. Please try again."
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
    document.getElementById("errorMsg").innerHTML = "";
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
    document.getElementById("errorMsg").innerHTML = "";
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
    document.getElementById("errorMsg").innerHTML = "";
    document.getElementById("ckbxRememberMe").checked = false;
    location.hash = "signIn";
}
