const User = require("../userModel");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer= require('nodemailer');
 const randomstring = require('randomstring');


 const config = require("../../config/config");


const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch(error) {
    console.log(error.message);
  }
}
 
const sendVerifyMail = async (name, email, OTP, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword
      }
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: 'Email Verification',
      html: `<p>Hi ${name}, your OTP for email verification is ${OTP}. Please click here to <a href="http://localhost:4000/verify?_id=${user_id}">verify</a> your email.</p>`
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if(error) {
        console.log(error);
      } else {
        console.log("Email has been sent: ", info.response);
      }
    });
  } catch(error) {
    console.log(error.message);
  }
}

const generateOTP = () => {
  const OTP = crypto.randomInt(10000000, 99999999);
  return OTP.toString();
};


//for reset password send email

const sendRestPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword
      }
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: 'For Reset Password',
      html: `<p>Hi ${name},Please click here to <a href="http://localhost:4000/forget-password?token=${token}">Reset </a> your password.</p>`
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if(error) {
        console.log(error);
      } else {
        console.log("Email has been sent: ", info.response);
      }
    });
  } catch(error) {
    console.log(error.message);
  }
}



const loadRegister = async (req, res) => {
  try {
    res.render('registration');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      image: req.file.filename,
      password: spassword,
      is_admin: 0,
      otp: generateOTP(),
    });

    console.log(user.otp);

    const userData = await user.save();

    if(userData) {
      sendVerifyMail(req.body.name, req.body.email, user.otp, userData._id);
      res.render('registration', { message: "Your registration has been successful. Please verify your email." });
    } else {
      res.render('registration', { message: "Your registration has failed." });
    }
  } catch(error) {
    console.log(error.message);
  }
};

const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne({_id: req.query._id}, {$set: {is_varified: 1}});
    console.log(updateInfo);
    res.render("email-verified");
  } catch(error) {
    console.log(error.message);
  }
};




const verifyOTP = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email, otp: req.body.otp });
    if (user) {
      user.is_verified = true;
      user.otp = null;
      await user.save();
      res.render('verify', { message: 'Your email has been verified successfully' });
    } else {
      res.render('verify', { message: 'Invalid OTP. Please try again.' });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loginLoad = async (req, res) => {
  try {
    res.render('login');
  } catch (error) {
    console.log(error.message);
  }
};

// verify login
const verifyLogin = async(req,res)=>{
  try{
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if(userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if(passwordMatch) {
        if(userData.is_varified === 0) {
          res.render('login', { message: "Please verify your email." });
        } else {
          req.session.user_id = userData._id;
          res.redirect('/home');
        }
      } else {
        res.render('login', { message: "Email and password combination is incorrect." });
      }
    } else {
      res.render('login', { message: "Email and password combination is incorrect." });
    }
  } catch(error){
    console.log(error.message);
    res.render('login', { message: "An error occurred. Please try again later." });
  }
};


const loadHome = async(req,res)=>{
try{

  res.render('home');

}catch(error){

  console.log(error.message);

}
}


const userLogout = async(req,res)=>{

  try{
    req.session.destroy();
    res.redirect('/');
  }
  catch(error){
    console.log(error.message);
  }

}



const userForget =async(req,res)=>{
  try{
    res.render('forget');
  } catch(error){
    console.log(error.message);
  }
}

const forgetverify = async(req,res)=>{

try{
const email = req.body.email;
const userData= await user.findOne({email:email});
if(userData){

  if(userData.is_varified===0){
    res.render('forget',{message:"please verify your mail."});
  }
  else{
    const randomString = randomstring.generate();
   const updatedData= await User.updateOne({email:email},{$set:{token:randomString}});
   sendRestPasswordMail(userData.name,userData.email,randomString);
   res.render('forget',{message:"please check your mail to reset your password"});
  }


}else{
  res.render('forget',{message:"user email is incorrect."});
}


}catch(error){
  console.log(error.message);
}

}


module.exports = {
  loadRegister,
  insertUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  verifyOTP,
  userLogout,
  userForget,
 forgetverify 

};