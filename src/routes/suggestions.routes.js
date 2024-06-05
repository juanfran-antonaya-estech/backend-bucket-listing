import {pool} from "../db.js";
import Router from "express";

const router = Router()

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
    followers.forEach( follower => {
        for (let i = 0; i < follows.length; i++) {
            const followed = follows[i]
            if (follower.id = followed.id) {
                mutuals.push(follower)
                break
            }
        }
    })

    const otrosmutuals = []

    let contador = 0

    for (const mutual of mutuals) {
        const [otrosfollowers] = await pool.query("SELECT fwers.id, fwpv.id AS 'id_sumutual', fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
            "JOIN follows AS fwpv ON fwers.id = fwpv.following_user_id\n" +
            `WHERE fwpv.followed_user_id = ${mutual.id}`)

        const [otrosfollows] = await pool.query("SELECT fwers.id, fwpv.id AS 'id_sumutual', fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
            "JOIN follows AS fwpv ON fwers.id = fwpv.followed_user_id\n" +
            `WHERE fwpv.following_user_id = ${mutual.id}`)



        otrosfollowers.forEach( follower => {
            for (let i = 0; i < otrosfollows.length; i++) {
                const followed = otrosfollows[i]
                if (follower.id = followed.id) {
                    otrosmutuals.push(follower)
                    break
                }
            }
        })

        if(contador > 100){
            break
        } else {
            contador++
        }
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
    res.status(200).json(otrosmutuals)
    return
})

router.get("/api/suggestions/sugerenciasthingos", async (req, res) => {
    const [sugerenciasthingos] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria_thingo, cat.image AS imagen_categoria_thingo, other.apodo AS nombre_de_quien_lo_ha_hecho, pv.first_completion_date AS fecha_cuando_se_hizo FROM pivot_thingos_perfil AS pv\n" +
        "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "JOIN profile AS other ON pv.profile_id = other.id\n" +
        "GROUP BY th.id;")
    res.status(200).json(sugerenciasthingos)
})

export default router