// utils/storeData.js
import db from '../db/database.js';

export function storeSwissPlayersInDB(players) {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO swiss_players (
            playerId, fullName, nationalityCode, birthCity, birthCountryCode, birthDate,
            birthStateProvinceCode, currentTeamAbbrev, currentTeamName, positionCode,
            height, weight, shootsCatches, draftYear, draftOverall, draftRound
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    players.forEach(player => {
        stmt.run(
            player.playerId, player.fullName, player.nationalityCode, player.birthCity,
            player.birthCountryCode, player.birthDate, player.birthStateProvinceCode,
            player.currentTeamAbbrev, player.currentTeamName, player.positionCode,
            player.height, player.weight, player.shootsCatches, player.draftYear,
            player.draftOverall, player.draftRound
        );
    });

    stmt.finalize();
}

export function storePlayerGameLogInDB(gameLogs) {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO swiss_player_game_log (
            gameId, playerId, gameDate, teamAbbrev, homeRoadFlag, opponentAbbrev, opponentName,
            goals, assists, points, plusMinus, powerPlayGoals, powerPlayPoints,
            gameWinningGoals, otGoals, shots, shifts, shorthandedGoals,
            shorthandedPoints, penaltyMinutes, timeOnIce
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    gameLogs.forEach(game => {
        stmt.run(
            game.gameId, game.playerId, game.gameDate, game.teamAbbrev, game.homeRoadFlag,
            game.opponentAbbrev, game.opponentName, game.goals, game.assists,
            game.points, game.plusMinus, game.powerPlayGoals, game.powerPlayPoints,
            game.gameWinningGoals, game.otGoals, game.shots, game.shifts,
            game.shorthandedGoals, game.shorthandedPoints, game.penaltyMinutes, game.timeOnIce
        );
    });

    stmt.finalize();
}
