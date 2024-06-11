const Expert = require('../models/expertModel')
const mongoose = require('mongoose')

// get all experts
const getExperts = async (req, res) => {
  const experts = await Expert.find({}).sort({createdAt: -1})

  res.status(200).json(experts)
}

// get a single expert
const getExpert = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such expert'})
  }

  const expert = await Expert.findById(id)

  if (!expert) {
    return res.status(404).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

// create a new expert
const createExpert = async (req, res) => {
  const {
    name,
    field_of_study,
    institution,
    region,
    citations,
    age,
    years_in_field,
    living
  } = req.body

  // add to the database
  try {
    const expert = await Expert.create({
        name,
        field_of_study,
        institution,
        region,
        citations,
        age,
        years_in_field,
        living
    })
    res.status(200).json(expert)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// delete an expert
const deleteExpert = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'No such expert'})
  }

  const expert = await Expert.findOneAndDelete({_id: id})

  if(!expert) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

// update an expert
const updateExpert = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'No such expert'})
  }

  const expert = await Expert.findOneAndUpdate({_id: id}, {
    ...req.body
  })

  if (!expert) {
    return res.status(400).json({error: 'No such expert'})
  }

  res.status(200).json(expert)
}

module.exports = {
  getExperts,
  getExpert,
  createExpert,
  deleteExpert,
  updateExpert
}