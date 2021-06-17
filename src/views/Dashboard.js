import React,{useEffect, useState} from 'react'
import { auth, firestore } from '../components/firebase/firebase';
import ChatSection from '../components/sections/ChatSection'
import VideoChatContainer from '../components/sections/Videocall/VideoChatContainer'
import {Link, Redirect, Route} from "react-router-dom"
// import Chat from '../components/sections/Chat';
function Dashboard(props) {
    const [email,setEmail] = useState(null);
    // const [newChatFormVisible,setChatFormVisible] = useState(false);
    const [chat,setChat] = useState([]);
    const [allUserData,setAllUserData] = useState([]);
    const [user,setUser] = useState([]);
    // const [blockList,setBlockList] = useState([]);
    const onlineStatusUpdate = async(email) =>{
        const id = await firestore
            .collection("users")
            .where("email","==",email)
            .get()
            .then((snapshot)=>{
                console.log(snapshot)
                
                return snapshot.docs.map((ob)=>
                ob.id)[0];
            });
            
            const time = setTimeout(()=>{
                try{
                    if(id != "undefined"){
                        
                        firestore.collection("users").doc(id).update({
                           isonline:true,
                        //    isverify:true, 
                        });
                    }else{
                        onlineStatusUpdate();
                    }
                }catch(e){
                    alert(e);
                    props.history.push("login");
                }
                clearTimeout(time);
            },2000)
    };
   const getAllUsersData = () =>{
    firestore.collection("users").onSnapshot((snapshot)=>{
        var dt = snapshot.docs.map(docs=> docs.data());
        setAllUserData(dt);

    })
   }

   const getInfo = async(user, emails)=>{
       await firestore
        .collection("chats")
        .where("users","array-contains",user.email)
        .onSnapshot(async (res)=>{
            const chats = res.docs.map((docs)=>docs.data());
            chats.sort((a,b)=>{
                if(a.time < b.time){
                    return 1;
                }else if(a.time > b.time){
                    return -1;
                }else{
                    return 0;
                }
            });
            var chatList = [];
            if(emails){
                chatList = await chats.filter((chats)=>{
                    console.log('error is here');
                    console.log(chats);
                    console.log(user.email);
                    console.log(chat);
                    console.log('error is here');
                    var getEmail = 
                        chats.users[0] != user.email ? chats.users[0] : chats.users[1];
                        if(emails.includes(getEmail)){
                            return chats;
                        }

                })
            }
            if(!emails){
               await setEmail(user.email);
               await setChat(chats);
            }else{
                await setEmail(user.email)
                await setChat(chatList)
            }
        })
   }


   const searchChat = (search)=>{
       const emails = fetchSearchEmail(search,email);
       getInfo(user,emails);
   } 

   const fetchSearchEmail = (search,email) =>{
       const emails = [];
       allUserData.map(list=>{
           if(list.name.indexOf(search)!== -1 && list.email !== email){
               emails.push(list.email);
           }
       })
       return emails;
   }
    useEffect(()=>{
        auth.onAuthStateChanged(user=>{
            if(!user){
                
                props.history.push("login");
            }else{
                try{
                    // console.log(user.email);
                    setUser(user);
                    setEmail(user.email)
                    getAllUsersData();
                    getInfo(user)
                    onlineStatusUpdate(user.email);
                }catch(e){
                    
                    props.history.push("login");
                }
            }
        });
    },[])

    return (
        <>
            <ChatSection
            invertMobile
            topDivider
            imageFill
            className="illustration-section-02"
            history = {props.history}
            chats={chat}
            userEmail={email}
            allUserData = {allUserData}
            searchChat={(search)=>searchChat(search)}
            />
           
            {/* <VideoChatContainer></VideoChatContainer> */}
            
        </>
    )
}

export default Dashboard