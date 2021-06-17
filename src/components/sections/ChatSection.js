import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { SectionSplitProps } from "../../utils/SectionProps";
import SectionHeader from "./partials/SectionHeader";
import RateReviewIcon from '@material-ui/icons/RateReview';
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import { firestore, auth, storage } from "../firebase/firebase";
import { Button } from "@material-ui/core";
import NewChatForm from "./newChatForm";
import ChatRoom from "./ChatRoom"
const propTypes = {
  ...SectionSplitProps.types,
};

const defaultProps = {
  ...SectionSplitProps.defaults,
};

const ChatSection = ({
  className,
  topOuterDivider,
  bottomOuterDivider,
  topDivider,
  bottomDivider,
  hasBgColor,
  invertColor,
  invertMobile,
  invertDesktop,
  alignTop,
  imageFill,
  history,
  chats,
  userEmail,
  allUserData,
  ...props
}) => {
  const outerClasses = classNames(
    "features-split section",
    topOuterDivider && "has-top-divider",
    bottomOuterDivider && "has-bottom-divider",
    hasBgColor && "has-bg-color",
    invertColor && "invert-color",
    className
  );

  const innerClasses = classNames(
    "features-split-inner section-inner",
    topDivider && "has-top-divider",
    bottomDivider && "has-bottom-divider"
  );

  const splitClasses = classNames(
    "split-wrap",
    invertMobile && "invert-mobile",
    invertDesktop && "invert-desktop",
    alignTop && "align-top"
  );

  const sectionHeader = {
    title: "Workflow that just works",
    paragraph:
      "Share Your Thoughts with chatting with friends and family, Collegues. Whenever Wherever Needed.",
  };
  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [showChatScreen, setShowChatScreen] = useState(false);
  const [name, setName] = useState("");
  const [index, setIndex] = useState("");
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [longPress, setLongPress] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [docid, setDocId] = useState("");
  const [delMsgIndex, setDelMsgIndex] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        history.push("/login");
      } else {
        getProfileData(user.uid);
      }
    });
  }, []);

  const getProfileData = (ID) => {
    firestore
      .collection("users")
      .where("id", "==", ID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((obj) => {
          const data = obj.data();
          setName(data.name);
        });
      });
  };

  const selectChat = async (index) => {
    if (!longPress) {
      await setIndex(index);
      await setShowChatScreen(true);
    }
  };

  const logOutUser = async () => {
    const confirm = window.confirm("Are You Sure To Logout ?");

    if (confirm) {
      await onlineStatusUpdate(userEmail);
      await auth.signOut();
      history.push("/");
    }
  };

  const onlineStatusUpdate = async (email) => {
    const id = await firestore
      .collection("users")
      .where("email", "==", email)
      .get()
      .then((snapshot) => {
        return snapshot.docs.map((ob) => ob.id)[0];
      });

    await firestore.collection("users").doc(id).update({
      isonline: false,
    });
  };

  const backButtonClick = async () => {
    await setShowChatScreen(false);
    await setShowNewChatForm(false);

    await props.searchChat("");
    history.push("/dashboard")
  };

  // const searchChat1 = async () => {
  //   await props.searchChat(searchValue.toLowerCase());
  // };
  // const buttonPressTimer
  // const touchEnd = async () => {
  //   clearTimeout(buttonPressTimer);
  //   var timer = setTimeout(async () => {
  //     await setLongPress(false);
  //   }, 400);
  // };

  // const touchStart = async (chat, index) => {
  //   const buttonPressTimer = setTimeout(async () => {
  //   await setLongPress(true);
  //   await setShowMoreOptions(true)
  //   await setDocId(chat.docid)
  //   await setDelMsgIndex(index);

  //   }, 1000);
  // };

  const moreOptions = async (type) => {
    const tempData = chats[delMsgIndex].messages;

    switch (type) {
      case "delete":
        const confirm = window.confirm("Are You Sure To Delete?");

        if (confirm) {
          await setDeleting(true);
          await setShowMoreOptions(false);
          await tempData.map(async (obj) => {
            if (obj.type === "img") {
              await storage.ref(`chats/${docid}/${obj.imgnm}`).delete();
            }
          });

          await firestore.collection("chats").doc(docid).delete();
        }

        await setDocId("");
        await setDeleting(false);
        break;

      case "cancel":
        await setShowMoreOptions(false);
        break;
    }
  };

  return (
    <section {...props} className={outerClasses}>
      {showNewChatForm === false ? (
      <div className="container">
        {showChatScreen === false ? (
        <div className={innerClasses}>
          <SectionHeader data={sectionHeader} className="center-content" />
          <div className={splitClasses}>
            <div className="split-item">
              <div
                className="split-item-content center-content-mobile reveal-from-left"
                data-reveal-container=".split-item"
              >
                <div className="text-xxs text-color-primary fw-600 tt-u mb-8">
                  Video Conferencing
                </div>
                <h3 className="mt-0 mb-12">Video Conference</h3>
              </div>
              <div
                className={classNames(
                  "split-item-image center-content-mobile reveal-from-bottom",
                  imageFill && "split-item-image-fill"
                )}
                data-reveal-container=".split-item"
              >
                    {/* <small>
                      <RateReviewIcon fontSize="smaller"></RateReviewIcon>
                    </small> */}

                <Paper elevation={3}>
                  <div className="new-chat" style={{fontSize:"10px"}}>
                    <center>
                      <Button style={{backgroundColor:"yellowgreen"}} onClick={() => setShowNewChatForm(true)}>
                      <span>Create New Chat</span>
                      </Button>
                    </center>
                  </div>
                  <AppBar position="static" color="default">
                    <Tabs
                      indicatorColor="primary"
                      textColor="primary"
                      variant="fullWidth"
                      value={value}
                      onChange={handleChange}
                      aria-label="full width tabs example"
                    >
                      <Tab label="Direct" />
                      <Tab label="Group Chat" />
                      <Tab label="Archived" />
                    </Tabs>
                  </AppBar>
                  <TabPanel value={value} index={0}>
                  
                    <List>
                    {chats.map((chat, index) => (
                      <ListItem alignItems="flex-start" onClick={()=>selectChat(index)}>
                        <ListItemAvatar>
                          <Avatar alt="Remy Sharp" />
                        </ListItemAvatar>
                       
                          <ListItemText
                            primary={allUserData.map((list) => {
                              if (
                                list.email ===
                                (chat.users[0] !== userEmail
                                  ? chat.users[0]
                                  : chat.users[1])
                              ) {
                                return list.name;
                              }
                            })}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary"
                                >
                                  {chat.messages[chat.messages.length - 1]
                                    .type === "text" ? (
                                    <span className="mr-1">
                                      {chat.messages.length > 0
                                        ? chat.messages[
                                            chat.messages.length - 1
                                          ].message.substring(0, 10)
                                        : ""}
                                    </span>
                                  ) : (
                                    <span>Image</span>
                                  )}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                       
                      </ListItem>
                     
                     ))}
                      <Divider/>
                      
                    </List>
                    
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <List>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar alt="Remy Sharp" />
                        </ListItemAvatar>
                        <ListItemText
                          primary="Brunch this weekend?"
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="textPrimary"
                              >
                                Ali Connors
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />

                      <Divider variant="inset" component="li" />
                    </List>
                  </TabPanel>
                  <TabPanel value={value} index={2}>
                    <List>
                      <Divider variant="inset" component="li" />
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar
                            alt="Travis Howard"
                            src="/static/images/avatar/2.jpg"
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary="Summer BBQ"
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="textPrimary"
                              >
                                to Scott, Alex, Jennifer
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar
                            alt="Cindy Baker"
                            src="/static/images/avatar/3.jpg"
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary="Oui Oui"
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="textPrimary"
                              >
                                Sandra Adams
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    </List>
                  </TabPanel>
                </Paper>
              </div>
            </div>
          </div>
        </div>
        ):(
        <ChatRoom
          chatData={chats[index]}
          allUserData={allUserData}
          userEmail={userEmail}
          backButtonClick={()=>backButtonClick()}
          profilePicture={
            "https://moorestown-mall.com/noimage.gif"
          }
        
        />
      
        )
        }
      </div>
      ) : (<NewChatForm
              userEmail={userEmail}
              backButtonClick={() => backButtonClick()}
              allUserData={allUserData}
              history={history}
      />)}
    </section>
  );
};

ChatSection.propTypes = propTypes;
ChatSection.defaultProps = defaultProps;

export default ChatSection;
