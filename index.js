require("dotenv").config();
const express=require("express");
const app=express();
const fs = require('fs');
const {google} = require('googleapis');


app.set('view engine','ejs')

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const TOKEN_PATH = 'token.json';
	
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SEC,
 "http://localhost:3000/auth/google/mail",
);


app.get('/',(req,res)=>{
  res.render('index');
})

//redirects user to google login page
app.get('/login',(req,res)=>{
  	
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  res.redirect(url);
})


app.get('/auth/google/mail', (req, res) => {

 const code=req.query.code;
 chcekToken(oAuth2Client,code);
 
res.redirect('/mail')
});


app.get('/mail', (req,res)=>{

  //get the message object
  var gmailMessage = google.gmail('v1');
  gmailMessage.users.messages.list({
  auth: oAuth2Client,
  userId: 'me',
  maxResults: 1,
  q:""
}, function(err, response) {

    const messageID=response.data.messages;
    const gmailMail = google.gmail('v1');
    //get the message id to get the snippet
    gmailMail.users.messages.get({
    auth: oAuth2Client,
    userId: 'me',
    id:messageID[0].id
  }, function(err, response) {
    
    res.render('mail',{mail: response.data.snippet});
      
  });
  });

})
//functions========================================================
function chcekToken(oAuth,code){
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {getToken(oAuth, code);} 
    else{
       oAuth.setCredentials(JSON.parse(token));
    }
   
    
  });
}

function getToken(oAuth,code){
  oAuth.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    oAuth.setCredentials(token);
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
  });

}



//=================================================================

app.listen(3000,(err)=>{
  if(err){
    console.log(err);
  }
  else{
    console.log("server running");
  }
})