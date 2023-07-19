import express from 'express'
import cors from 'cors'

import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

const corsOptions = {
  origin: ['http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://localhost:3000'],
  credentials: true
}

app.use(cors(corsOptions))

const port = process.env.PORT || 3030
// Express App Configuration:
app.use(express.static('public'))
app.use(express.json())

// LIST
app.get('/api/toy', (req, res) => {
  // const { txt, inStock, labels, pageIdx } = req.query
  const filterBy = {
    txt: req.query.txt || '',
    inStock: req.query.inStock || '',
    labels: req.query.labels || [],
    pageIdx: req.query.pageIdx || 0,
    pageSize: req.query.pageSize || 10,
    sortBy: req.query.sortBy || '',
    direction: req.query.direction || -1
  }
  toyService
    .query(filterBy)
    .then((toys) => res.send(toys))
    .catch((err) => {
      loggerService.error('Cannot get toy', err)
      res.status(400).send('Cannot get toy')
    })
})

// CREATE
app.post('/api/toy', (req, res) => {
  const toy = req.body

  toyService
    .save(toy)
    .then((savedToy) => res.send(savedToy))
    .catch((err) => {
      loggerService.error('Cannot save toy', err)
      res.status(400).send('Cannot save toy')
    })
})

// UPDATE
app.put('/api/toy/:toyId', (req, res) => {
  const toy = req.body

  toyService
    .save(toy)
    .then((savedToy) => res.send(savedToy))
    .catch((err) => {
      loggerService.error('Cannot save toy', err)
      res.status(400).send('Cannot save toy')
    })
})

// READ
app.get('/api/toy/:toyId', (req, res) => {
  const { toyId } = req.params

  toyService
    .get(toyId)
    .then((toy) => res.send(toy))
    .catch((err) => {
      loggerService.error('Cannot get toys', err)
      res.status(400).send('Cannot get toys')
    })
})

app.delete('/api/toy/:toyId', (req, res) => {
  const { toyId } = req.params

  toyService
    .remove(toyId)
    .then(() => res.send('Removed!'))
    .catch((err) => {
      loggerService.error('Cannot remove toy', err)
      res.status(400).send('Cannot remove toy')
    })
})

app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)
