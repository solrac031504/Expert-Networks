const mongoose = require('mongoose')

const Schema = mongoose.Schema

const expertSchema = new Schema({
  // Used for searching the profiles for more information
  expert_id: {
    type: String,
    required: true,
    default: 'N/A'
  },
  name: {
    type: String,
    required: true,
    default: 'N/A'
  },
  field_of_study: {
    type: String,
    required: true,
    default: 'N/A'
  },
  institution: {
    type: String,
    required: true,
    default: 'N/A'
  },
  region: {
    type: String,
    required: true,
    default: 'N/A'
  },
  citations: {
    type: Number,
    required: true,
    default: 0
  },
  hindex: {
    type: Number,
    required: true,
    default: 0
  },
  i10_index: {
    type: Number,
    required: true,
    default: 0
  },
  age: {
    type: Number,
    required: true,
    default: 0
  },
  years_in_field: {
    type: Number,
    required: true,
    default: 0
  },
  email: {
    type: String,
    required: true,
    default: 'N/A'
  }
}, { timestamps: true })

module.exports = mongoose.model('Expert', expertSchema)