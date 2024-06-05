import {pool} from "../db.js";
import Router from "express";

const router = Router()

router.post("/api/friends", async (req,res) => {
    const {session_id} = req.headers
    const [session_key] = await pool.query("SELECT pf.id, pv.session_id FROM profile AS pf\n" +
        "JOIN usuario AS lg ON pf.user_id = lg.id\n" +
        "JOIN pivot_login_user AS pv ON pv.user_id = lg.id\n" +
        `WHERE pv.session_id = '${session_id}';`)
    const user = session_key[0].id

    const {friend} = req.body

    const [result] = await pool.query(`INSERT INTO follows (id, following_user_id, followed_user_id, follow) VALUES (NULL, '${user}', '${friend}', CURRENT_DATE())`)

    res.status(200)


})

router.delete("/api/friends", async (req, res) => {
    const {session_id} = req.headers
    const [session_key] = await pool.query("SELECT pf.id, pv.session_id FROM profile AS pf\n" +
        "JOIN usuario AS lg ON pf.user_id = lg.id\n" +
        "JOIN pivot_login_user AS pv ON pv.user_id = lg.id\n" +
        `WHERE pv.session_id = '${session_id}';`)
    const user = session_key[0].id

    const {friend} = req.body

    const [result] = await pool.query(`DELETE
                                       FROM follows
                                       WHERE follows.following_user_id = ${user} AND follows.followed_user_id = ${friend}`)
})

export default router