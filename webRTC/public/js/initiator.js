window.navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let initiatorId = 20001;

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

  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const btnRequestCamera = document.getElementById('btnRequestCamera');
  const btnCreateRoom = document.getElementById('btnCreateRoom');
  const btnMakeCall = document.getElementById('btnMakeCall');
  const btnEndCall = document.getElementById('btnEndCall');

  //listen to notifications from the Telephone-Exchange
  exchangeReference.child(initiatorId).child('from').on('value', function (snapshot) {
    let ackFrom = snapshot.val();
    if (ackFrom) {
      console.log("Setup acknowledgement received from ", ackFrom);
      window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      }).then(function (stream) {
        window.localStream = localVideo.srcObject = stream;
        createRTCPeerConnectionAndCreateOffer(ackFrom);
      }).catch(function (err) {
        console.error(err);
      });
    }
  });
  exchangeReference.child(initiatorId).child('icecandidate').on('value', function (snapshot) {
    let remoteCandidate = snapshot.val();
    if (remoteCandidate) {
      console.log('remoteCandidate', remoteCandidate);
      window.initiatorPeer.addIceCandidate(new RTCIceCandidate(JSON.parse(remoteCandidate)));
    }
  });
  exchangeReference.child(initiatorId).child('sdp').on('value', function (snapshot) {
    let remoteSDP = snapshot.val();
    if (remoteSDP) {
      console.log("INFO: remoteSDP received @", new Date());
      initiatorPeer.setRemoteDescription(JSON.parse(remoteSDP));
    }
  });

  btnMakeCall.addEventListener('click', function () {
    let receiverId = 10001;//let's call 10001
    initiatorsReference.child(initiatorId).child('status').set('busy').then(function () {
      exchangeReference.child(receiverId).child('from').set(initiatorId);//Call setup request sent to receiver:10001
      console.log("INFO: Call setup request sent to ", receiverId, " @", new Date());
    });
  });

  btnEndCall.addEventListener('click', function () {
    if (window.initiatorPeer) {
      window.initiatorPeer.close();
      window.initiatorPeer = null;
      console.log("INFO: End Call Success.");
    }
  });
};

let createRTCPeerConnectionAndCreateOffer = function (receiverId) {
  let initiatorPeer = new RTCPeerConnection(null);
  window.initiatorPeer = initiatorPeer;
  initiatorPeer.onaddstream = function (evt) {
    console.log("\nReceived remote stream.\n");
    window.remoteStream = remoteVideo.srcObject = evt.stream;
  }
  initiatorPeer.addEventListener('iceconnectionstatechange', function (evt) {
    let d = new Date();
    let log = document.getElementById('log');
    let newLogItem = document.createElement('li');
    newLogItem.textContent = evt.target.iceConnectionState + " @ " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
    log.appendChild(newLogItem);
  });
  initiatorPeer.addStream(window.localStream);//imp to add stream b4 offering
  initiatorPeer.createOffer().then(function (rtcSDPOffer) {
    initiatorPeer.setLocalDescription(rtcSDPOffer);
    receiversReference.child(receiverId).child('status').set('busy').then(function () {//Optional: investigate
      console.log("Offer @", new Date());
      exchangeReference.child(receiverId).child('sdp').set(JSON.stringify(rtcSDPOffer))
      .then(function () {
        console.log('SDP shared from Initiator side');
      });
    });
  }).catch(function (err) {
    console.error(err);
  });

  /*NOTE: The following should not be done on initiator side
  initiatorPeer.onicecandidate = function (evt) {
    if(evt.candidate){
      console.log('INFO: Local onicecandidate @ ',new Date(), evt.candidate);
      exchangeReference.child(receiverId).child('icecandidate').set(JSON.stringify(evt.candidate))
      .then(function () {
        console.log('Added icecandidate from Initiator side');
      });
    }
  };
  */
}
