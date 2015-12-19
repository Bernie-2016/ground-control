import Promise from 'bluebird';
import bcrypt from 'bcrypt';

export function hash(password, salt) {
  salt = salt || 10
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (err, hashedValue) => {
      if (err) return reject(err)
      resolve(hashedValue)
    })
  })
}

export function compare(expected, hashedValue) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(expected, hashedValue, (err, res) => {
      if (err) return reject(err)
      resolve(res)
    })
  })
}