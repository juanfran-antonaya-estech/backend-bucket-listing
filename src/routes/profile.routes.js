import {Router} from "express";
import {pool} from "../db.js";

const router = Router()

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
    followers.map( follower => {
        follows.map( followed => {
            if (follower.id = followed.id) {
                mutuals.push(follower)
            }
        })
    })

    main.mutuals = mutuals


    res.json(main)
})

export default router