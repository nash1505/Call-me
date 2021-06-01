import React,{useEffect,useState} from 'react';
import classNames from 'classnames';
import { SectionProps } from '../../utils/SectionProps';
import ButtonGroup from '../elements/ButtonGroup';
import Button from '../elements/Button';
import Image from '../elements/Image';
import {auth,firestore} from "../firebase/firebase";
import { Redirect,Link } from 'react-router-dom';

const propTypes = {
  ...SectionProps.types
}

const defaultProps = {
  ...SectionProps.defaults
}

const Hero = ({
  className,
  topOuterDivider,
  bottomOuterDivider,
  topDivider,
  bottomDivider,
  hasBgColor,
  invertColor,
  ...props
}) => {

  useEffect(()=>{
    auth.onAuthStateChanged((user)=>{
      if(user){
        
       setIsLogged(true);
       setUserName(user);
      }
    })

  },[])
  const [userName,setUserName] = useState("")
  const [isLogged,setIsLogged] = useState(false);
  

    
  const outerClasses = classNames(
    'hero section center-content',
    topOuterDivider && 'has-top-divider',
    bottomOuterDivider && 'has-bottom-divider',
    hasBgColor && 'has-bg-color',
    invertColor && 'invert-color',
    className
  );

  const innerClasses = classNames(
    'hero-inner section-inner',
    topDivider && 'has-top-divider',
    bottomDivider && 'has-bottom-divider'
  );

  return (
    <section
      {...props}
      className={outerClasses}
    >
      <div className="container-sm">
        <div className={innerClasses}>
          <div className="hero-content">
            <h1 className="mt-0 mb-16 reveal-from-bottom" data-reveal-delay="200">
              Video Calling for <span className="text-color-primary">Everyone</span>
            </h1>
            <div className="container-xs">
              <p className="m-0 mb-32 reveal-from-bottom" data-reveal-delay="400">
                  Video Calling Application With Chat Feature makes your Work From Home Easy.
                </p>
              <div className="reveal-from-bottom" data-reveal-delay="600">
                <ButtonGroup>
                  <Link to={isLogged ? "/dashboard":"/login"}>
                    <Button tag="a" color="primary" wideMobile>
                      {isLogged ? "Go to Dashboard" : "Get Started"}
                      </Button>
                  </Link>
                  <Button tag="a" color="dark" wideMobile >
                    About
                    </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
          <div className="hero-figure reveal-from-bottom illustration-element-01" data-reveal-value="20px" data-reveal-delay="800">
            
              <Image
                className="has-shadow"
                src={require('./../../assets/images/card_1.jpg')}
                alt="Hero"
                width={896}
                height={504} />
           
          </div>
          
        </div>
      </div>
    </section>
  );
}

Hero.propTypes = propTypes;
Hero.defaultProps = defaultProps;

export default Hero;