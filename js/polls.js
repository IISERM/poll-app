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
var db = firebase.firestore();
var pollGlobal;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        if (!user.emailVerified) {
            window.location = "account-verify.html";
        }
        loadActivePolls();
    } else {
        window.location = "index.html";
    }
});

function removeFromSelect() {
    var sel = document.getElementById("pollselect");
    var i;
    for (i = sel.options.length - 1; i > 0; i--) {
        sel.remove(i);
    }
    hidebuttons();
}

function loadActivePolls() {
    //The function logic would be different once the lists are there.
    //Write now, there is just one db having the name of all polls.
    removeFromSelect();
    var activePolls;
    var select = document.getElementById("pollselect");
    document.getElementById('current_poll').innerHTML = "No Poll Selected.";
    db.collection("ListWiseActivePolls").doc("All")
        .get()
        .then(function (doc) {
            if (doc.exists) {
                activePolls = doc.get("ActivePolls");
                for (var i = 0; i < activePolls.length; i++) {
                    select.options[select.options.length] = new Option(decodeFromFirebaseKey(activePolls[i]), activePolls[i]);
                    select.options[select.options.length - 1].className = "f6 f4-ns pa1"
                }
            } else {
                displayMessage("An unexpected error has occurred. Report to developers");
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
        hasAlreadyVoted(collectionName);
    } else {
        pollGlobal = null;
        document.getElementById('current_poll').innerHTML = "No Poll Selected.";
        hidebuttons();
    }
}

function hasAlreadyVoted(collectionName) {
    var alreadyVotedList = null;
    db.collection("Polls").doc("Redundant").collection(collectionName).doc("PeopleWhoHaveAlreadyVoted")
        .get()
        .then(function (doc) {
            alreadyVotedList = doc.data().AlreadyVoted;
            if (alreadyVotedList.indexOf(firebase.auth().currentUser.email) != -1) {
                document.getElementById('current_poll').innerHTML = "Yay! You've already voted!";
                db.collection("Polls").doc("Redundant").collection(collectionName).doc("PollContent")
                    .withConverter(pollConverter)
                    .get()
                    .then(function (doc) {
                        if (!doc.exists) {
                            displayMessage("An unexpected error has occurred. Report to the developers.");
                            console.log("The document was not found.");
                        } else {
                            pollGlobal = doc.data();
                            hidebuttons();
                            showresult();
                        }
                    })
                    .catch(function (error) {
                        console.log(error.code);
                        console.log(error.message);
                        displayMessage("There was an error in fetching the contents. Please try again later.");
                        hidebuttons();
                    });
            } else {
                db.collection("Polls").doc("Redundant").collection(collectionName).doc("PollContent")
                    .withConverter(pollConverter)
                    .get()
                    .then(function (doc) {
                        if (!doc.exists) {
                            displayMessage("An unexpected error has occurred. Report to the developers.");
                            console.log("The document was not found.");
                        } else {
                            pollGlobal = doc.data();
                            document.getElementById('current_poll').innerHTML = pollGlobal.getAsHTML();
                            hidebuttons();
                            showsubmit();
                        }
                    })
                    .catch(function (error) {
                        console.log(error.code);
                        console.log(error.message);
                        displayMessage("There was an error in fetching the contents. Please try again later.");
                        hidebuttons();
                    });
            }
        })
        .catch(function (error) {
            displayMessage("There was an error. Please retry.");
            console.log(error.code, error.message);
            hidebuttons();
        });
}

function submitPollResponse() {
    var sure = confirm("Are you sure you wish to submit your response? Once you submit, no changes are possible.");
    if (sure == true) {
        var numOfQuestions = pollGlobal.questions.length;
        var i;
        var dbRef = db.collection("Polls").doc("Redundant").collection(pollGlobal.topic).doc("PollResults");
        if (pollGlobal.isAnonymous) {
            var batch = db.batch();
            var responseMap = {};
            for (i = 0; i < numOfQuestions; i++) {
                var qType = pollGlobal.questions[i].type;
                if (qType == 0) {
                    var j;
                    for (j = 0; j < pollGlobal.questions[i].options.length; j++) {
                        if (document.getElementById("question_" + i + "_" + j).checked) {
                            responseMap[pollGlobal.questions[i].questionStr + "." + pollGlobal.questions[i].options[j]] = firebase.firestore.FieldValue.increment(1);
                            break;
                        }
                    }
                } else if (qType == 1) {
                    var j;
                    for (j = 0; j < pollGlobal.questions[i].options.length; j++) {
                        if (document.getElementById("question_" + i + "_" + j).checked) {
                            responseMap[pollGlobal.questions[i].questionStr + "." + pollGlobal.questions[i].options[j]] = firebase.firestore.FieldValue.increment(1);
                        }
                    }
                } else if (qType == 2) {
                    var resp = document.getElementById("question_" + i).value;
                    responseMap[pollGlobal.questions[i].questionStr + ".Responses"] = firebase.firestore.FieldValue.arrayUnion(resp);
                } else {
                    console.log("Something is seriously wrong.");
                }
            }
            batch.update(dbRef, responseMap);
            batch.update(db.collection("Polls").doc("Redundant").collection(pollGlobal.topic).doc("PeopleWhoHaveAlreadyVoted"), { "AlreadyVoted": firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.email) });
            batch.commit()
                .then(function () {
                    displayMessageAndReload("Your response has been recorded.");
                })
                .catch(function (error) {
                    displayMessage("Your response couldn't be recorded");
                    console.log(error.code, error.message);
                });
        }
    }
}

function getPollResults() {
    db.collection("Polls").doc("Redundant").collection(pollGlobal.topic).doc("PollResults")
        .get()
        .then(function (doc) {
            if (!doc.exists) {
                displayMessage("An unexpected error has occurred. Report to the developers");
            } else {
                var res = doc.data();
                var data = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
                var url = window.URL.createObjectURL(data);
                var a = document.createElement('a');
                a.href = url;
                a.download = pollGlobal.topic + " Results.json";
                a.click();
            }
        })
        .catch(function (error) {
            displayMessage("An error has occurred.");
            console.log(error.code, error.message);
        });
}

function signOut() {
    removeFromSelect();
    document.getElementById('current_poll').innerHTML = "No Poll Selected";
    firebase.auth().signOut()
        .catch(function (error) {
            displayMessage("Couldn't sign you out.");
            console.log(error.code);
            console.log(error.message);
        });
}

function hidebuttons() {
    document.getElementById("poll_submit").classList.remove("dib");
    document.getElementById("poll_result").classList.remove("dib");
    document.getElementById("poll_submit").classList.add("dn");
    document.getElementById("poll_result").classList.add("dn");
}

function showsubmit() {
    document.getElementById("poll_submit").classList.remove("dn");
    document.getElementById("poll_submit").classList.add("dib");
}

function showresult() {
    document.getElementById("poll_result").classList.remove("dn");
    document.getElementById("poll_result").classList.add("dib");
}

function displayMessage(msg) {
    var div = document.getElementById("errorDiv");
    var span = document.getElementById("errorMsg");
    span.innerHTML = msg;
    div.classList.remove("hidden");
    setTimeout(() => {
        div.classList.add("hidden");
    }, 5000);
}

function displayMessageAndReload(msg) {
    var div = document.getElementById("errorDiv");
    var span = document.getElementById("errorMsg");
    span.innerHTML = msg
    div.classList.remove("hidden");
    setTimeout(() => {
        div.classList.add("hidden");
        window.location.reload();
    }, 1000);
}
