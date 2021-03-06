import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link, useHistory } from 'react-router-dom';
import Logo from './partials/Logo';
import {auth,firestore} from "../firebase/firebase"
import Button from '../elements/Button';
const propTypes = {
  navPosition: PropTypes.string,
  hideNav: PropTypes.bool,
  hideSignin: PropTypes.bool,
  bottomOuterDivider: PropTypes.bool,
  bottomDivider: PropTypes.bool
}

const defaultProps = {
  navPosition: '',
  hideNav: false,
  hideSignin: false,
  bottomOuterDivider: false,
  bottomDivider: false
}

const Header = ({
  className,
  navPosition,
  hideNav,
  hideSignin,
  bottomOuterDivider,
  bottomDivider,
  ...props
}) => {

  const [isActive, setIsactive] = useState(false);
  const [userName,setUserName] = useState("")
  const [isLogged,setIsLogged] = useState(false);
  const nav = useRef(null);
  const hamburger = useRef(null);
  const history = useHistory();
  useEffect(() => {
    isActive && openMenu();
    document.addEventListener('keydown', keyPress);
    document.addEventListener('click', clickOutside);
    return () => {
      document.removeEventListener('keydown', keyPress);
      document.removeEventListener('click', clickOutside);
      closeMenu();
    };
  },[]);  


  useEffect(()=>{
    auth.onAuthStateChanged((user)=>{
      if(user){
        
       setIsLogged(true);
       setUserName(user);
      }
    })

  },[])

  const logOutUser = async () => {
    if(!isLogged)
    {
      history.push("login")
      return true;
    }else{
    const confirm = window.confirm("Are You Sure To Logout ?");
  if (confirm) {
    await onlineStatusUpdate(userName.email);
    await auth.signOut();
    window.location.reload();
  }
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

  const openMenu = () => {
    document.body.classList.add('off-nav-is-active');
    nav.current.style.maxHeight = nav.current.scrollHeight + 'px';
    setIsactive(true);
  }

  const closeMenu = () => {
    document.body.classList.remove('off-nav-is-active');
    nav.current && (nav.current.style.maxHeight = null);
    setIsactive(false);
  }

  const keyPress = (e) => {
    isActive && e.keyCode === 27 && closeMenu();
  }

  const clickOutside = (e) => {
    if (!nav.current) return
    if (!isActive || nav.current.contains(e.target) || e.target === hamburger.current) return;
    closeMenu();
  }  

  const classes = classNames(
    'site-header',
    bottomOuterDivider && 'has-bottom-divider',
    className
  );

  return (
    <header
      {...props}
      className={classes}
    >
      <div className="container">
        <div className={
          classNames(
            'site-header-inner',
            bottomDivider && 'has-bottom-divider'
          )}>
          <Link to="/">
            <Logo/>
          </Link>
          {!hideNav &&
            <>
              <button
                ref={hamburger}
                className="header-nav-toggle"
                onClick={isActive ? closeMenu : openMenu}
              >
                <span className="screen-reader">Menu</span>
                <span className="hamburger">
                  <span className="hamburger-inner"></span>
                </span>
              </button>
              <nav
                ref={nav}
                className={
                  classNames(
                    'header-nav',
                    isActive && 'is-active'
                  )}>
                <div className="header-nav-inner">
                  <ul className={
                    classNames(
                      'list-reset text-xs',
                      navPosition && `header-nav-${navPosition}`
                    )}>
                    <li>
                      <Link to="#0" onClick={closeMenu}>About</Link>
                    </li>
                  </ul>
                  {!hideSignin &&
                    <ul
                      className="list-reset header-nav-right"
                    >
                      <li>
                      <Button className="button button-primary button-wide-mobile button-sm" onClick={logOutUser}>{isLogged ? "Logout" : "Login" }</Button>
                      <Link to="/sign" className="button button-primary button-wide-mobile button-sm" onClick={closeMenu}>{isLogged ? "Signup" : "Sign up" }</Link>
                      </li>
                    </ul>}
                </div>
              </nav>
            </>}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
