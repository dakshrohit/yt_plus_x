import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app= express()


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"200kb"})) // to make the app accept data in json format upto a limit 
app.use(express.urlencoded({extended:true,limit:"200kb"})) // to accept data from the url, extended: to take nested objects  
app.use(express.static("public"))
app.use(cookieParser( ))


//routes import
import userrouter from "./routes/user.routes.js"


// ROUTES DECLARATION

// earlier we were using app.get() because we were writing controllers,routers here only
// but now we have separated them in diff folders
// so now to bring router, we gotta bring middleware

app.use("/api/v1/users",userrouter); // when we go to /users, it just goes to userouter




//so the url becomes: http://localhost:8000/api/v1/users/register
// when we write userrouter -> it gives the entire responsibility to user.routes.js and what ever method we wrote there, it will be getting further resp, for ex we used registeruser method for "/register"



export {app};