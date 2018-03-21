const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slugs')

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true, // removes whitespace etc
    required: 'Please enter a store name!' // Boolean, this is  true and gives a clear message
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [
    String
  ],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!' // Like before, also true
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String
})

// Runs function to create slug before 'save' in the database IF name has been changed
storeSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next()
    return
  }
  this.slug = slug(this.name)

  // make slugs unique
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
  const storesWithSlug = await this.constructor.find( // Find inside the Store model itself
    {slug: slugRegEx}
  )
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`
  }
  next()
})

storeSchema.statics.getTagsList = function () { // We add a custom method for queries in our schema. It must not be an es6, to bind this to Store schema
  return this.aggregate([ // Found aggregators in mongoDB site, put through pipeline
    {$unwind: '$tags'},
    {$group: {_id: '$tags', count: {$sum: 1}}}, // Group everything based on tags field and create a new fields in each group called count
    {$sort: {count: -1}} // Descending
  ])
}

module.exports = mongoose.model('Store', storeSchema) // ( name, schema )
