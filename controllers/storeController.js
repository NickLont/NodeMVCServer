const mongoose = require('mongoose')
const Store = mongoose.model('Store') // Getting the model we created
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter (req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if (isPhoto) {
      next(null, true)
    } else {
      next({message: 'That filetype isn\'t allowed'}, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index')
}
exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add store'}) // .pug name + Object with Parameters
}
// Temporary storage of the image
exports.upload = multer(multerOptions).single('photo')
// Multer adds a body and a file(s) object to the request object.
// Body contains values from text fields and file(s) contains files uploaded

exports.resize = async (req, res, next) => {
  // Check if there is no file to resize
  if (!req.file) {
    next() // Skip to the next middleware
    return
  }
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`
  // We do the resize now
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  // Write photo to our file system
  await photo.write(`./public/uploads/${req.body.photo}`)
  // Once it is written keep going
  next()
}

exports.createStore = async (req, res) => {
  // const store = new Store(req.body)
  // store.customField = 'something' // We can do that
  // await store.save()

  const store = await (new Store(req.body)).save()
  // we store the promise-response of Store so we could have the generated value of slug

  console.log('storage worked')
  req.flash('success', `Succesfully created ${store.name}. Please leave a review`)
  res.redirect(`/store/${store.slug}`)
}
exports.getStores = async (req, res) => {
  // Query the DB for a list of all stores
  const stores = await Store.find()
  res.render('stores', {title: 'Stores', stores})
}
exports.editStore = async (req, res) => {
  // 1.  Find the store given the ID
  const store = await Store.findOne({_id: req.params.id})

  // 2. Confirm they are the owner of the store
  // TODO

  // 3. Render out the edit form so the user can update their store
  res.render('editStore', {title: `Edit ${store.name}`, store})
}
exports.updateStore = async (req, res) => {
  // set type to be Point
  req.body.location.type = 'Point'
  // find and update the store
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true // force it to run the validations we set when creating a new store
  }).exec() // 3 parameters: query, data, options
  req.flash('success', `Successfully update <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store ></a>`)

  // Redirect to store and tell them it worked
  res.redirect(`/stores/${store._id}/edit`)
}
exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({slug: req.params.slug})
  if (!store) {
    return next()
  }
  res.render('store', {store, title: store.name})
}

exports.getStoresByTag = async (req, res) => {
  const tags = await Store.getTagsList()
  const tag = req.params.tag
  res.render('tags', {tags, tag, title: 'Tags'})
}
