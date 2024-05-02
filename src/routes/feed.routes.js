import {Router} from "express";
import {pool} from "../db.js";

const router = Router()

router.get("/api/feed", async(req, res) => {
    const user = 2
    const [results] = await pool.query("SELECT pv.thingo_id AS id_thingo, pv.profile_id AS id_de_quien_lo_ha_hecho, th.name AS nombre_thingo, other.apodo AS nombre_de_quien_lo_ha_hecho, pv.last_done_date AS fecha_hecho_por_otro FROM pivot_thingos_perfil AS pv\n" +
        "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "JOIN profile AS other ON pv.profile_id = other.id\n" +
        "ORDER BY pv.last_done_date;")

    for (const result of results) {
        const [donebyyou] = await pool.query("SELECT pv.thingo_id AS id_thingo, pv.profile_id AS done_by_you FROM pivot_thingos_perfil AS pv\n" +
            "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
            "JOIN profile AS other ON pv.profile_id = other.id\n" +
            `WHERE (pv.thingo_id = ${result.id_thingo}) AND (pv.profile_id = ${user})
` +
            "ORDER BY pv.last_done_date;")
        result.hecho_por_usuario = donebyyou.length === 1
    }

    res.json(results)
})

export default router