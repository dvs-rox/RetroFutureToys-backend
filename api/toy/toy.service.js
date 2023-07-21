import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { utilService } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

export const toyService = {
  query,
  get,
  remove,
  save,
}
const COLLECTION_NAME = 'toys'

async function query(filterBy) {

  const { txt,
    inStock,
    labels,
    pageIdx,
    pageSize,
    sortBy,
    direction } = filterBy

  // let inStockBool = null
  // switch (inStock) {
  //   case 'true':
  //     inStockBool = true
  //     break
  //   case 'false':
  //     inStockBool = false
  //     break
  //   case 'null':
  //     inStockBool = null
  //     break
  //   }
  try {
    const criteria = {
      title: { $regex: txt, $options: 'i' },
      // inStock: { $eq: inStockBool }
    }
    const collection = await dbService.getCollection(COLLECTION_NAME)
    const sortOptions = {};
    sortOptions[sortBy] = direction
    let toys = await collection
      .find(criteria)
      .sort(sortOptions)
      .skip(pageIdx * pageSize)
      .limit(+pageSize)
      .toArray()
    return toys
  }
  catch (err) {
    loggerService.error(err)
    throw err
  }

  // let filteredToys = toys
  // if (txt.length) {
  //   const regex = new RegExp(txt, 'i')
  //   filteredToys = filteredToys.filter((toy) => regex.test(toy.title))
  // }
  // if (inStock !== '') {
  //   if (inStock === 'inStock') filteredToys = filteredToys.filter(toy => toy.inStock)
  //   else filteredToys = filteredToys.filter(toy => !toy.inStock)
  // }
  // if (labels.length) filteredToys = filteredToys.filter(toy => labels.every(label => toy.labels.includes(label)))
  // if (sortBy) {
  //   switch (sortBy) {
  //     case 'createdAt':
  //       filteredToys.sort((a, b) => (a.createdAt - b.createdAt) * direction)
  //       break
  //     case 'price':
  //       filteredToys.sort((a, b) => (a.price - b.price) * direction)
  //       break
  //     case 'name':
  //       filteredToys.sort((a, b) => a.title.localeCompare(b.title))
  //   }
  // }
  // const startIdx = pageIdx * pageSize
  // filteredToys = filteredToys.slice(startIdx, startIdx + pageSize)
  // return Promise.resolve(filteredToys)
}

async function save(toy) {
  if (!toy._id) {//add
    try {
      const collection = await dbService.getCollection(COLLECTION_NAME)
      await collection.insertOne(toy)
      return toy
    } catch (err) {
      loggerService.error('Cannot add new toy ', err)
    }
  } else {//update
    try {
      const toyToSave = JSON.parse(JSON.stringify(toy))
      delete toyToSave._id

      const collection = await dbService.getCollection(COLLECTION_NAME)
      await collection.updateOne({ _id: new ObjectId(toy._id) }, { $set: toyToSave })
    } catch (err) {
      loggerService.error('Cannot update existing toy ', err)
    }
  }
  // if (toy._id) {
  //   const idx = toys.findIndex((currToy) => currToy._id === toy._id)
  //   if (idx === -1) return Promise.reject('No such toy')
  //   toys[idx] = toy
  // } else {
  //   toy._id = _makeId()
  //   toys.push(toy)
  // }

  // return _saveToysToFile().then(() => toy)
}

async function get(toyId) {
  try {
    const collection = await dbService.getCollection(COLLECTION_NAME)
    const toy = collection.findOne({ _id: new ObjectId(toyId) })
    return toy
  } catch (err) {
    loggerService.error(err)
    throw err
  }
  // const toy = toys.find((toy) => toy._id === toyId)
  // return Promise.resolve(toy)
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection(COLLECTION_NAME)
    await collection.deleteOne({ _id: new ObjectId(toyId) })
  } catch (err) {
    loggerService.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
  // const idx = toys.findIndex((toy) => toy._id === toyId)
  // if (idx === -1) return Promise.reject('No such toy')

  // toys.splice(idx, 1)
  // return _saveToysToFile()
}

function _makeId(length = 5) {
  let txt = ''
  let possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return txt
}

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const content = JSON.stringify(toys, null, 2)
    fs.writeFile('./data/toy.json', content, (err) => {
      if (err) {
        console.error(err)
        return reject(err)
      }
      resolve()
    })
  })
}
