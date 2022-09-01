const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios")


const app = express();

app.use(bodyParser.json());
app.use(cors());

const posts = {};



app.get('/posts', (req,res) => {
    res.send(posts)
})

const handleEvent = (type,data) => {
    if( type === "PostCreated"){
        const {id, title} = data

        posts[id] = {id,title,comment:[]}

    }

    if( type === "CommentCreated"){
        const { id, content, postId, status } = data;
        const post = posts[postId]
        post.comment.push({id,content,status})
    }

    if(type === "CommentUpdated"){
        const {id, content, status,postId } = data;
        const post = posts[postId];
        const comment = post.comment.find(comment => {
            return comment.id === id;
        })
        comment.status = status;
        comment.content = content;
    }

}


app.post('/events', (req,res) => {
    const {type, data} = req.body;
    handleEvent(type,data);
    

    res.send({})
})

app.listen(4002, async () => {
    console.log("Listening on 4002")
    const res = await axios.get("http://event-bus-srv:4005/events");

    for (let event of res.data){
        console.log("Processing event:", event.type);
        handleEvent(event.type, event.data)
    }

})