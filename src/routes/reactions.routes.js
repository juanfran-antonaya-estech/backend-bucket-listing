import {pool} from "../db.js";
import Router from "express";

const router = Router()

router.get("/api/reactions/:id", async (req, res) => {
        const { id } = req.params;
        const [reactions] = await pool.query("SELECT r.id AS reacthingos_id, r.reaction_type, p.id AS profile_id, pv.id AS pivot_id, r.iwantit\n" +
            "FROM reacthingos AS r\n" +
            "JOIN profile AS p ON r.profile_id = p.id\n" +
            "JOIN pivot_thingos_perfil AS pv ON r.profile_id = pv.thingo_id\n" +
            "WHERE r.reaction_type IN ('queloco', 'mentiroso', 'confilmo') AND r.id = ?",
            [id]
        );
        res.json(reactions);
});

router.post("/api/reactions/:id", async (req, res) => {
    const { id } = req.params;
    const { reaction_type, profile_id, pivot_id } = req.body;

    if (!['queloco', 'mentiroso', 'confilmo'].includes(reaction_type)) {
        return res.status(400).json({ message: "no me vale eso" });
    }

    try{
        const [existingReactions] = await pool.query(
            "SELECT id, iwantit FROM reacthingos WHERE reaction_type = ? AND profile_id = ? AND pivot_id = ?",
            [reaction_type, profile_id, pivot_id]
        );

        let reactionId;
        let iwantitActualizado = 0;

        if (existingReactions.length > 0) {
            // Si existe, solo actualizar el iwantit
            reactionId = existingReactions[0].id;
            if (profile_id === pivot_id) {
                const [updateResult] = await pool.query(
                    "UPDATE reacthingos SET iwantit = iwantit + 1 WHERE id = ?",
                    [reactionId]
                );
                iwantitActualizado = updateResult.affectedRows;
            }
        } else {
            // Si no existe, insertar una nueva reacción
            const [insertResult] = await pool.query(
                "INSERT INTO reacthingos (reaction_type, profile_id, pivot_id, iwantit) VALUES (?, ?, ?, ?)",
                [reaction_type, profile_id, pivot_id, 0]
            );
            reactionId = insertResult.insertId;

            if (profile_id === pivot_id) {
                const [updateResult] = await pool.query(
                    "UPDATE reacthingos SET iwantit = iwantit + 1 WHERE id = ?",
                    [reactionId]
                );
                iwantitActualizado = updateResult.affectedRows;
            }
        }

        // Enviar la respuesta con el resultado
        res.status(201).json({
            id: reactionId,
            reaction_type,
            profile_id,
            pivot_id,
            iwantit_actualizado: iwantitActualizado
        });
    } catch (error) {
        res.status(500).json({ message: "Error en los valores" });
    }
});
export default router