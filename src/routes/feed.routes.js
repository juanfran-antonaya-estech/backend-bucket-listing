import {Router} from "express";
import {pool} from "../db.js";

const router = Router()

router.get("/api/feed", async (req, res) => {

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

router.get("/api/feed/friendsuggestions", async (req,res) => {
    const {session_id} = req.headers
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

export default router