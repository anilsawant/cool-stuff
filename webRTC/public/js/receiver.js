window.navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let receiverId = 10001;

window.onload = function () {
  // Initialize Firebase
  let config = {
    apiKey: "AIzaSyDGGFYyPbrX6YtNGHIKzdUtAEpD4bnMM8o",
    authDomain: "myfirebaseproject-c1059.firebaseapp.com",
    databaseURL: "https://myfirebaseproject-c1059.firebaseio.com",
    storageBucket: "myfirebaseproject-c1059.appspot.com",
    messagingSenderId: "367980625448"
  };
  let app = firebase.initializeApp(config);
  let fdb = window.fdb = firebase.database();
  let receiversReference = window.receiversReference = fdb.ref("webrtc/receivers");
  let initiatorsReference = window.initiatorsReference = fdb.ref("webrtc/initiators");
  let exchangeReference = window.exchangeReference = fdb.ref("webrtc/exchange");

  //listen to notifications from the Telephone-Exchange
  exchangeReference.child(receiverId).child('from').on('value', function (snapshot) {
    let callFrom = window.callFrom = snapshot.val();
    if (callFrom) {
      console.log("INFO: Call setup request from ", callFrom , '@', new Date());
      receiversReference.child(receiverId).child('status').set('busy').then(function () {
        //Call setup acknowledgement sent back to callFrom
        exchangeReference.child(callFrom).child('from').set(receiverId).then(function () {
          window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          }).then(function (stream) {
            window.localStream = localVideo.srcObject = stream;
            createRTCPeerConnection(callFrom);
          }).catch(function (err) {
            console.error(err);
            receiversReference.child(receiverId).child('status').set('online');//if the call fails
          });
        });
      });
    }
  });
  exchangeReference.child(receiverId).child('sdp').on('value', function (snapshot) {
    let remoteSDP = snapshot.val();
    if (remoteSDP) {
      console.log("INFO: remoteSDP received @", new Date());
      if (window.receiverPeer) {
        window.receiverPeer.setRemoteDescription(JSON.parse(remoteSDP));
      } else {
        console.log("Receiver peer not yet setup.");
      }
    }
  });

  /*NOTE: The following should not be done on the receiver side
  exchangeReference.child(receiverId).child('icecandidate').on('value', function (snapshot) {
    let remoteICECandidate = snapshot.val();
    if (remoteICECandidate) {
      console.log('remoteICECandidate', remoteICECandidate);
      if (window.receiverPeer) {
        //The following should not be done on the receiver end
        //window.receiverPeer.addIceCandidate(new RTCIceCandidate(JSON.parse(remoteICECandidate)));
      } else {
        console.log("WARN: add ice candiate called too early");
      }
    }
  });
  */


  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const btnAccept = document.getElementById('btnAccept');
  const btnEndCall = document.getElementById('btnEndCall');

  btnAccept.addEventListener('click', function () {
    window.receiverPeer.createAnswer().then(function (rtcSDPAnswer) {
      window.receiverPeer.setLocalDescription(rtcSDPAnswer);
      console.log("Answer @", new Date());
      exchangeReference.child(window.callFrom).child("sdp").set(JSON.stringify(rtcSDPAnswer))
      .then(function () {
        console.log('SDP shared from Receiver side');
      });
    }).catch(function (err) {
      console.error(err);
    });
  });

  btnEndCall.addEventListener('click', function () {
    if (window.receiverPeer) {
      window.receiverPeer.close();
      window.receiverPeer = null;
      console.log("INFO: End Call Success.");
    }
  });
};

let createRTCPeerConnection = function (callFrom) {
  let receiverPeer = window.receiverPeer = new RTCPeerConnection(null);
  receiverPeer.addStream(window.localStream);//imp to add stream b4 answering
  receiverPeer.onaddstream = function (evt) {
    console.log("\nReceived remote stream.\n");
    window.remoteStream = remoteVideo.srcObject = evt.stream;
  }
  receiverPeer.onicecandidate =  function (evt) {
    if(evt.candidate) {
      exchangeReference.child(callFrom).child('icecandidate').set(JSON.stringify(evt.candidate));
    }
  };
  receiverPeer.addEventListener('iceconnectionstatechange', function (evt) {
    let d = new Date();
    let log = document.getElementById('log');
    let newLogItem = document.createElement('li');
    newLogItem.textContent = evt.target.iceConnectionState + " @ " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
    log.appendChild(newLogItem);
  });
}
