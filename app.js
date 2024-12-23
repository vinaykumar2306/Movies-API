const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbpath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

//GET Movies API

app.get('/movies/', async (request, response) => {
  const getMovies = `SELECT movie_name
    FROM movie;`
  const moviesResponse = await db.all(getMovies)
  response.send(moviesResponse)
})

//POST movie API

app.post('/movies/', async (request, response) => {
  const moviesDetails = request.body
  const {directorId, movieName, leadActor} = moviesDetails
  const postMovie = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(
    ${directorId},
    "${movieName}",
    "${leadActor}"
  )`
  const postRespone = await db.run(postMovie)
  response.send('Movie Successfully Added')
})

//GET movie With movieID API

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovie = `
  SELECT * FROM movie 
  WHERE movie_id = ${movieId}`
  const getMovieResponse = await db.get(getMovie)
  response.send(getMovieResponse)
})

//update MOVIE API

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const updateDetails = request.body
  const {directorId, movieName, leadActor} = updateDetails
  const updateMovie = `
  UPDATE movie
  SET 
  director_id = ${directorId},
  movie_name = "${movieName}",
  lead_actor = "${leadActor}"
  WHERE movie_id = ${movieId};`
  const getUpdateMovie = await db.run(updateMovie)
  response.send('Movie Details Updated')
})

//DELETE movie API

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovie = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`
  const deleteResponse = await db.run(deleteMovie)
  response.send('Movie Removed')
})

//GET directors API

app.get('/directors/', async (request, response) => {
  const getDirectors = `
  SELECT * FROM director
  ORDER BY director_id;`
  const directorResponse = await db.all(getDirectors)
  response.send(directorResponse)
})

//GET all Movies by a SPecific Director API

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const listOfMovies = `
  SELECT movie_name FROM movie
  WHERE director_id = ${directorId};`
  const allMovies = await db.all(listOfMovies)
  response.send(allMovies)
})

module.exports = app
