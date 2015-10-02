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
var person1 = new Person();
person1.id = '1';
person1.email = 'anon@ymous.com';
person1.name = 'Person 1';

var person2 = new Person();
person2.id = '2';
person2.name = 'Person 2';
person2.email = 'anon1@ymous.com';

module.exports = {
  // Export methods that your schema can use to interact with your database
  getPerson: (id) => id === person1.id ? person1 : person2,
  Person,
  allPeople: () => ([person1, person2])
};

