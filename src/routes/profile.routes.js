import {Router} from "express";
import {pool} from "../db.js";

const router = Router()

router.get("/api/perfil", async(req, res) => {

    const {session_id} = req.headers
    if(session_id == undefined){
        res.status(401).json({
            "message" : "session_key no definida"
        })
        return
    }
    const [session_key] = await pool.query("SELECT pf.id, pv.session_id FROM profile AS pf\n" +
        "JOIN usuario AS lg ON pf.user_id = lg.id\n" +
        "JOIN pivot_login_user AS pv ON pv.user_id = lg.id\n" +
        `WHERE pv.session_id = '${session_id}';`)
    const user = session_key[0].id

    const [results] = await pool.query("SELECT `usuario`.`usuario` AS `nombre_usuario`, `profile`.`id`, `profile`.`apodo` AS `nombre_perfil`, `profile`.`profile_photo` AS `imagen_perfil`, `profile`.`profile_banner` AS `banner`, `profile`.`profile_bio` AS `bio`\n" +
        "FROM `usuario`\n" +
        "LEFT JOIN `profile` ON `usuario`.`id` = `profile`.`user_id` \n" +
        "WHERE (( usuario.`id` = ?))", user)
    const main = results[0]
    const [things] = await pool.query("SELECT pf.apodo AS nick, th.times_done AS times FROM profile AS pf \n" +
        `JOIN pivot_thingos_perfil AS th ON pf.id = th.profile_id WHERE pf.id = ${main.id};`)
    let timesdone = 0
    things.map(thingo => {
        timesdone = timesdone + thingo.times
    })
    main.thingos = timesdone

    const [confirms] = await pool.query("SELECT vf.type AS veriftype FROM profile AS pf \n" +
        "JOIN pivot_thingos_perfil AS th ON pf.id = th.profile_id \n" +
        "JOIN verifithingo AS vf ON th.id = vf.pivot_id\n" +
        `WHERE pf.id = ${main.id};`)
    main.confirmaciones = confirms

    const [lies] = await pool.query("SELECT rt.reaction_type AS reaccion FROM reacthingos AS rt\n" +
        "JOIN pivot_thingos_perfil AS pv ON pv.id = rt.pivot_id\n" +
        `WHERE (pv.profile_id = ${main.id}) AND (rt.reaction_type = 'mentiroso');`)
    main.mentiras = lies.length

    const [quelocos] = await pool.query("SELECT rt.reaction_type AS reaccion FROM reacthingos AS rt\n" +
        "JOIN pivot_thingos_perfil AS pv ON pv.id = rt.pivot_id\n" +
        `WHERE (pv.profile_id = ${main.id}) AND (rt.reaction_type = 'queloco');`)
    main.insanidad = quelocos.length

    const [followers] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
        "JOIN follows AS fwpv ON fwers.id = fwpv.following_user_id\n" +
        `WHERE fwpv.followed_user_id = ${main.id}`)
    main.seguidores = followers.length

    const [follows] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
        "JOIN follows AS fwpv ON fwers.id = fwpv.followed_user_id\n" +
        `WHERE fwpv.following_user_id = ${main.id}`)
    main.seguidos = follows.length

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

    main.mutuals = mutuals


    res.json(main)
})

