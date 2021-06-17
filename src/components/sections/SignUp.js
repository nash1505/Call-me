import React,{useState,useEffect} from "react";
import Paper from "@material-ui/core/Paper";
import classNames from "classnames";
import { Typography } from "@material-ui/core";
import { auth, firestore } from '../firebase/firebase'
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import "./Signup.css";

function SignUp({
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
  ...props
}) {
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
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user && auth.currentUser.emailVerified) {
        alert("logged in");
        props.history.push("/dashboard");
      }
    });
  }, []);

  const createUser = () => {
    try {
      if (name && email && password) {
        
          auth
            .createUserWithEmailAndPassword(email, password)
            .then((result) => {
              firestore.collection("users").add({
                name,
                id: result.user.uid,
                email,
                password,
                URL: "",
                description: "",
                imgname: "",
                isonline: false,
                blocklist: [],
                isverify: false,
              });
            })
            .catch((e) => {
              alert(e);
            });
          // auth.currentUser.sendEmailVerification();
          alert("User Created Successfully Check Email For Verification");
          auth.signOut();
          props.history.push("login");
        
      } else {
        alert("Please Enter Valid Data");
      }
    } catch (e) {
      alert(e);
    }
  };
  return (
    <div>
      <section {...props} className={outerClasses}>
        <div className="container">
          <div className={innerClasses}>
            <Paper elevation={0} square align="center" style={{backgroundColor:"transparent"}}>
              <div className="form-component">
                <Typography variant="h5" color="primary" align="center">
                  SignUp
                </Typography>
              </div>
              {/* <Divider /> */}
              
              <div className="form-component">
                <Input
                  className="email p-2"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value.toLowerCase());
                  }}
                  placeholder="Name"
                />
              </div>
              {/* <Divider /> */}
              <div className="form-component">
                <Input
                  className="email p-2"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value.toLowerCase());
                  }}
                  placeholder="Email"
                />
              </div>

              {/* <Divider /> */}
              <div className="form-component">
                <Input
                  className="password p-2"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  placeholder="Password"
                />
              </div>
              {/* <Divider /> */}
              <div className="form-component">
                <Button
                  className="btn login-btn mt-2"
                  style={{
                    backgroundColor: "#7536e2",
                    color: "white",
                    borderRadius: "50px",
                  }}
                  onClick={() =>createUser()}
                >
                  Signup
                </Button>
              </div>
            </Paper>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SignUp;
