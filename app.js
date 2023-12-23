const express = require('express')

const path = require('path')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const intitializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

intitializeDBAndServer()

/// 1 GET Players Data

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id`

  const playersData = await db.all(getAllPlayersQuery)

  response.send(
    playersData.map(eachPlayer => ({
      playerId: eachPlayer.player_id,
      playerName: eachPlayer.player_name,
      jerseyName: eachPlayer.jersey_number,
      role: eachPlayer.role,
    })),
  )
})

/// 2 POST Player Data

app.post('/players/', async (request, response) => {
  const allPlayers = request.body

  const {playerName, jerseyName, role} = allPlayers

  const addPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)
  VALUES(
    '${playerName}',
    '${jerseyName}',
    '${role}'
  );`

  await db.run(addPlayerQuery)

  response.send('Player Added to Team')
})

// 3 Get Players Using Player ID

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const getplayersUsingIdQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`

  const playerData = await db.get(getplayersUsingIdQuery)

  response.send({
    playerId: playerData.player_id,
    playerName: playerData.player_name,
    jerseyName: playerData.jersey_number,
    role: playerData.role,
  })
})

// 4 Update Player Details

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params

  const playersData = request.body

  const {playerName, jerseyName, role} = playersData

  const updatePlayerQuery = `UPDATE cricket_team SET
    player_name = '${playerName}',
    jersey_number = ${jerseyName},
    role = '${role}'
    
    WHERE player_id = ${playerId};`

  await db.get(updatePlayerQuery)

  response.send('Player Details Updated')
})

//Delete Player

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const deltePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId}`

  await db.run(deltePlayerQuery)

  response.send('Player Removed')
})

module.exports = app
