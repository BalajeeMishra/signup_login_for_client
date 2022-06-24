const express = require("express");
const router = express.Router();
const Detail = require("../models/Detail");
const { isLoggedIn } = require("../middleware");
const AppError = require("../controlError/AppError");
const wrapAsync = require("../controlError/wrapasync");
const User = require("../models/user");
const moment = require("moment");

router.get(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    res.render("afterdetail");
  })
);
router.get(
  "/addmoreinformation",
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    if (typeof req.user !== "undefined") {
      var detail = await Detail.find({ userId: req.user._id });
    }
    if (typeof detail[0] !== "undefined") {
      // var time=moment(detail[0].birthday).utc().format('YYYY/MM/DD');
      var date = new Date(detail[0].birthday);
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, "0");
      var todayDate = String(date.getDate()).padStart(2, "0");
      var datePattern = year + "-" + month + "-" + todayDate;
      console.log(datePattern);
    }

    res.render("addmoreinformation", {
      name: req.user.name,
      detail,
      datePattern,
    });
  })
);

router.post(
  "/addmoreinformation",
  wrapAsync(async (req, res) => {
    const user = req.user._id;
    const { age, mobno, birthday, gender } = req.body;
    const information = new Detail({
      age,
      mobno,
      birthday,
      gender,
      userId: user,
    });
    await information.save();
    res.redirect("/detail");
  })
);
module.exports = router;
