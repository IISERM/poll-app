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
var db = firebase.firestore();
var userGlobal;
firebase.auth().onAuthStateChanged(function (user) {
    userGlobal = user;
    if (user) {
        if (!user.emailVerified) {
            displayMessage("You need to verify your email before you can cast your votes.");
        }
        loadActivePolls();
    } else {
        window.location = "index.html";
    }
});
function loadActivePolls() {
    //The function logic would be different once the lists are there. There will be one document storing the names of active polls for each list. This function will query that document.
    //Write now, there is just one db having the name of all polls.
    var activePolls;
    var select = document.getElementById("pollselect");
    db.collection("ListWiseActivePolls").doc("All")
        .get()
        .then(function (doc) {
            if (doc.exists) {
                activePolls = doc.get("Active Polls");
                for (var i = 0; i < activePolls.length; i++) {
                    select.options[select.options.length] = new Option(activePolls[i], activePolls[i]);
                    select.options[select.options.length - 1].className = "f6 f4-ns pa1"
                }
            } else {
                displayMessage("An unexpected error has occured. Report to developers");
                console.log("The document doesn't exist");
            }
        })
        .catch(function (error) {
            console.log(error.code);
            console.log(error.message);
            displayMessage("There was an error in fetching the polls. Please try again later.");
        });
}

function loadPollQuestions() {
    var collectionName = document.getElementById("pollselect").value;
    if (collectionName != "---Select a Poll---") {
        var alreadyVoted = hasAlreadyVoted();
        if (!alreadyVoted) {
            db.collection("Polls").doc("Redundant").collection(collectionName).doc("PollContent")
                .withConverter(pollConverter)
                .get()
                .then(function (doc) {
                    if (!doc.exists) {
                        displayMessage("An unexpected error has occurred. Report to the developers.");
                        console.log("The document was not found.");
                    } else {
                        poll = doc.data();
                        document.getElementById('current_poll').innerHTML = poll.getAsHTML();
                    }
                })
                .catch(function (error) {
                    console.log(error.code);
                    console.log(error.message);
                    displayMessage("There was an error in fetching the contents. Please try againg later.");
                });
        } else {
            document.getElementById('current_poll').innerHTML = "Yay! You've already voted!"
        }
    }
}

function displayMessage(msg) {
    var div = document.getElementById("errorDiv")
    var span = document.getElementById("errorMsg")
    span.innerHTML = msg
    div.classList.remove("hidden")
    setTimeout(() => {
        div.classList.add("hidden")
    }, 2000);
}

function hasAlreadyVoted() {
    return false;
}

function signOut() {
    firebase.auth().signOut()
        .then(function () {
            location.href = "index.html"
        }, function (error) {
            displayMessage("Couldn't sign you out.");
            console.log(error.code);
            console.log(error.message);
        });
}

/*
poll = new Poll(
    "Title", "Description", 0, false,
    [new Question(
        "This is a question with mcq.",
        0,
        ["Option1", "Option2", "Option3"]
    ),
    new Question(
        "This is a question with scq.",
        1,
        ["Option1", "Option2", "Option3"]
    ),
    new Question(
        "This is a question with lat.",
        2,
        []
    ),
    ])
document.getElementById('current_poll').innerHTML = poll.getAsHTML()
*/
