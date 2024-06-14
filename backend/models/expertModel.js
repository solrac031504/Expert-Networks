const mongoose = require('mongoose')

const Schema = mongoose.Schema

const expertSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  field_of_study: {
    type: String,
    required: true
  },
  institution: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  citations: {
    type: Number,
    required: true
  },
  hindex: {
    type: Number,
    required: true
  },
  age: {
    type: Number,
    required: false,
    default: -1
  },
  years_in_field: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Expert', expertSchema)