const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const sqlite3 = require("sqlite3");

let db = null;
const initializedDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("server started running at localhost:3001");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializedDBAndServer();

// ALL PLAYERS API

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team 
    ORDER BY player_id;
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// POST PLAYER TO TABLE

app.post("/players/", async (request, response) => {
  const players_details = request.body;
  const { playerName, jerseyNumber, role } = players_details;
  const addPlayerQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES ('${playerName}',${jerseyNumber},'${role}');

  `;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

// get player
app.get("/players/:playerid/", async (request, response) => {
  const { playerid } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team 
    WHERE player_id = ${playerid}
    ;`;
  const getPlayer = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(getPlayer));
});

//put method to update data
app.put("/players/:playerid/", async (request, response) => {
  const { playerid } = request.params;
  const players_details = request.body;
  const { playerName, jerseyNumber, role } = players_details;
  const updateplayerDataQuery = `
    UPDATE cricket_team 
    SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE player_id = ${playerid}; 
    `;

  await db.run(updateplayerDataQuery);
  response.send("Player Details Updated");
});

// delete player data
app.delete("/players/:playerid/", async (request, response) => {
  const { playerid } = request.params;
  const deleteQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerid}
    ;`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
