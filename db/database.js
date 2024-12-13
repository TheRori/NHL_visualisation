// db/database.js

import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'nhl_stats.db');
const db = new sqlite3.Database(dbPath);

export function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Supprimez la table si elle existe pour la recréer
            db.run(`DROP TABLE IF EXISTS swiss_players`, (err) => {
                if (err) reject(err);
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS swiss_players (
                                                             playerId INTEGER PRIMARY KEY,
                                                             fullName TEXT,
                                                             nationalityCode TEXT,
                                                             birthCity TEXT,
                                                             birthCountryCode TEXT,
                                                             birthDate TEXT,
                                                             birthStateProvinceCode TEXT,
                                                             currentTeamAbbrev TEXT,
                                                             currentTeamName TEXT,
                                                             positionCode TEXT,
                                                             height INTEGER,
                                                             weight INTEGER,
                                                             shootsCatches TEXT,
                                                             draftYear INTEGER,
                                                             draftOverall INTEGER,
                                                             draftRound INTEGER
                )
            `, (err) => {
                if (err) reject(err);
            });
            db.run(`DROP TABLE IF EXISTS swiss_player_game_log`, (err) => {
                if (err) reject(err);
            });
            db.run(`
                CREATE TABLE IF NOT EXISTS swiss_player_game_log (
                                                                     gameId INTEGER,
                                                                     playerId INTEGER,
                                                                     gameDate TEXT,
                                                                     teamAbbrev TEXT,
                                                                     homeRoadFlag TEXT,
                                                                     opponentAbbrev TEXT,
                                                                     opponentName TEXT,  -- Ajout de la colonne manquante
                                                                     goals INTEGER,
                                                                     assists INTEGER,
                                                                     points INTEGER,
                                                                     plusMinus INTEGER,
                                                                     powerPlayGoals INTEGER,
                                                                     powerPlayPoints INTEGER,
                                                                     gameWinningGoals INTEGER,
                                                                     otGoals INTEGER,
                                                                     shots INTEGER,
                                                                     shifts INTEGER,
                                                                     shorthandedGoals INTEGER,
                                                                     shorthandedPoints INTEGER,
                                                                     penaltyMinutes INTEGER,
                                                                     timeOnIce TEXT,
                                                                     PRIMARY KEY (gameId, playerId),
                                                                     FOREIGN KEY (playerId) REFERENCES swiss_players(playerId)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

export default db;
