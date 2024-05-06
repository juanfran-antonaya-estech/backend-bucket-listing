import {Router} from "express";
import {pool} from "../db.js";

const router = Router()

router.get("/api/feed", async (req, res) => {

    const {session_id} = req.headers
    if(session_id == undefined){
        res.status(405).json({
            "message" : "no me vale eso"
        })
        return
    }
    const [session_key] = await pool.query("SELECT pf.id, pv.session_id FROM profile AS pf\n" +
        "JOIN usuario AS lg ON pf.user_id = lg.id\n" +
        "JOIN pivot_login_user AS pv ON pv.user_id = lg.id\n" +
        `WHERE pv.session_id = '${session_id}';`)
    const user = session_key[0].id


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

router.get("/api/feed/sugerenciasthingos", async (req, res) => {
    const [sugerenciasthingos] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria_thingo, cat.image AS imagen_categoria_thingo, other.apodo AS nombre_de_quien_lo_ha_hecho, pv.first_completion_date AS fecha_cuando_se_hizo FROM pivot_thingos_perfil AS pv\n" +
        "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "JOIN profile AS other ON pv.profile_id = other.id\n" +
        "GROUP BY th.id;")
    res.json(sugerenciasthingos)
})

router.get("/api/feed/thingosusuario/:page/:id", async (req, res) => {
    const main = {};
    const [info] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria, cat.image AS imagen_categoria_thingo, other.apodo AS nombre_de_quien_lo_ha_hecho\n" +
        "FROM pivot_thingos_perfil AS pv\n" +
        "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "JOIN profile AS other ON pv.profile_id = other.id;");





    let lista = [1, 2, 3, 4];
    let conteo = lista.length;

    const pagina = parseInt(req.params.page);

    const [results] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria, cat.image AS imagen_categoria_thingo, other.apodo AS hecho FROM pivot_thingos_perfil as pv \n" +
        "        JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "        JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "        JOIN profile AS other ON pv.profile_id = other.id\n" +
        "        JOIN pivot_thingos_perfil AS pivo ON pv.profile_id = pivo.id\n" +
        `        WHERE 1 LIMIT 10 OFFSET ${(pagina - 1) * 10}`);
    res.json({
        info,
        results
    });
    return

    main.info = {
        count: info.length,
        pages: info.length / 10,
        next: "",
        prev: null
    };

    main.results = results;
});



export default router