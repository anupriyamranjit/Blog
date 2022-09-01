const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json())
app.use(cors());



const comments = {}

app.get("/posts/:id/comments",(req,res) => {
    const postId = req.params.id;
    res.send(comments[postId] || []);
})

app.post("/posts/:id/comments", async (req,res) => {
    const postId = req.params.id;
    const id = randomBytes(4).toString("hex");
    const { content } = req.body;
    const comment = comments[postId] || []

    comment.push({id, content, "status": "pending"})

    comments[postId] = comment


    await axios.post('http://event-bus-srv:4005/events',{ type : "CommentCreated", data: {id, content, postId, status: "pending"}})

    res.status(201).send(comments)

})

app.post('/events', async (req,res) => {
    console.log("Comment has received event", req.body.type);
    const {type,data} = req.body
    if(type === "CommentModerated"){
        const { postId, id, status, content } = data
        const commentsOnPost = comments[postId]
        const comment = commentsOnPost.find(comment => {
            return comment.id === id
        });
        comment.status = status

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,status,postId,content
            }
        })


    }
    res.send({})
})

app.listen(4001,() => {
    console.log("Listening on port 4001")
})