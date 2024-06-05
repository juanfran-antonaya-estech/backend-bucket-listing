import {pool} from "../db.js";
import Router from "express";

const router = Router()

router.get("/api/trending", async (req, res) => {
    const [trending] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria, cat.image AS imagen_categoria, COUNT(react.id) AS puntos_de_insanidad FROM pivot_thingos_perfil as pv\n" +
        "        JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "        JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "        LEFT JOIN reacthingos AS react ON (react.pivot_id = pv.id) AND (react.reaction_type = 'queloco')\n" +
        "        WHERE pv.last_done_date >= CURRENT_DATE - INTERVAL '7' DAY\n" +
        "        GROUP BY th.id\n" +
        "        ORDER BY COUNT(react.id) DESC;")
    res.json(trending)
})

export default router