router.get("/api/perfil/:id", async(req, res) => {
    const [results] = await pool.query("SELECT `usuario`.`usuario` AS `nombre_usuario`, `profile`.`id`, `profile`.`apodo` AS `nombre_perfil`, `profile`.`profile_photo` AS `imagen_perfil`, `profile`.`profile_banner` AS `banner`, `profile`.`profile_bio` AS `bio`\n" +
        "FROM `usuario`\n" +
        "LEFT JOIN `profile` ON `usuario`.`id` = `profile`.`user_id` \n" +
        "WHERE (( usuario.`id` = ?))", [req.params.id])
    const main = results[0]
    const [things] = await pool.query("SELECT pf.apodo AS nick, th.times_done AS times FROM profile AS pf \n" +
        `JOIN pivot_thingos_perfil AS th ON pf.id = th.profile_id WHERE pf.id = ${main.id};`)
    let timesdone = 0
    things.map(thingo => {
        timesdone = timesdone + thingo.times
    })
    main.thingos = timesdone

    const [confirms] = await pool.query("SELECT vf.type AS veriftype FROM profile AS pf \n" +
        "JOIN pivot_thingos_perfil AS th ON pf.id = th.profile_id \n" +
        "JOIN verifithingo AS vf ON th.id = vf.pivot_id\n" +
        `WHERE pf.id = ${main.id};`)
    main.confirmaciones = confirms

    const [lies] = await pool.query("SELECT rt.reaction_type AS reaccion FROM reacthingos AS rt\n" +
        "JOIN pivot_thingos_perfil AS pv ON pv.id = rt.pivot_id\n" +
        `WHERE (pv.profile_id = ${main.id}) AND (rt.reaction_type = 'mentiroso');`)
    main.mentiras = lies.length

    const [quelocos] = await pool.query("SELECT rt.reaction_type AS reaccion FROM reacthingos AS rt\n" +
        "JOIN pivot_thingos_perfil AS pv ON pv.id = rt.pivot_id\n" +
        `WHERE (pv.profile_id = ${main.id}) AND (rt.reaction_type = 'queloco');`)
    main.insanidad = quelocos.length

    const [followers] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
        "JOIN follows AS fwpv ON fwers.id = fwpv.following_user_id\n" +
        `WHERE fwpv.followed_user_id = ${main.id}`)
    main.seguidores = followers.length

    const [follows] = await pool.query("SELECT fwers.id, fwers.apodo, fwers.profile_photo FROM profile AS fwers\n" +
        "JOIN follows AS fwpv ON fwers.id = fwpv.followed_user_id\n" +
        `WHERE fwpv.following_user_id = ${main.id}`)
    main.seguidos = follows.length

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

    main.mutuals = mutuals


    res.json(main)
})

router.post("/api/perfil", async(req, res) => {
    const {session_id} = req.headers
    if (session_id == undefined || session_id == null) {
        res.status(401).json({
            "message" : "session_key no definida"
        })
        return
    }
    const [session_key] = await pool.query("SELECT us.id, pv.session_id FROM `usuario` AS us\n" +
        "JOIN pivot_login_user as pv ON us.id = pv.user_id\n" +
        `WHERE pv.session_id = '${session_id}';`)
    const user = session_key[0].id

    const [results] = await pool.query(`SELECT * FROM profile WHERE user_id = ${user}`)
    if (results.length != 0){
        res.status(405).json({
            "message": "perfil ya creado"
        })
        return
    }

    let {apodo, profile_photo, profile_banner, profile_bio, minor, enterprise, ni_user} = req.body

        if (enterprise){
            enterprise = 1
        } else {
            enterprise = 0
        }
        if (minor){
            minor = 1
        } else {
            minor = 0
        }

        if (ni_user != null){
            ni_user = "'" + ni_user + "'"
        }

    let [result] = await pool.query("INSERT INTO `profile`(\n" +
        "    `id`,\n" +
        "    `user_id`,\n" +
        "    `apodo`,\n" +
        "    `profile_photo`,\n" +
        "    `profile_banner`,\n" +
        "    `profile_bio`,\n" +
        "    `fecha_creacion`,\n" +
        "    `minor`,\n" +
        "    `enterprise`,\n" +
        "    `netflix_impact_user`\n" +
        ")\n" +
        "VALUES(\n" +
        "    NULL,\n" +
        `    '${user}',
` +
        `    '${apodo}',
` +
        `    '${profile_photo}',
` +
        `    '${profile_banner}',
` +
        `    '${profile_bio}',
` +
        "    CURRENT_DATE(),\n" +
        `    '${minor}',
` +
        `    '${enterprise}',
` +
        `    ${ni_user});`)

    res.json(result)
})

export default router