require("dotenv").config();
const { faker } = require('@faker-js/faker');
let getRandomUser=()=> {
  return [
     faker.string.uuid(),
     faker.internet.username(),
     faker.internet.email(),
     faker.internet.password(),
  ];
}

const mysql=require('mysql2');
// const connection=mysql.createConnection({
//     host:'localhost',
//     user:'root',
//     database:'delta_app',
//     password:'Root@123'
// })

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

const express=require("express");
const app=express();

const methodOverride=require("method-override");
app.use(methodOverride("_method"));


app.use(express.urlencoded({extended:true})); 
// let data=[];
// for(let i=1;i<100;i++){
//     data.push(getRandomUser());
// }

// let users=[
//             ["123b","123_newuserb","abc@gmail.comb","abcb"],
//             ["123c","123_newuserc","abc@gmail.comc","abcc"]
//  ];

// connection.end();
const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

//Home Page....
app.get("/",(req,res)=>{
let q="select count(*) from user";

    try{
    connection.query(q,(err,result)=>{
        
         if(err) {
            console.log(err);
            return res.send("Something wrong");
        }
        let count=result[0]['count(*)'];
        res.render("home.ejs",{count});
    })
    } catch(err){
        console.log(err);
        res.send("some error");
    }
   
});

//Show Route
app.get("/user",(req,res)=>{
    let q="select * from user";
    try{
        connection.query(q,(err,result)=>{
            if(err) {
                console.log(err);
                return res.send("Something wrong");
            }
            res.render("showusers.ejs",{result});
        })
    }catch(err){
        console.log(err);
        res.send("something is error");
    }
});

app.get("/user/:id/edit",(req,res)=>{
    let {id}=req.params;
    let q=`SELECT * FROM user WHERE id="${id}"`;
    try{
        connection.query(q,(err,result)=>{
            if(err) {
                console.log(err);
                return res.send("Something wrong");
            }
            let user=result[0];//object
            //console.log(user)
            res.render("edit.ejs",{user});
        })
    }catch(err){
        console.log(err);
        res.send("something is error");
    }
    
})

app.patch("/user/:id",(req,res)=>{
    let {id}=req.params;
    let q=`SELECT * FROM user WHERE id="${id}"`;
    let {password:formPass,username:newUsername}=req.body;
    try{
        connection.query(q,(err,result)=>{
            
            if(err) {
                console.log(err);
                return res.send("Something wrong");
            }
            let user=result[0];//object
            if(formPass!=user.password){
                res.send("WRONG Password");
            }else{
                let q2=`UPDATE user SET username="${newUsername}" WHERE id="${id}"`;
                connection.query(q2,(err,result)=>{
                    if(err) {
                        console.log(err);
                        return res.send("Username already exists");
                    }
                    res.redirect("/user");
                })
            }

            // console.log(user)
            
        })
    }catch(err){
        console.log(err);
        res.send("something is error");
    }
})

app.get("/user/new",(req,res)=>{
    res.render("new.ejs");
})

app.post("/user/new",(req,res)=>{
    let id=faker.string.uuid();
    let {username,password,email}=req.body;
    let q3=`INSERT INTO user values ("${id}","${username}","${email}","${password}")`;
    try{
        connection.query(q3,(err,result)=>{
           if(err) {
                console.log(err);
                return res.send("Something wrong");
            }
            res.redirect("/user");
        })
    }catch(err){
        res.send("something wrong");
    }
})

app.get("/user/:id/delete",(req,res)=>{
    let {id}=req.params;
    let q5=`SELECT * FROM user WHERE id="${id}"`;
    try{
        connection.query(q5,(err,result)=>{
            if(err) {
                console.log(err);
                return res.send("Something wrong");
            }
            let user=result[0]; 
            res.render("delete.ejs",{user})

        })
    }catch(err){
        res.send("something error");
    }
    
    

})

app.delete("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password}=req.body;
    let q4=`SELECT * FROM user WHERE id="${id}"`;

    try{
        connection.query(q4,(err,result)=>{
            
            if(err) {
                console.log(err);
                return res.send("Something wrong");
            }
            let user=result[0];
            // console.log("Entered password:", password);
            // console.log("Database password:", user.password);
            if(password!=user.password){
                res.send("incorrect password");
            }else{

                let q6=`DELETE FROM user WHERE id="${id}"`;
                connection.query(q6,(err,result)=>{
                    if(err) throw err;
                    else{
                        res.redirect("/user");
                    }
                })

            }
        })
    }catch(err){
        res.send("something wrong");
    }
})

app.listen("3000",()=>{
    console.log("server is listening to port");
})