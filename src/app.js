import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app= express()


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"20kb"})) // to make the app accept data in json format upto a limit 
app.use(express.urlencoded({extended:true,limit:"20kb"})) // to accept data from the url, extended: to take nested objects  
app.use(express.static("public"))
app.use(cookieParser( ))


export {app}