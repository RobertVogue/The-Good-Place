const { User, Passport, Stamp, Country, Tag } = require("../db/models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const updateEmail = async (id, email, newEmail) => {
  let user = await User.findOne({
    where: {
      email,
    },
  });
  if (!email) {
    user = await User.findByPk(id);
  }

  const result = await user.update({
    email: newEmail,
  });

  return result.dataValues;
};

const updatePassword = async (id, email, newPassword) => {
  let user = await User.findOne({
    where: {
      email,
    },
  });
  if (!user) {
    user = await User.findByPk(id);
  }
  const newHashedPassword = await bcrypt.hash(newPassword, 8);
  const result = await user.update({
    hashedPassword: newHashedPassword,
  });

  return result.dataValues.hashedPassword;
};

const updateusername = async (id, name, newName) => {
  let user = await User.findOne({
    where: {
      username: name,
    },
  });
  if (!user) {
    user = await User.findByPk(id);
  }

  const myUpdate = await user.update({
    username: newName,
  });

  return myUpdate.dataValues;
};

const createNewUser = async (
  username,
  displayName,
  email,
  passwordToBeHassed
) => {
  const hashedPassword = await bcrypt.hash(passwordToBeHassed, 8);

  const newUser = await User.create({
    username,
    displayName,
    email,
    hashedPassword,
  });
  if (newUser) {
    return newUser.dataValues;
  } else {
    return Error("user not created");
  }
};
const updateUserDisplayName = async (id, name, newName) => {
  let user = await User.findOne({
    where: {
      displayName: name,
    },
  });
  if (!name) {
    user = await User.findByPk(id);
  }

  const myUpdate = await user.update({
    displayName: newName,
  });

  return myUpdate.dataValues;
};

const findUserById = async (id) => {
  const user = await User.findByPk(id, {
    include: [Passport],
  });
  return user.dataValues;
};

const findStamp = async (stampId) => {
  const stamp = await Stamp.findByPk(stampId, {
    include: [Passport, Country, Tag],
  });

  return stamp.dataValues;
};

const findOwnerId = async (stampId) => {
  const stamp = await Stamp.findByPk(stampId, {
    include: [Passport],
  });

  const userId = stamp.dataValues.Passport.dataValues.user_id;
  const user = await findUserById(userId);

  return user.dataValues;
};
const getStamps = async (userId) => {
  // returns an array of visited stamps
  const user = await User.findByPk(userId, {
    include: Passport,
  });

  const [data] = user.dataValues.Passports;

  const passportId = data.dataValues.id;

  const stamps = await Stamp.findAll({
    where: {
      passport_id: passportId,
    },
  });
  const Array = stamps.map((stamp) => stamp);
  return Array;
};

const getUserPassports = async (id) => {
  const passports = await Passport.findAll({
    where: {
      user_id: id,
    },
  });
  const results = passports.map((passport) => {
    const { dataValues } = passport;
    return dataValues;
  });
  // console.log(results);
  return results;
};
const getVisitedPassports = async (id) => {
  const passports = await Passport.findAll({
    where: {
      user_id: id,
      passport_status: "Visited",
    },
  });
  const results = passports.map((passport) => {
    const { dataValues } = passport;
    return dataValues;
  });
  const [data] = results;
  // console.log(data);
  return data;
};
const getGoingToPassports = async (id) => {
  const passports = await Passport.findAll({
    where: {
      user_id: id,
      passport_status: "Want to visit",
    },
  });
  const results = passports.map((passport) => {
    const { dataValues } = passport;
    return dataValues;
  });
  const [data] = results;
  // console.log(data);
  return data;
};
const getLocalPassports = async (id) => {
  const passports = await Passport.findAll({
    where: {
      user_id: id,
      passport_status: "Near By",
    },
  });
  const results = passports.map((passport) => {
    const { dataValues } = passport;
    return dataValues;
  });
  const [data] = results;
  // console.log(data);
  return data;
};

const get100Stamps = async (userId) => {
  let user = await findUserById(userId);
  const myMap = user.Passports.map((passport) => passport.dataValues.id);
  const res = await Stamp.findAll({
    limit: 100,
  });
  const results = res.map((result) => result.dataValues);
  return results;
};

const createTag = async (name) => {
  const newTag = await Tag.create({ name });
  if (newTag) {
    return newTag.dataValues;
  } else {
    return Error("tag not created");
  }
};

const createStamp = async (
  name,
  detailed_location,
  passport_id,
  countries_id,
  tags_id,
  dates, //"12-12-12:01-02-13"
  price,
  review,
  rating
) => {
  const stamp = await Stamp.create({
    name,
    detailed_location,
    passport_id,
    countries_id,
    tags_id,
    dates,
    price,
    review,
    rating,
  });
  if (stamp) {
    return stamp.dataValues;
  } else {
    return Error("tag not created");
  }
};

const getComments = async (userId) => {
  const stamps = await getStamps(userId);
  const res = stamps.map((data) => data.dataValues.review);
  console.log(res);
  return res;
};

const getTags = async () => {
  const tags = await Tag.findAll();
  const data = tags.map((tag) => tag.dataValues);
  return data;
};

const getTopCountries = async (user_id) => {
  let arr = [];
  const passports = await getUserPassports(user_id);
  const ids = passports.map((passport) => passport.id);
  for (let i = 1; i < 196; i++) {
    let stamps = await Stamp.findAll({
      where: {
        countries_id: i,
        passport_id: ids,
      },
    });
    arr.push(stamps);
  }

  return arr;
};

module.exports = {
  get100Stamps,
  updateEmail,
  updatePassword,
  updateusername,
  createNewUser,
  updateUserDisplayName,
  findUserById,
  findStamp,
  findOwnerId,
  getStamps,
  getUserPassports,
  createTag,
  createStamp,
  getLocalPassports,
  getGoingToPassports,
  getVisitedPassports,
  getComments,
  getTags,
  getTopCountries,
};
