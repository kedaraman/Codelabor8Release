'use strict';

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() 
{
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

//Function for when the execute button is pressed- sends the code to server and waits for a response with the output
function exec(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:5000/api", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
    var data = JSON.stringify({contentOfEditor: editorContent});


    xhttp.send(data);



    xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(xhttp.responseText);

            document.getElementById("console").value = response.output;
         }
    };
}

//Start of Main Code
checkSetup();

var passText;

var userID = Math.round((Math.random()*100));

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
editor.resize(true);
var doc = editor.getSession().getDocument();

//Set up variables to access database
var db = firebase.database().ref();
var fileEditing = "DefaultFile";
var applyingDeltas = false;

//Send updates to the file
editor.on("change", function(e) {

    if (applyingDeltas) {
        return;
    }
    var text = doc.getAllLines();

    db.child(fileEditing).child("UpdateQueue").child(Date.now().toString() + ":" + (Math.random().toString().slice(2)%100)).set({event: e, user: userID}).catch(function(e) {
        console.error(e);
    });

    db.child(fileEditing).update({FileContent: text});
});

//Poll for updates to the file
db.child(fileEditing).child("UpdateQueue").on("child_added", function (ref) {

    applyingDeltas = true;
    var arr = [ref.val()];

    if(ref.val().user != userID)
    {
        doc.applyDeltas([ref.val().event]);
    }

    passText = doc.getAllLines();
    
    applyingDeltas = false;
});