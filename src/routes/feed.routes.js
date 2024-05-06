import {Router} from "express";
import {pool} from "../db.js";

const router = Router()

router.get("/api/feed/:page", async (req, res) => {

    const main = {
        info: {
            count: 0,
            pages: 0,
            next: null,
            prev: null
        },
        results: []
    }

    const {session_id} = req.headers
    if(session_id == undefined){
        res.status(401).json({
            "message" : "no me vale eso"
        })
        return
    }

    const pagina = req.params.page
    const limit = 10
    const offset = (pagina - 1) * limit

    const [session_key] = await pool.query("SELECT pf.id, pv.session_id FROM profile AS pf\n" +
        "JOIN usuario AS lg ON pf.user_id = lg.id\n" +
        "JOIN pivot_login_user AS pv ON pv.user_id = lg.id\n" +
        `WHERE pv.session_id = '${session_id}';`)
    const user = session_key[0].id


    const [results] = await pool.query("SELECT pv.thingo_id AS id_thingo, pv.profile_id AS id_de_quien_lo_ha_hecho, th.name AS nombre_thingo, other.apodo AS nombre_de_quien_lo_ha_hecho, pv.last_done_date AS fecha_hecho_por_otro FROM pivot_thingos_perfil AS pv\n" +
        "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "JOIN profile AS other ON pv.profile_id = other.id\n" +
        "ORDER BY pv.last_done_date\n" +
        `LIMIT ${limit} OFFSET ${offset}`)

    const [resultInfo] = await pool.query("SELECT pv.thingo_id AS id_thingo, pv.profile_id AS id_de_quien_lo_ha_hecho, th.name AS nombre_thingo, other.apodo AS nombre_de_quien_lo_ha_hecho, pv.last_done_date AS fecha_hecho_por_otro FROM pivot_thingos_perfil AS pv\n" +
        "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "JOIN profile AS other ON pv.profile_id = other.id\n" +
        "ORDER BY pv.last_done_date")

    main.info.count = resultInfo.length
    main.info.pages = Math.floor((resultInfo.length / limit) + 1)
    main.info.next = `/api/feed/${Math.floor(pagina) + 1}`
    main.info.prev = `/api/feed/${Math.floor(pagina) - 1}`
    if (pagina == 1) {
        main.info.prev = null
    }
    if (pagina == main.info.pages) {
        main.info.next = null
    }

    for (const result of results) {
        const [donebyyou] = await pool.query("SELECT pv.thingo_id AS id_thingo, pv.profile_id AS done_by_you FROM pivot_thingos_perfil AS pv\n" +
            "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
            "JOIN profile AS other ON pv.profile_id = other.id\n" +
            `WHERE (pv.thingo_id = ${result.id_thingo}) AND (pv.profile_id = ${user})
            ` +
            "ORDER BY pv.last_done_date;")
        result.hecho_por_usuario = donebyyou.length === 1
    }

    main.results = results

    res.json(main)
})





export default router