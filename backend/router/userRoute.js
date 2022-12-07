const express = require("express");
const router = express.Router();
const db = require("../server");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({path : path.resolve(__dirname, './config.env')});
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
var CryptoJS = require("crypto-js");
var origin = null;
const accessKeyId = process.env.ACCESSKEYID;
const secretAccessKey = process.env.SECRETACCESSKEY;
const region = process.env.REGION;
let sender_mail = process.env.sender_mail;

// ================= login and Signup ==================

//first signup form
router.post("/userSignUp", async (req, res) => {
  origin = req.headers.origin;

  var userInfo = CryptoJS.AES.decrypt(
    req.body.encryptData,
    "noOneCanFindthis token"
  ).toString(CryptoJS.enc.Utf8);
  var afterParse = JSON.parse(userInfo);

  var hashedpws1 = await bcrypt.hash(afterParse.password, 12);
  var hashedpws2 = await bcrypt.hash(afterParse.reenter, 12);
  var token = jwt.sign({ user: afterParse.email }, "shhhhh");

  const ses = new AWS.SES({
    accessKeyId,
    secretAccessKey,
    region,
  });

  var senderMail = sender_mail;
  let params = {
    Destination: {
      /* required */
      ToAddresses: [afterParse.email],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: `<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account. </div>
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <!-- LOGO -->
              <tr>
                  <td bgcolor="#FFA73B" align="center">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                          <tr>
                              <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr>
                  <td bgcolor="#FFA73B" align="center" style="padding: 0px 10px 0px 10px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                          <tr>
                              <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                                  <h1 style="font-size: 48px; font-weight: 400; margin: 2;">Welcome!</h1> <img src=" https://img.icons8.com/clouds/100/000000/handshake.png" width="125" height="120" style="display: block; border: 0px;" />
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr>
                  <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                          <tr>
                              <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                  <p style="margin: 0;">We're excited to have you get started. First, you need to confirm your account. Just click the link below.</p>
                                  <p style="text-align=center;"> this link only valid for 15 minutes </p>
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#ffffff" align="left">
                                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tr>
                                          <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                              <table border="0" cellspacing="0" cellpadding="0">
                                                  <tr>
                                                      <td align="center" style="border-radius: 3px;" bgcolor="#FFA73B"><a href="${origin}/user/verify/${token}" class="link-info" style="font-size: 10px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; color: #ffffff;  padding: 15px 25px; border-radius: 2px; border: 1px solid #FFA73B; display: inline-block;">
                                                      ${token}</a></td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr> <!-- COPY -->
                      </table>
                  </td>
              </tr>
          </table>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "OTP email verification",
      },
    },
    Source: senderMail,
    /* required */
    ReplyToAddresses: [senderMail],
  };

  var obj = {
    date: new Date(),
    username: afterParse.username,
    email: afterParse.email,
    password: hashedpws1,
    confirm_password: hashedpws2,
    admin: false,
  };

  // this sends the email
  ses.sendEmail(params, (err, data) => {
    if (err) {
      res.json({ message: "true" });
    } else {
      db.get()
        .collection("client-otp")
        .createIndex({ createdAt: 1 }, { expireAfterSeconds: 840 });
      db.get()
        .collection("client-otp")
        .insertOne({ createdAt: new Date(), user_ref: afterParse.email });
      res.status(200).json({ message: "check email" });
    }
  });
  router.get("/verify/:token", (req, res) => {

    var user_detail = jwt.verify(req.params.token, "shhhhh");
    db.get()
      .collection("client-otp")
      .find({ user_ref: user_detail.user })
      .toArray((err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          db.get().collection("User-SignUp").insertOne(obj);
          db.get()
            .collection("client-otp")
            .deleteOne({ user_ref: result[0].user_ref });
          res.redirect(`${origin}/login`);
        } else {
          res.redirect(`${origin}/403Error`);
        }
      });
  });
});

//second login form

router.post("/checkSignUp", (req, res) => {
  var email = req.body.email;
  db.get()
    .collection("User-SignUp")
    .find({ email: email })
    .toArray((err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.status(200).json({ result: "true" });
      } else {
        res.status(200).json({ result: "false" });
      }
    });
});
router.post("/userLogin", (req, res) => {
  var userInfo = CryptoJS.AES.decrypt(
    req.body.encryptData,
    "noOneCanFindthis token"
  ).toString(CryptoJS.enc.Utf8);
  var afterParse = JSON.parse(userInfo);
  var email = afterParse.email;
  var password = afterParse.password;
  db.get()
    .collection("User-SignUp")
    .find({ email: email })
    .toArray(async (err, result) => {
      if (err) throw err;

      if (result.length > 0) {
        let checkPWD = await bcrypt.compare(password, result[0].password);
        if (checkPWD) {
          if (result[0].admin == true) {
            res.json({ admin: true });
          } else {
            res.json({ admin: false });
          }
        } else {
          res.json({ message: "!password" });
        }
      } else {
        res.json({ email: "error" });
      }
    });
});

//==========================
router.post("/ipAddress", async (req, res) => {
  const query = await req.body.ip;
  if (query != null || query != undefined) {
    db.get()
      .collection("IP-Address")
      .createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
    db.get()
      .collection("IP-Address")
      .find({ ip: query })
      .toArray((err, result) => {
        if (err) throw err;
        if (result.length == 0) {
          var expireTime = new Date();
          expireTime.setHours(23);
          expireTime.setMinutes(59);
          expireTime.setSeconds(0);
          db.get()
            .collection("IP-Address")
            .insertOne({
              expireAt: new Date(expireTime),
              ip: query,
              time: new Date(),
            });
          res.status(200).json({ message: "added to db" });
        } else {
          res.status(200).json({ message: "already there" });
        }
      });
  }
});
router.post("/sendCookie", async (req, res) => {
  var uniqueId = await bcrypt.hash(req.body.email, 12);

  db.get().collection("Session").insertOne({
    enter_time: new Date(),
    session_id: uniqueId,
    admin: req.body.admin,
  });
  res.status(201).send(uniqueId);
});
router.post("/checkIP", async (req, res) => {
  db.get()
    .collection("IP-Address")
    .find({ ip: req.body.ip })
    .toArray((err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
});

router.post("/checkSession/", (req, res) => {
  db.get()
    .collection("Session")
    .find({ session_id: req.body.token })
    .toArray((err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
});

router.post("/deleteSession", (req, res) => {
  db.get().collection("Session").deleteOne({ session_id: req.body.cookie });
  res.status(200).json({ message: "success" });
});

router.post("/forgetPass", (req, res) => {
  origin = req.headers.origin;
  db.get()
    .collection("User-SignUp")
    .find({ email: req.body.email })
    .toArray((err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        var token = jwt.sign({ user: req.body.email }, "shhhhh");
        const ses = new AWS.SES({
          accessKeyId,
          secretAccessKey,
          region,
        });
        var senderMail = sender_mail;

        let params = {
          Destination: {
            /* required */
            ToAddresses: [req.body.email],
          },
          Message: {
            /* required */
            Body: {
              /* required */
              Html: {
                Charset: "UTF-8",
                Data: `<div class="card text-center">
                <div class="card-header">
                  Hello User!
                </div>
                <div class="card-body">
                  <h5 class="card-title">Request Received!</h5>
                  <p class="card-text mb-5">if you want to reset your password, click the link below.</p>
                  <a class="link-info mt-5" href="${origin}/user/updateUser/${token}">${token}</a>
                </div>
                <div class="card-footer text-muted">
                  Thankyou
                </div>
              </div>`,
              },
            },
            Subject: {
              Charset: "UTF-8",
              Data: "email verification to reset password",
            },
          },
          Source: senderMail,
          /* required */
          ReplyToAddresses: [senderMail],
        };

        /* var obj = {
          date: new Date(),
          username: req.body.username,
          email: req.body.email,
          password: hashedpws1,
          confirm_password: hashedpws2,
          admin: false,
        }; */

        // this sends the email
        ses.sendEmail(params, (err, data) => {
          if (err) {
            res.json({ message: "true" });
          } else {
            db.get()
              .collection("client-otp")
              .createIndex({ createdAt: 1 }, { expireAfterSeconds: 840 });
            db.get()
              .collection("client-otp")
              .insertOne({ createdAt: new Date(), user_ref: req.body.email });
          }
        });
        res.json({ message: "true" });
      } else {
        res.status(200).json({ message: "false" });
      }
    });
});


router.get("/updateUser/:token", (req, res) => {
  var user_detail = jwt.verify(req.params.token, "shhhhh");

  db.get()
    .collection("client-otp")
    .find({ user_ref: user_detail.user })
    .toArray((err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        db.get()
          .collection("client-otp")
          .deleteOne({ user_ref: result[0].user_ref });
        res.redirect(`${origin}/passwordReset?email=${user_detail.user}`);
      } else {
        res.redirect(`${origin}/403Error`);
      }
    });
});

router.post("/updatePassword", async (req, res) => {
  var pwd1 = await bcrypt.hash(req.body.pwd1, 12);
  var pwd2 = await bcrypt.hash(req.body.pwd2, 12);
  db.get()
    .collection("User-SignUp")
    .updateOne(
      {
        email: req.body.email,
      },
      {
        $set: {
          password: pwd1,
          confirm_password: pwd2,
        },
      }
    );
  res.json({ message: "true" });
});
module.exports = router;
