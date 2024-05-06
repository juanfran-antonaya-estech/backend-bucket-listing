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

router.get("/api/suggestions/friendsuggestions", async (req,res) => {
    const {session_id} = req.headers
    if(session_id == undefined){
        res.status(401).json({
            "message" : "no me vale eso"
        })
        return
    }
    const [session_key] = await pool.query("SELECT pf.id, pv.session_id FROM profile AS pf\n" +
        "JOIN usuario AS lg ON pf.user_id = lg.id\n" +
        "JOIN pivot_login_user AS pv ON pv.user_id = lg.id\n" +
        `WHERE pv.session_id = '${session_id}';`)
    const user = session_key[0].id

    const [followers] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
        "JOIN follows AS fwpv ON fwers.id = fwpv.following_user_id\n" +
        `WHERE fwpv.followed_user_id = ${user}`)

    const [follows] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
        "JOIN follows AS fwpv ON fwers.id = fwpv.followed_user_id\n" +
        `WHERE fwpv.following_user_id = ${user}`)

    const mutuals = []
    followers.map( follower => {
        follows.map( followed => {
            if (follower.id = followed.id) {
                mutuals.push(follower)
            }
        })
    })

    const otrosmutuals = []

    for (const mutual of mutuals) {
        const [otrosfollowers] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
            "JOIN follows AS fwpv ON fwers.id = fwpv.following_user_id\n" +
            `WHERE fwpv.followed_user_id = ${mutual.id}`)

        const [otrosfollows] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
            "JOIN follows AS fwpv ON fwers.id = fwpv.followed_user_id\n" +
            `WHERE fwpv.following_user_id = ${mutual.id}`)

        otrosfollowers.map( follower => {
            otrosfollows.map( followed => {
                if (follower.id = followed.id) {
                    otrosmutuals.push(follower)
                }
            })
        })
    }

    otrosmutuals.map(otromutual => {
        function checkifexists() {
            let exists = false

            mutuals.forEach(mutual => {
                if(mutual.id == otromutual.id) {
                    exists = true
                }
            })

            return exists;
        }

        if (user == otromutual.id) {
            otromutual.relacion = "you"
        } else if (checkifexists()) {
            otromutual.relacion = "amigo"
        } else {
            otromutual.relacion = "ninguna"
        }
    })

    res.json(otrosmutuals)
})

router.get("/api/suggestions/sugerenciasthingos", async (req, res) => {
    const [sugerenciasthingos] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria_thingo, cat.image AS imagen_categoria_thingo, other.apodo AS nombre_de_quien_lo_ha_hecho, pv.first_completion_date AS fecha_cuando_se_hizo FROM pivot_thingos_perfil AS pv\n" +
        "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "JOIN profile AS other ON pv.profile_id = other.id\n" +
        "GROUP BY th.id;")
    res.json(sugerenciasthingos)
})
router.get("/api/feed/friendsuggestions", async (req,res) => {
    const {session_id} = req.headers
    if(session_id == undefined){
        res.status(401).json({
            "message" : "no me vale eso"
        })
        return
    }
    const [session_key] = await pool.query("SELECT pf.id, pv.session_id FROM profile AS pf\n" +
        "JOIN usuario AS lg ON pf.user_id = lg.id\n" +
        "JOIN pivot_login_user AS pv ON pv.user_id = lg.id\n" +
        `WHERE pv.session_id = '${session_id}';`)
    const user = session_key[0].id

    const [followers] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
        "JOIN follows AS fwpv ON fwers.id = fwpv.following_user_id\n" +
        `WHERE fwpv.followed_user_id = ${user}`)

    const [follows] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
        "JOIN follows AS fwpv ON fwers.id = fwpv.followed_user_id\n" +
        `WHERE fwpv.following_user_id = ${user}`)

router.get("/api/thingos/thingosusuario/:page/:id", async (req, res) => {
    const main = {};
    const [info] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria, cat.image AS imagen_categoria_thingo, other.apodo AS nombre_de_quien_lo_ha_hecho\n" +
        "FROM pivot_thingos_perfil AS pv\n" +
        "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "JOIN profile AS other ON pv.profile_id = other.id;")

    const mutuals = []
    followers.map( follower => {
        follows.map( followed => {
            if (follower.id = followed.id) {
                mutuals.push(follower)
            }
        })
    })

    const otrosmutuals = []

    for (const mutual of mutuals) {
        const [otrosfollowers] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
            "JOIN follows AS fwpv ON fwers.id = fwpv.following_user_id\n" +
            `WHERE fwpv.followed_user_id = ${mutual.id}`)

        const [otrosfollows] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
            "JOIN follows AS fwpv ON fwers.id = fwpv.followed_user_id\n" +
            `WHERE fwpv.following_user_id = ${mutual.id}`)

        otrosfollowers.map( follower => {
            otrosfollows.map( followed => {
                if (follower.id = followed.id) {
                    otrosmutuals.push(follower)
                }
            })
        })
    }
    const [results] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria, cat.image AS imagen_categoria_thingo, other.apodo AS hecho FROM pivot_thingos_perfil as pv \n" +
        "        JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "        JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "        JOIN profile AS other ON pv.profile_id = other.id\n" +
        "        JOIN pivot_thingos_perfil AS pivo ON pivo.profile_id = pv.id\n" +
        `       WHERE 1 LIMIT 10 OFFSET ${(pagina - 1) * 10}`);

    otrosmutuals.map(otromutual => {
        function checkifexists() {
            let exists = false

            mutuals.forEach(mutual => {
                if(mutual.id == otromutual.id) {
                    exists = true
                }
            })

            return exists;
        }

        if (user == otromutual.id) {
            otromutual.relacion = "you"
        } else if (checkifexists()) {
            otromutual.relacion = "amigo"
        } else {
            otromutual.relacion = "ninguna"
        }
    })

    res.json(otrosmutuals)
})

export default router