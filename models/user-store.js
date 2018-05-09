'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');

const userStore = {

  store: new JsonStore('./models/user-store.json', { users: [] }),
  collection: 'users',

  getAllUsers() {
    return this.store.findAll(this.collection);
  },

  addUser(user) {
    this.store.add(this.collection, user);
    this.store.save();
  },
  
  getUserById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },
  
  // addMessage(msg, user){
  //   console.log("Users " + this.store.findOneBy(this.collection, { id: user }));    
  //   let myUser = this.store.findOneBy(this.collection, { id: user });    
  //   myUser.message = msg;
  //   this.store.save();
  // },
  getUserByEmail(email) {
    return this.store.findOneBy(this.collection, { email: email });
  },
};

module.exports = userStore;
