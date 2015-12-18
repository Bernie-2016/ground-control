import Promise from 'bluebird';
import bcrypt from 'bcrypt';

export function hash(password, salt) {
  salt = salt || 10
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) return reject(err)
      resolve(hash)
    })
  })
}

export function compare(expected, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(expected, hash, (err, res) => {
      if (err) return reject(err)
      resolve(res)
    })
  })
}