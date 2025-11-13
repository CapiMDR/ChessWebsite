import connection from "./db_connect.js";

export async function getPlayerById(playerId) {
  const [rows] = await connection.execute("SELECT id, username FROM users WHERE id = ?", [playerId]);
  return rows.length > 0 ? rows[0] : null;
}
