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
var activePollsGlobal;
var closedPollsGlobal;

firebase.auth().onAuthStateChanged(function (user) {
    hideOverlay();
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
    var sel = document.getElementById("pollSelect");
    var i;
    for (i = sel.options.length - 1; i > 0; i--) {
        sel.remove(i);
    }
    hideResult();
    hideSubmit();
    hideClosePollButton();
}

function loadActivePolls() {
    //The function logic would be different once the lists are there.
    //Right now, there is just one db having the name of all polls.
    showOverlay();
    removeFromSelect();
    var select = document.getElementById("pollSelect");
    document.getElementById('current_poll').innerHTML = "No Poll Selected.";
    db.collection("ListWiseActivePolls").doc("All")
        .get()
        .then(function (doc) {
            if (doc.exists) {
                activePollsGlobal = doc.get("ActivePolls");
                closedPollsGlobal = doc.get("ClosedPolls");
                for (var i = 0; i < activePollsGlobal.length; i++) {
                    select.options[select.options.length] = new Option(decodeFromFirebaseKey(activePollsGlobal[i]), activePollsGlobal[i]);
                    select.options[select.options.length - 1].className = "f6 f4-ns pa1"
                }
                for (var i = 0; i < closedPollsGlobal.length; i++) {
                    select.options[select.options.length] = new Option(decodeFromFirebaseKey(closedPollsGlobal[i])+"(Closed)", closedPollsGlobal[i]);
                    select.options[select.options.length - 1].className = "f6 f4-ns pa1"
                }
            } else {
                displayMessage("An unexpected error has occurred. Report to developers");
                console.log("The document doesn't exist");
            }
            hideOverlay();
        })
        .catch(function (error) {
            hideOverlay();
            console.log(error.code);
            console.log(error.message);
            displayMessage("There was an error in fetching the polls. Please try again later.");
        });
}

async function loadPollQuestions() {
    var collectionName = document.getElementById("pollSelect").value;
    if (collectionName != "---Select a Poll---") {
        showOverlay();
        var alreadyVotedList = null;
        var hasAlreadyVoted = null;
        await db.collection("Polls").doc("Redundant").collection(collectionName).doc("PeopleWhoHaveAlreadyVoted").get()
        .then(function(doc) {
            alreadyVotedList = doc.data().AlreadyVoted;
            hasAlreadyVoted = alreadyVotedList.indexOf(firebase.auth().currentUser.email) != -1 ? true : false;
        })
        .catch(function (error) {
            displayMessage("There was an error. Please retry.");
            console.log(error.code, error.message);
        });
        await db.collection("Polls").doc("Redundant").collection(collectionName).doc("PollContent")
        .withConverter(pollConverter)
        .get()
        .then(function (doc){
            if (!doc.exists) {
                displayMessage("An unexpected error has occurred. Report to the developers.");
                console.log("The document was not found.");
            } else {
                pollGlobal = doc.data();
            }
            displayPoll(hasAlreadyVoted)
        })
        .catch(function (error){
            console.log(error.code, error.message);
            displayMessage("There was an error in fetching the contents. Please try again later.");
        });
    } else {
        pollGlobal = null;
        displayPoll(hasAlreadyVoted)
    }
}

function displayPoll(hasAlreadyVoted) {
    hideOverlay();
    if(pollGlobal == null) {
        document.getElementById('current_poll').innerHTML = "No Poll Selected.";
        hideSubmit();
        hideResult();
        hideClosePollButton();
    } else {
        if(hasAlreadyVoted) {
            document.getElementById('current_poll').innerHTML = "Yay! You've already voted!";
            hideSubmit();
        } else {
            document.getElementById('current_poll').innerHTML = pollGlobal.getAsHTML();
            showSubmit();
        }

        if(pollGlobal.createdBy == firebase.auth().currentUser.email) {
            showResult();
            if(pollGlobal.active)
                showClosePollButton();
        } else {
            if(pollGlobal.active) {
                hideResult();
            }
            hideClosePollButton();
        }
    }
}

function closePoll() {
    showOverlay();
    var pollRef = db.collection("Polls").doc("Redundant").collection(pollGlobal.topic).doc("PollContent");
    var pollListRef = db.collection("ListWiseActivePolls").doc("All");
    var batch = db.batch();
    batch.update(pollRef, {"active": false});
    batch.update(pollListRef, {"ActivePolls": firebase.firestore.FieldValue.arrayRemove(pollGlobal.topic)});
    batch.update(pollListRef, {"ClosedPolls": firebase.firestore.FieldValue.arrayUnion(pollGlobal.topic)});
    batch.commit()
        .then(function() {
            hideOverlay();
            displayMessageAndReload("The poll has been closed now.")
        }, function() {
            hideOverlay();
            displayMessage("The poll could not be closed.")
        })
        .catch(function(error) {
            hideOverlay();
            console.log(error.code, error.message);
            displayMessage("The poll could not be closed.")
        });
}

function submitPollResponse() {
    if (confirm("Are you sure you wish to submit your response? Once you submit, no changes are possible.")) {
        showOverlay();
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
                    hideOverlay();
                    displayMessageAndReload("Your response has been recorded.");
                })
                .catch(function (error) {
                    hideOverlay();
                    displayMessage("Your response couldn't be recorded");
                    console.log(error.code, error.message);
                });
        }
    }
}

