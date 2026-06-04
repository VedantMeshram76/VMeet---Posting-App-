const express = require("express");
const router = express.Router();

router.get("/about",(req,res)=>{
   return  res.render("about.ejs", {
    user: req.session.user
  });
})

module.exports = router;