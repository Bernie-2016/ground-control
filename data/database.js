/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

// Model types
class Person extends Object {}

// Mock data
var person = new Person();
person.id = '1';
person.email = 'anon@ymous.com';

module.exports = {
  // Export methods that your schema can use to interact with your database
  getPerson: (id) => id === person.id ? person : null,
  Person,
  allPeople: () => ([person])
};

