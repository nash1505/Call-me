import React, { useEffect, useState } from "react";
import firebase from "firebase/app";
import "./style.css";
import "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { Grid, Input } from "@material-ui/core";
import Button from "../../elements/Button";
// import Input from "../../elements/Input";
function VideoChatContainer() {
  const localVideo = React.createRef();
  const remotVideo = React.createRef();
  const callInput = React.createRef();
  // const [callInput,setCallInput] = useState('');
  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  const pc = new RTCPeerConnection(servers);
  let localStream = null;
  let remoteStream = null;

  useEffect(() => {
    // if (!firebase.apps.length) {
    //   firebase.initializeApp(firebaseConfig);
    // }
    const beta = (async () => {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      remoteStream = new MediaStream();
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };
      if (localVideo.current) {
        localVideo.current.srcObject = localStream;
      }
      if (remotVideo.current) {
        remotVideo.current.srcObject = remoteStream;
      }
    })();

    // createOffer()
  }, [localVideo, localStream, remoteStream, remotVideo]);

  const createOffer = async () => {
    const callDoc = firestore.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    callInput.current.value = callDoc.id;

    // Get candidates for caller, save to db
    pc.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  const answerCall = async () => {
    const callId = callInput.current.value;
    // console.log(callId)
    const callDoc = firestore.collection("calls").doc(callId);
    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = await (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.set({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log("here>>>>", change);
        if (change.type === "added") {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  const hangUp = async () => {
    const tracks = localVideo.current.srcObject.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    if (pc) {
      pc.close();
    }

    // document.querySelector('#localVideo').srcObject = null;
    // document.querySelector('#remoteVideo').srcObject = null;
    // document.querySelector('#cameraBtn').disabled = false;
    // document.querySelector('#joinBtn').disabled = true;
    // document.querySelector('#createBtn').disabled = true;
    // document.querySelector('#hangupBtn').disabled = true;
    // document.querySelector('#currentRoom').innerText = '';

    // Delete room on hangup
    const callId = callInput.current.value;
    if (callId) {
      const db = firebase.firestore();
      const roomRef = db.collection("chats").doc(callId);
      const calleeCandidates = await roomRef
        .collection("answerCandidates")
        .get();
      calleeCandidates.forEach(async (candidate) => {
        await candidate.delete();
      });
      const callerCandidates = await roomRef
        .collection("offerCandidates")
        .get();
      callerCandidates.forEach(async (candidate) => {
        await candidate.delete();
      });
      await roomRef.delete();
    }

    document.location.reload(true);
  };

  return (
    <>
      <div className="videos">
        {/* <span>

        </span>
        <span>
        </span>
        <button id="callButton" onClick={createOffer}>
          Create Call (offer)
        </button>
        <input id="callInput" ref={callInput} />
        <button id="answerButton" onClick={answerCall}>
          Answer
        </button>
        <button id="hangupButton" onClick={hangUp}>
          Hangup
        </button> */}

        {/* <div>
          </div>
          <div>
          </div>

         */}

        <Grid container spacing={0}>
          <Grid item xs={6}>
            <video
              id="webcamVideo"
              ref={remotVideo}
              autoPlay
              playsInline
            ></video>
          </Grid>
          <Grid item xs={6}>
            <video
              id="webcamVideo"
              ref={localVideo}
              autoPlay
              playsInline
            ></video>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={3}></Grid>
          <Grid item container xs={6}>
            <Grid item xs={3}>
              <Button id="callButton" onClick={createOffer}>
                Create Call (offer)
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button id="answerButton" onClick={answerCall}>
                Answer
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button id="hangupButton" onClick={hangUp}>
                Hangup
              </Button>
            </Grid>
            <Grid item xs={3}>
              <input id="callInput" ref={callInput} />
            </Grid>
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
      </div>
    </>
  );
}

export default VideoChatContainer;
