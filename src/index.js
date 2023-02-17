const express = require("express");
const multer =  require("multer");
const app = express();
app.use(express.json());
const PORT = process.env.PORT;
require("./db/db");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("../src/routes//taskRoutes");

app.use("/user", userRoutes);
app.use("/task", taskRoutes );

const upload = multer({
    dest:"images"
})

app.post("/upload", upload.single('upload'), (req,res)=>{
    
    res.send("hello")
})


app.listen(PORT, ()=>{
console.log(`server is running on ${PORT}`);
})

