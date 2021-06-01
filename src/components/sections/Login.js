import React,{useEffect,useState} from "react";
import Paper from "@material-ui/core/Paper";
import classNames from "classnames";
import { Divider, Typography } from "@material-ui/core";
import Input from '@material-ui/core/Input';
import { auth, firestore } from "../firebase/firebase";
import Button from '@material-ui/core/Button';
import { Link } from "react-router-dom";
function Login({
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
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)

  useEffect(()=>{
    auth.onAuthStateChanged((user)=>{
      if(user && auth.currentUser.emailVerified){
        alert("logged in");
        props.history.push("/dashboard")
      }
    })

  },[])

  const loginUser = () =>{
    setLoading(true);
    try{
      if(email && password){
        auth.signInWithEmailAndPassword(email,password)
          .then(res=>{
            if(res){
              alert("succesfully login");
              props.history.push("dashboard");
            }
          })
    
        setLoading(false);
      }else{
        alert("Please Enter Valid Data");
        setLoading(false);
      }
    }catch(e){
      alert(e);
      setLoading(false);
    }
  }
  return (
    <div>
      <section {...props} className={outerClasses}>
        <div className="container">
          <div className={innerClasses}>
            <Paper elevation={0} square align="center" style={{backgroundColor:"transparent"}}>
              <Typography variant="h5" color="primary" align="center">
                Login
              </Typography>
             <Divider/>
             <br/>
             <div>
              <Input
                align="center"
                className="email p-2"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value.toLowerCase())
                }
                type="email"
                placeholder="Email"
                style={{color:"white"}}
                autoFocus
                
              />
              <br/><br/><br/>
              <Input
                align="center"
                className="password p-2"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => {
                  if (e.keyCode === 13) {
                    loginUser();
                  }
                }}
                type="password"
                placeholder="Password"
                style={{color:"white"}}
              />
              
              <br/><br/><br/>
              <Button
                variant="contained"
                color="primary"
                className="btn login-btn mt-2"
                style={{
                  backgroundColor: "#7536e2",
                  color: "white",
                  borderRadius: "10px",
                  padding:"10px"
                }}
                onClick={() => loginUser()}
              >
                Login
              </Button>
              <br/>
              <br/>
              <Divider/>
              <span style={{color:"white"}}>Create an Account </span>

              <Link to="/sign">
              <Button
                variant="contained"
                color="primary"
                className="btn login-btn mt-2"
                align="center"
                style={{
                  backgroundColor: "#7536e2",
                  color: "white",
                  borderRadius: "10px",
                  padding:"10px"
                }}>
                SignUp
              </Button>
              </Link>
              </div>
            </Paper>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
