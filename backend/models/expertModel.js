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
  age: {
    type: Number,
    required: false
  },
  years_in_field: {
    type: Number,
    required: true
  },
  living: {
    type: Boolean,
    required: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Expert', expertSchema)