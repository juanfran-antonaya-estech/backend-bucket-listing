import {pool} from "../db.js";
import Router from "express";

const router = Router()

router.get("/api/reactions/:id", async (req,res) => {
    const [reactions] = await pool.query("SELECT r.id AS reacthingos_id, r.reaction_type, p.id AS profile_id, pv.id AS pivot_id FROM reacthingos AS r\n" +
    "JOIN profile AS p ON r.profile_id = p.id\n" +
    "JOIN pivot_thingos_perfil AS pv ON r.profile_id = pv.thingo_id\n" +
    "WHERE r.reaction_type IN ('queloco', 'mentiroso', 'confilmo');")
    res.json(reactions)
})

router.post("/api/reactions/:id")

export default router