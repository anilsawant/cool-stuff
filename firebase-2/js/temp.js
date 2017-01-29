let exchangeProps = {
  "exchangeReference": exchangeReference,
  "callKey": newCallRef.key,
  "userId": userId,
  "fromSDP": "This is a FromSDP of " + userId
}
// sendFromSDP(exchangeProps);


let sendFromSDP = function (exchangeProps) {
  if (exchangeProps) {
    let exchangeReference = exchangeProps.exchangeReference,
        callKey = exchangeProps.callKey,
        userId = exchangeProps.userId,
        fromSDP = exchangeProps.fromSDP;
    if (exchangeReference && callKey && userId && fromSDP) {
      exchangeReference.child(callKey).transaction(function(currentCallProps) {
        if (currentCallProps) {
          if (currentCallProps.turn == userId) {
            currentCallProps.fromSDP = fromSDP;
            currentCallProps.turn == currentCallProps.to;
            return currentCallProps;
          }
          return;
        }
        return currentCallProps;
      }, function (err, committed, snapshot) {
        if (err) {
          console.error(err);
        } else {
          let updatedCallProps = snapshot ? snapshot.val() : null;
          if (updatedCallProps) {
            if (committed == true ) {
              console.log("SUCCESS: From SDP sent");
            } else if (committed == false) {
              console.log("ERROR: From SDP sending failed.");
            }
          } else {
            console.log("ERROR in Call Transaction. Call " + callKey + " does not exist.");
          }
        }
      });
    } else {
      console.log("ERROR: Cant send fromSDP. not all props available.", exchangeProps);
    }
  } else {
    console.log("sendFromSDP: exchangeProps is", exchangeProps);
  }
}
