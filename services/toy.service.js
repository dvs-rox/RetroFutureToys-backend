import fs from 'fs'
import { utilService } from './util.service.js'
const PAGE_SIZE = 5

export const toyService = {
  query,
  get,
  remove,
  save,
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy) {

  const { txt, inStock, labels, pageIdx, pageSize, sortBy, direction } = filterBy
  let filteredToys = toys
  if (txt.length) {
    const regex = new RegExp(txt, 'i')
    filteredToys = filteredToys.filter((toy) => regex.test(toy.title))
  }
  if (inStock !== '') {
    if (inStock === 'inStock') {
      filteredToys = filteredToys.filter(toy => toy.inStock)
    }
    else {
      filteredToys = filteredToys.filter(toy => !toy.inStock)
    }
  }
  if (labels.length) {
    filteredToys = filteredToys.filter(toy => labels.every(label => toy.labels.includes(label)))
  }
  if (sortBy) {
    switch (sortBy) {
      case 'createdAt':
        filteredToys.sort((a, b) => (a.createdAt - b.createdAt) * direction)
        break
      case 'price':
        filteredToys.sort((a, b) => (a.price - b.price) * direction)
        break
      case 'name':
        filteredToys.sort((a, b) => a.title.localeCompare(b.title))
    }
  }
  const startIdx = pageIdx * pageSize
  filteredToys = filteredToys.slice(startIdx, startIdx + pageSize)
  return Promise.resolve(filteredToys)
}

function save(toy) {
  if (toy._id) {
    const idx = toys.findIndex((currToy) => currToy._id === toy._id)
    if (idx === -1) return Promise.reject('No such toy')
    toys[idx] = toy
  } else {
    toy._id = _makeId()
    toys.push(toy)
  }

  return _saveToysToFile().then(() => toy)
}

function get(toyId) {
  const toy = toys.find((toy) => toy._id === toyId)
  return Promise.resolve(toy)
}

function remove(toyId) {
  const idx = toys.findIndex((toy) => toy._id === toyId)
  if (idx === -1) return Promise.reject('No such toy')

  toys.splice(idx, 1)
  return _saveToysToFile()
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
