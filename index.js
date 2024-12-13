import { fetchSwissPlayers, fetchSwissPlayerGameLog } from './services/nhlApiService.js';
import { storeSwissPlayersInDB, storePlayerGameLogInDB } from './utils/storeData.js';
import express from 'express';
import { initializeDatabase } from './db/database.js';
import playersRoute from './routes/players.js';

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use('/api/players', playersRoute);

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});

async function main() {
    try {
        await initializeDatabase();

        const swissPlayers = await fetchSwissPlayers();
        storeSwissPlayersInDB(swissPlayers);

        for (const player of swissPlayers) {
            console.log(player.playerId)
            const gameLog = await fetchSwissPlayerGameLog(player.playerId);
            const gameLogWithPlayerId = gameLog.map(game => ({ ...game, playerId: player.playerId }));
            storePlayerGameLogInDB(gameLogWithPlayerId);
        }
    } catch (error) {
        console.error('Une erreur est survenue dans l\'exécution du programme:', error);
    }
}

main()
    .then(() => {
        console.log('Exécution réussie');
    })
    .catch(error => {
        console.error('Une erreur est survenue lors de l\'exécution de main:', error);
    });
