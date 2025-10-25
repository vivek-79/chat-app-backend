import { server } from "./app";




const PORT = 3000;

server.listen(PORT,"0.0.0.0",()=>{
    console.log(`Listening on Port : ${PORT}`)
})