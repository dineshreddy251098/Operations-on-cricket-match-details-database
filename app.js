const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error:${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

app.use(express.json());

//Path: /players/
//Method: GET

app.get("/players/", async (request, response) => {
  const getPlayersDetailsQuery = `
    SELECT
    player_id AS playerId,
    player_name AS playerName
    FROM
    player_details
    `;
  const dbPlayersDetails = await db.all(getPlayersDetailsQuery);
  response.send(dbPlayersDetails);
});

//Path: /players/:playerId/
//Method: GET

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerIdDetailsQuery = `
    SELECT
    player_id AS playerId,
    player_name AS playerName
    FROM
    player_details
    WHERE
    player_id=${playerId};
    `;
  const dbPlayerIdDetails = await db.get(getPlayerIdDetailsQuery);
  response.send(dbPlayerIdDetails);
});

//Path: /players/:playerId/
//Method: PUT

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const updatePlayerDetailsQuery = `
    UPDATE player_details
    SET
        player_name='${playerName}'
    WHERE
        player_id=${playerId};
    `;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//Path: /matches/:matchId/
//Method: GET

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const getMatchDetailsQuery = `
    SELECT
    match_id AS matchId,
    match,
    year
    FROM
    match_details
    WHERE
    match_id=${matchId};
    `;
  const dbMatchDetails = await db.get(getMatchDetailsQuery);
  response.send(dbMatchDetails);
});

//Path: /players/:playerId/matches
//Method: GET

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;

  const getMatchesPlayedByPlayerIdQuery = `
    SELECT
    match_details.match_id AS matchId,
    match_details.match,
    match_details.year
    FROM
    player_match_score LEFT JOIN match_details ON player_match_score.match_id=match_details.match_id
    WHERE
    player_match_score.player_id=${playerId};
    `;
  const dbMatchesPlayed = await db.all(getMatchesPlayedByPlayerIdQuery);
  response.send(dbMatchesPlayed);
});

//Path: /matches/:matchId/players
//Method: GET

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;

  const getPlayersOfMatchQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName
    FROM
    player_match_score LEFT JOIN player_details ON player_match_score.player_id=player_details.player_id
    WHERE
    player_match_score.match_id=${matchId};
    `;
  const dbPlayers = await db.all(getPlayersOfMatchQuery);
  response.send(dbPlayers);
});

//Path: /players/:playerId/playerScores
//Method: GET

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerTotalScoreQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM 
    player_match_score LEFT JOIN player_details ON player_match_score.player_id=player_details.player_id
    WHERE
    player_match_score.player_id=${playerId};
    `;
  const dbPlayerTotalScore = await db.get(getPlayerTotalScoreQuery);
  response.send(dbPlayerTotalScore);
});
module.exports = app;
