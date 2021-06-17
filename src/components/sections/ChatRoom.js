import React, { useState, useEffect } from "react";
import { firestore, f, storage } from "../firebase/firebase";
import Button from "@material-ui/core/Button";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import SendIcon from '@material-ui/icons/Send';
import VideocamIcon from '@material-ui/icons/Videocam';
import { Input } from "@material-ui/core";
import {Link} from "react-router-dom";
import VideoChatContainer from "./Videocall/VideoChatContainer";
import "./ChatRoom.css";
function ChatRoom(props) {
  const [oponentUserData, setOponentUserData] = useState([]);
  const [oponentUserEmail, setOponentUserEmail] = useState("");
  const [text, setText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  // const [oponentUserEmail, setOponentUserEmail] = useState(initialState)
  const [unsendIndex, setUnsendIndex] = useState("");
  const [currentUserDocId, setCurrentUserDocId] = useState("");
  const [isOponentTyping, setIsOponentTyping] = useState(false);
  const [showImageBeforeUpload, setShowImageBeforeUpload] = useState(false);
  const [imgFile, setImgFile] = useState("");
  const [currentSelectedImg, setCurrentSelectedImg] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgName, setImgName] = useState("");
  const [msgType, setMsgType] = useState("");
  const [progress, setProgress] = useState(0);
  // const [oldChatsLength, setOldChatsLength] = useState([])
  const [oldChats, setOldChats] = useState([]);
  const [showVideoChat,setShowVideoChat] = useState(false);
  var oponent_id = "";
  var userDocid = "";
  useEffect(() => {
    getOponentUserInfo();
    currentUserDocId1();
    try {
      getTypingData();
    } catch (e) {
      console.log(e);
    }

    snapshotOnCall();
    setOldChats(props.chatData.message);

    var time = setTimeout(async () => {
      await scrollingToEnd();
      clearTimeout(time);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      typing();
    };
  }, []);

  useEffect(() => {
    const chat = props.chatData.messages.length;

    if (chat !== oldChats) {
      isChatChanged(chat);
    }
  }, []);

  const isChatChanged = async (chat) => {
    console.log("hello");
    await scrollingToEnd();
    setOldChats(chat);
  };

  const scrollingToEnd = () => {
    try {
      const scroll = document.getElementById("scrolling");

      scroll.scrollTop = scroll.scrollHeight;
    } catch (e) {}
  };

  const snapshotOnCall = async () => {
    await firestore
      .collection("users")
      .where("email", "==", oponentUserEmail)
      .onSnapshot(async () => {
        await getOponentUserInfo();
      });
  };

  const getOponentUserInfo = async () => {
    const userData = [];

    var fetchEmail = fetchEmail1(props.userEmail);

    await props.allUserData.map((user) => {
      if (user.email === fetchEmail) {
        userData.push(user);
      }
    });
    console.log("oponent data>>",userData)
    oponent_id = userData[0].id;
    await setOponentUserData(userData[0]);
    await setOponentUserEmail(fetchEmail);
  };

  const fetchEmail1 = (userEmail) => {
    const { users } = props.chatData;

    return users[0] !== userEmail ? users[0] : users[1];
  };

  const sendMessage = async () => {
    const { docid } = props.chatData;
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      minute: "numeric",
    });

    const timestamp = Date.now();

    if (text) {
      if (true) {
        await firestore
          .collection("chats")
          .doc(docid)
          .update({
            messages: f.firestore.FieldValue.arrayUnion({
              sender: props.userEmail,
              message: text,
              time: time,
              type: "text",
            }),
            time: timestamp,
          });

        await scrollingToEnd();
      } else {
        alert("Sorry This Chat Is Blocked");
      }
    } else {
      alert("Please Enter Valid Chat");
    }

    await typing();

    await setText(text);
    // setText("");
  };
  // Here we Accessing the doc id of Oponent collection to set video call id
  const test = async() =>{
    // props.allUserData.map((res)=>{
    //   console.log(res.id);
    // })

    await firestore.collection("users").get().then((res)=>{
      (res).forEach((doc)=>{
      //  console.log("data>>>",doc.data().email)
      // console.log("oponent id>>",oponent_id)
       if(doc.data().id == oponent_id)
       {
         userDocid = doc.id;
         setShowVideoChat(true);
       }
      })
    })
  }
  //   const touchStart = (index) => {
  //      buttonPressTimer = setTimeout(async () => {
  //       setState({
  //         showMoreDialogBox: true,
  //         unsendIndex: index,
  //         msgType: "text",
  //       });
  //     }, 1000);
  //   };
