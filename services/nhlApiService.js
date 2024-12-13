// services/nhlApiService.js
import fetch from 'node-fetch';

// services/nhlApiService.js



export async function fetchSwissPlayerGameLog(playerId) {
    const url = `https://api-web.nhle.com/v1/player/${playerId}/game-log/20232024/2`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const gameLog = data.gameLog || [];

        // Adapter la structure pour les champs imbriqués
        return gameLog.map(game => ({
            gameId: game.gameId,
            playerId: playerId,
            gameDate: game.gameDate,
            teamAbbrev: game.teamAbbrev,
            homeRoadFlag: game.homeRoadFlag,
            opponentAbbrev: game.opponentAbbrev,
            opponentName: game.opponentCommonName.default, // Récupère le nom de l'adversaire
            goals: game.goals,
            assists: game.assists,
            points: game.points,
            plusMinus: game.plusMinus,
            powerPlayGoals: game.powerPlayGoals,
            powerPlayPoints: game.powerPlayPoints,
            gameWinningGoals: game.gameWinningGoals,
            otGoals: game.otGoals,
            shots: game.shots,
            shifts: game.shifts,
            shorthandedGoals: game.shorthandedGoals,
            shorthandedPoints: game.shorthandedPoints,
            penaltyMinutes: game.pim,
            timeOnIce: game.toi
        }));
    } catch (error) {
        console.error(`Erreur lors de la récupération des statistiques pour le joueur ${playerId}:`, error);
        return [];
    }
}


export async function fetchSwissPlayers() {
    const url = 'https://api.nhle.com/stats/rest/en/skater/bios?limit=-1&cayenneExp=seasonId=20242025';

    try {
        const response = await fetch(url);
        const data = await response.json();
        const players = data.data || [];

        // Filtrer les joueurs de nationalité suisse
        const swissPlayers = players.filter(player => player.nationalityCode === 'CHE');

        // Retourner les informations personnelles nécessaires pour chaque joueur suisse
        return swissPlayers.map(player => ({
            playerId: player.playerId,
            fullName: player.skaterFullName,
            nationalityCode: player.nationalityCode,
            birthCity: player.birthCity,
            birthCountryCode: player.birthCountryCode,
            birthDate: player.birthDate,
            birthStateProvinceCode: player.birthStateProvinceCode,
            currentTeamAbbrev: player.currentTeamAbbrev,
            currentTeamName: player.currentTeamName,
            positionCode: player.positionCode,
            height: player.height,
            weight: player.weight,
            shootsCatches: player.shootsCatches,
            draftYear: player.draftYear,
            draftOverall: player.draftOverall,
            draftRound: player.draftRound
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des joueurs suisses:', error);
        return [];
    }
}
