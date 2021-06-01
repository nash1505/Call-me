import React,{useState,useEffect} from 'react'
import {firestore} from "../firebase/firebase"
function NewChatForm(props) {
    const [email,setEmail] = useState("")
    const [msg,setMsg] = useState("")
    const [loading,setLoading] = useState(false)
    const [username,setUsername] = useState("")
    const [allUserData,setAllUserData] = useState(props.allUserData)
    const [showSearchList,setShowSearchList] = useState(false)
    const [list,setList] = useState([])

    useEffect(()=>{
        try{
            getAllUsersData();
        }catch(e){
            getAllUsersData();
        }
    },[]);

    const getAllUsersData = () =>{
        if(props.allUserData===0){
            props.history.push("/dashboard");
        }
    }

    const goToChat = () =>{
        props.backButtonClick();
    }
    
  const userExists1 = async () => {
    const userSnapshot = await firestore.collection("users").get();

    try {
      const exists = userSnapshot.docs
        .map((docs) => docs.data().email)
        .includes(email);
      return exists;
    } catch (e) {
      console.log(e);
      alert("Sorry Something Want Wrong");
      setLoading(false);
    }

    return false;
  };


    const submitNewChat = ()=>{
        setLoading(true);
        const userExists = userExists1();

        if(email && msg && email !== props.userEmail && username){
            if(userExists){
                const chatExists = chatExists1();
                try{
                    chatExists ? goToChat() : createChat(props.userEmail,email,msg);

                }catch(e){
                    console.log(e);
                }
            }else{
                alert("User Is Not Exists Please Check It");
                setLoading(false);
            }
        }else{
            alert("Please Enter Valid Data");
            setLoading(false);
        }
    }

    const createChat = (userEmail,email,msg) =>{
        const docId = buildId();
        const timeStamp = Date.now();
        const time = new Date().toLocaleTimeString("en-US",{
            hour:"numeric",
            hour12:true,
            minute:"numeric",
        });

        firestore
            .collection("chats")
            .doc(docId)
            .set({
                docid:docId,
                time:timeStamp,
                users:[userEmail,email],
                typing:[],
                messages:[
                    {
                        message:msg,
                        sender:userEmail,
                        time:time,
                        type:"text",
                    },
                ],
            });

            setLoading(false);
            props.backButtonClick();
    }

    const buildId = () =>{
        return [email,props.userEmail].sort().join(":");
    }

    const chatExists1 = () =>{
        const docid = buildId();
        const chat = firestore.collection("chats").doc(docid).get();
        return chat.exists;
    }

   const showList = async () => {
        
    
        const dataList = [];
    
        if (username.length > 0) {
          allUserData.map((data) => {
            if (data.name.indexOf(username) !== -1 && data.email !== props.userEmail) {
              dataList.push(data);
            }
          });
          
          await setList(dataList);
        } else {
          await setList([]);
        }
    
        if (list.length === 0) {
          await setShowSearchList(false)
          await setEmail("");
        } else {
          await setShowSearchList(true);
        }
      };


    return (
        <div
        className="center container-fluid p-5"
        style={{
          backgroundColor: "white",
          width: "90vw",
          borderRadius: "20px",
        }}
      >
        {loading === false ? (
          <div className="row">
            {/* <div className="col-lg-6 col-sm-12 col-xs-12">
              <img src={NewMsg} style={{ width: "100%" }} />
            </div> */}
            <div className="col-lg-6 col-sm-12 col-xs-12 flex2">
              <h3>Lets Create New Chat</h3>

              <div>
                <input
                  type="text"
                  placeholder="Enter Your Friend Username"
                  value={username}
                  className="email mt-3"
                  style={{ padding: "5px" }}
                  onChange={async (e) => {
                    await setUsername(e.target.value.toLowerCase())
                    await showList();
                  }}
                />
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Enter Message"
                  value={msg}
                  className="email"
                  style={{ padding: "5px" }}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyUp={(e) =>
                    e.keyCode === 13 ? submitNewChat() : null
                  }
                />
              </div>

              <div className="mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => props.backButtonClick()}
                >
                  Back
                </button>

                <button
                  className="btn text-light ml-3"
                  style={{ backgroundColor: "#6b38d1" }}
                  onClick={() => submitNewChat()}
                >
                  Create
                </button>
              </div>
            </div>

            <div className="col-lg-6 col-sm-12 col-xs-12 flex2 mt-2">
              {showSearchList ? (
                <div className="new-chat-list">
                  {list.map((data, index) => (
                    <div
                      className=" text-light p-2 mt-2 pointer"
                      style={{
                        backgroundColor: "#6b34c9",
                        borderRadius: "20px",
                      }}
                      key={index}
                      onClick={async () => {
                        // await this.setState({
                        //   email: data.email,
                        //   username: data.name,
                        //   blockList: data.blocklist,
                        // });
                        await setEmail(data.email)
                        await setUsername(data.name)
                        await showList();
                      }}
                    >
                      <div className="chat-list">
                        {/* <img
                          className="chat-list-img mr-3"
                          src={data.URL}
                          style={{ border: "1px solid white" }}
                        /> */}

                        <div>
                          <h4 style={{ textAlign: "left" }}>{data.name}</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No Result</div>
              )}
            </div>
          </div>
        ) : (
          <center>
            {/* <Loading type="bars" color="black" height={100} width={100} /> */}
            <h3>Submiting...</h3>
          </center>
        )}
      </div>
    )
}

export default NewChatForm