// const {docid} = props.chatData
// console.log("docid>>",docid)
  const unsendMsg = async (updateChats) => {
    const { docid } = props.chatData;

    await firestore.collection("chats").doc(docid).update({
      messages: updateChats,
    });
  };

  //   touchEnd = () => {
  //     clearTimeout(buttonPressTimer);
  //   };

  const currentUserDocId1 = async () => {
    await firestore
      .collection("users")
      .where("URL", "==", props.profilePicture)
      .get()
      .then((snapshot) => {
        snapshot.forEach((ob) => {
          setCurrentUserDocId(ob.id);
        });
      });
  };
  // console.log("hey>>>>>>",currentUserDocId)
  const getTypingData = async () => {
    const { docid } = props.chatData;

    try {
      await firestore
        .collection("chats")
        .doc(docid)
        .onSnapshot(async (snapshot) => {
          if (snapshot.data()) {
            const typing = snapshot.data().typing;

            if (typing.includes(oponentUserEmail)) {
              await setIsOponentTyping(true);
            } else {
              await setIsOponentTyping(false);
            }
          }
        });
    } catch (e) {
      console.log(e);
    }
  };

  const typing = async (value) => {
    const { docid } = props.chatData;
    const { userEmail } = props;

    if (true) {
      let finalData = await getCurrentTypingData(docid);

      if (value) {
        if (!finalData.includes(userEmail)) {
          await finalData.push(userEmail);
        }
      } else {
        finalData = finalData.filter((ob) => {
          if (ob !== userEmail) {
            return ob;
          }
        });
      }

      firestore.collection("chats").doc(docid).update({
        typing: finalData,
      });
    }
  };

  const getCurrentTypingData = async (docid) => {
    const array = [];

    try {
      const dt = await firestore
        .collection("chats")
        .doc(docid)
        .get()
        .then((obj) => {
          return obj.data().typing;
        });
      return dt;
    } catch (e) {
      return [];
    }
  };

  const setImageLocally = async (e) => {
    await setShowImageBeforeUpload(true);

    const type = e.type;

    setImgFile(e);

    if (type.match(/image+/g)) {
      var oFReader = new FileReader();
      oFReader.readAsDataURL(e);

      var that = this;

      oFReader.onload = async function (oFREvent) {
        await setCurrentSelectedImg(oFREvent.target.result);
      };
    } else {
      alert("Please Upload Valid Image File");
      await setCurrentSelectedImg("");
      await setShowImageBeforeUpload(false);
    }
  };

  const sendImage = async () => {
    const { docid } = props.chatData;
    const { userEmail } = props;

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      minute: "numeric",
    });

    const timestamp = Date.now();

    try {
      if (true) {
        // await setLoading(true);
        await storage
          .ref(`chats/${docid}/${timestamp}`)
          .put(imgFile)
          .on(
            "state_changed",

            async (snapshot) => {
              const process = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );

              setProgress(process);
            },
            (e) => {
              console.log(e);
            },
            async () => {
              const URL = await storage
                .ref(`chats/${docid}/${timestamp}`)
                .getDownloadURL()
                .then((newUrl) => {
                  return newUrl;
                });

              await firestore
                .collection("chats")
                .doc(docid)
                .update({
                  messages: f.firestore.FieldValue.arrayUnion({
                    sender: userEmail,
                    type: "img",
                    imgnm: timestamp,
                    time: time,
                    URL: URL,
                  }),
                  time: timestamp,
                });

              await setLoading(false);
              await setShowImageBeforeUpload(false);

              var timeout = setTimeout(async () => {
                await scrollingToEnd();

                clearTimeout(timeout);
              }, 3000);
            }
          );
      } else {
        alert("Sorry This Chat Is Blocked");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const deleteImageFromStorage = async (imgName) => {
    const { docid } = props.chatData;

    try {
      await storage.ref(`chats/${docid}/${imgName}`).delete();
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="container-fluid">
      {showVideoChat ? (<VideoChatContainer userDocid={userDocid}></VideoChatContainer>) :
      showImageBeforeUpload === false ? (
        <div>
          {showProfile === false ? (
            <div className="card">
              <div className="card-header">
               
                  <div>
                    <button
                      className="btn btn-primary mr-2"
                      onClick={props.backButtonClick}
                    >
                      <ArrowBackIosIcon color="action" fontSize="small"></ArrowBackIosIcon>
                    </button>
                  </div>
                  {/* <div className="img_cont">
                    <img
                      src={oponentUserData.URL}
                      className="rounded-circle user_img"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowProfile(true)}
                    />
                  </div> */}
                  <div className="user_info">
                    <span>{oponentUserData.name}</span>{" "}
                    {/* <h6 className="inline">
                      ({oponentUserData.isonline ? "Online" : "Offline"})
                    </h6>
                    <h6>
                      {isOponentTyping ? (
                        <h6 className="typing-text-left">Typing...</h6>
                      ) : null}
                    </h6> */}
                
                </div>
                {/* <button onClick={test}>Video</button> */}
                <Link to={"videocall/" + userDocid} ><VideocamIcon fontSize="large"></VideocamIcon></Link>
              </div>

              <div className="card-body" id="scrolling">
                {props.chatData.messages.map((list, index) => (
                  <div key={index}>
                    {list.type === "text" ? (
                      <div>
                        {list.sender === oponentUserEmail ? (
                          <div className="d-flex justify-content-start mb-4">
                            <div className="img_cont_msg">
                              <img
                                src={oponentUserData.URL}
                                className="rounded-circle user_img_msg"
                              />
                            </div>
                            <div
                              className="Oponent_message"
                              // style={{ minWidth: "70px" ,backgroundColor:"red"}}
                            >
                              {list.message}
                              <span className="msg_time text-dark text-center">
                                {list.time}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="sender_contain"
                            //   onTouchStart={() => touchStart(index)}
                            //   onTouchEnd={() => touchEnd()}
                            //   onMouseDown={() => touchStart(index)}
                            //   onMouseUp={() => touchEnd()}
                            //   onMouseLeave={() => touchEnd()}
                          >
                            <div className="sender">
                              {list.message}
                              <span className="msg_time_send text-dark text-center">
                                {list.time}
                              </span>
                            </div>
                            <div className="img_cont_msg">
                              {/* <img
                                  src={props.profilePicture}
                                  className="rounded-circle user_img_msg"
                                /> */}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {list.sender === oponentUserEmail ? (
                          <div className="d-flex justify-content-start mb-4">
                            <div className="img_cont_msg">
                              <img
                                src={oponentUserData.URL}
                                className="rounded-circle user_img_msg"
                              />
                            </div>
                            <div
                              className="msg_cotainer text-center"
                              style={{ minWidth: "70px", width: "40%" }}
                            >
                              <img src={list.URL} className="msg_img" />
                              <span className="msg_time text-dark text-center">
                                {list.time}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="d-flex justify-content-end mb-4"
                            //   onTouchStart={() =>
                            //     touchStartImg(index, list.imgnm)
                            //   }
                            //   onTouchEnd={() => touchEndImg()}
                            //   onMouseDown={() =>
                            //     touchStartImg(index, list.imgnm)
                            //   }
                            //   onMouseUp={() => touchEndImg()}
                            //   onMouseLeave={() => touchEndImg()}
                          >
                            <div
                              className="msg_cotainer_send text-center pointer"
                              style={{ minWidth: "70px", width: "40%" }}
                            >
                              <img src={list.URL} className="msg_img" />
                              <span className="msg_time_send text-dark text-center">
                                {list.time}
                              </span>
                            </div>
                            <div className="img_cont_msg">
                              <img
                                src={props.profilePicture}
                                className="rounded-circle user_img_msg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="card-footer">
                <span className="input-group">
                  <Input
                    name=""
                    className="type_msg"
                    placeholder="Type your message..."
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      typing(e.target.value);
                    }}
                  ></Input>

                  {/* <div>
                      <img
                        alt="accept image"
                        onClick={() =>
                          document.getElementById("share_img").click()
                        }
                        className="mt-2 galary-img"
                      />
                      <input
                        type="file"
                        id="share_img"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          setImageLocally(e.target.files[0])
                        }
                        accept="image/"
                      />
                    </div> */}
                  <div className="input-group-append">
                    <Button className="send_btn" onClick={() => sendMessage()}>
                    <SendIcon></SendIcon>
                    </Button>
                  </div>
                </span>
              </div>
            </div>
          ) : (
            <div className="oponent-profile p-5 shadow center">
              <div className="chat-img-profile-div">
                <img src={oponentUserData.URL} className="chat-img-profile" />
              </div>

              <div
                style={{
                  backgroundColor: "#6b34c9",
                  color: "white",
                  borderRadius: "20px",
                }}
                className="p-2 mt-2 container"
              >
                <div className="chat-name-profile">
                  <h3>Name: {oponentUserData.name}</h3>
                </div>

                <div>
                  <h4>Email: {oponentUserData.email}</h4>
                </div>

                <div className="chat-description-profile">
                  <h5>Description: {oponentUserData.description}</h5>
                </div>
              </div>

              <div className="p-3">
                {/* <button
                    className="btn-lg btn-danger"
                    onClick={() => blockUser()}
                  >
                    Block
                  </button> */}

                <br></br>

                <button
                  className="btn btn-primary mt-3"
                  onClick={() => setShowProfile(false)}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* {state.showMoreDialogBox ? (
              <MoreDialog moreOptions={(type) => moreOptions(type)} />
            ) : null} */}
        </div>
      ) : (
        <div className="container center">
          <img src={currentSelectedImg} className="image-upload-output" />

          {loading ? (
            <div className="mt-2">
              <button
                className="btn btn-primary mr-3"
                onClick={() => {
                  setShowImageBeforeUpload(false);
                  setImgFile("");
                  setCurrentSelectedImg("");

                  scrollingToEnd();
                }}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={() => sendImage()}>
                Send
              </button>
            </div>
          ) : null}
        </div>
      )}

      {loading === true ? (
        <div className="p-3  center">
          <center>
            <div className="shadow p-3" style={{ backgroundColor: "#E7E7E7" }}>
              {/* <Loading type="bars" color="black" height={100} width={100} /> */}
              <h5>{progress}%</h5>
              <h3>Sending...</h3>
            </div>
          </center>
        </div>
      ) : null}
    </div>
  );
}

export default ChatRoom;