function prettifyResultMap(poll) {
    var newPoll = new Object();
    for(var question in poll) {
        var newQuestion = new Object();
        for(var option in poll[question]) {
            newQuestion[decodeFromFirebaseKey(option)] = poll[question][option]
        }
        newPoll[decodeFromFirebaseKey(question)] = newQuestion
    }
    return newPoll;
}

function getPollResults() {
    showOverlay();
    db.collection("Polls").doc("Redundant").collection(pollGlobal.topic).doc("PollResults")
        .get()
        .then(function (doc) {
            hideOverlay();
            if (!doc.exists) {
                displayMessage("An unexpected error has occurred. Report to the developers");
            } else {
                var res = prettifyResultMap(doc.data());
                var data = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
                var url = window.URL.createObjectURL(data);
                var a = document.createElement('a');
                a.href = url;
                a.download = decodeFromFirebaseKey(pollGlobal.topic) + " Results.txt";
                a.click();
            }
        })
        .catch(function (error) {
            hideOverlay();
            displayMessage("An error has occurred.");
            console.log(error.code, error.message);
        });
}

function signOut() {
    showOverlay();
    removeFromSelect();
    document.getElementById('current_poll').innerHTML = "No Poll Selected";
    firebase.auth().signOut()
        .catch(function (error) {
            displayMessage("Couldn't sign you out.");
            console.log(error.code);
            console.log(error.message);
        });
}

function hideResult() {
    document.getElementById("poll_result").classList.remove("dib");
    document.getElementById("poll_result").classList.add("dn");
}

function hideSubmit() {
    document.getElementById("poll_submit").classList.remove("dib");
    document.getElementById("poll_submit").classList.add("dn");
}

function showSubmit() {
    document.getElementById("poll_submit").classList.remove("dn");
    document.getElementById("poll_submit").classList.add("dib");
}

function showResult() {
    document.getElementById("poll_result").classList.remove("dn");
    document.getElementById("poll_result").classList.add("dib");
}

function showClosePollButton() {
    document.getElementById("poll_close").classList.remove("dn");
    document.getElementById("poll_close").classList.add("dib");
}

function hideClosePollButton() {
    document.getElementById("poll_close").classList.remove("dib");
    document.getElementById("poll_close").classList.add("dn");
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

function showOverlay() {
    document.getElementById("overlay").style.display = "block";
}

function hideOverlay() {
    document.getElementById("overlay").style.display = "hidden";
}