const express = require("express");
const app = express();
const path = require("path");
const connection = require("./connection");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const session = require("express-session");
const { error } = require("console");
app.use(session({ secret: "secret_key", resave: false, saveUninitialized: true }));


app.use('/uploads', express.static('upload'));

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './upload')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+path.extname(file.originalname))
    }
  });
  
const upload = multer({ storage: storage });

//middleware on refreshing page

const redirectOnRefresh = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');  // Redirect to home page if session does not exist
    }
    next();  // Continue if session exists
};

app.get('/',(req,res)=>{
    res.render("login")
});

app.post('/submit',(req,res,next)=>{
    const{fullname , id,password}=req.body;
    if(fullname==''){
        connection.query("SELECT * FROM users WHERE id=? AND passward = ?",[id,password],(err,result)=>{
            if(err)throw err;
            console.log(result);
            if (result.length > 0) {  
                req.session.user = { id, password };
                res.redirect('/options'); 
            } else {
                res.send("No ID or password found");
            }
        }
        );
    }
    else{
        connection.query("select id,passward from users where id=? and passward=?",[id,password],(err,result)=>{
            if(err) throw err;

            if(result.length>0){
                res.send("user exist before");
            }
            else{
                connection.query('insert into users values(?,?,?)',[id,password,fullname],(err,result)=>{
                    if(err) throw err;
                    console.log("entered");
                });
                req.session.user = { id, password };
                req.session.save(() => {
                    res.redirect('/options'); 
                });
                
            }
        })
        
    }    
});

app.get('/options',  redirectOnRefresh,(req, res) => {
    res.render("index");
});

// middleware for file uploaded
const checkFileSelected = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file selected. Please upload a file." });
    }

    const ext = path.extname(req.file.originalname);

    if (!ext) {
        return res.status(400).json({ error: "Invalid file. File must have an extension." });
    }
    next();
};


app.post("/upload", upload.single('myfile'),checkFileSelected,  redirectOnRefresh,(req, res) => {
    const user = req.session.user;
    connection.query('insert into files  (user_id, file_path) values(?,?)',[user.id,req.file.filename],(err,result)=>{
        if(err) throw err;
        res.send("Upload successful!");
    })
    
});


app.post("/access", redirectOnRefresh,(req,res)=>{
    const user = req.session.user;
    connection.query("select file_path from files where user_id=?",[user.id],(err,result)=>{
        if(err) throw err;
        req.session.re = result;
        req.session.save(()=>{
            res.send("done");
        })
    })
});
 

app.get("/files", (req, res) => {
    const response = req.session.re;
    
    for (let i = 0; i < response.length; i++) {
        const relative_path = "/uploads/" + response[i].file_path.split("\\").join("/");
        response[i].file_path = relative_path;
    }

    res.render("files", { response: response });
});

app.delete("/delete", (req, res) => {
    const fileUrl = req.body.file;

    const fileName = path.basename(fileUrl);
    const fullPath = path.join(__dirname, "upload", fileName).replace(/\\/g, "\\\\");

        try {
            fs.unlinkSync(fullPath);
            const deleteQuery = "DELETE FROM files WHERE file_path = ?";
            connection.query(deleteQuery,[fileName], (err, result) => {
                if (err) {
                   console.log(err);
                }
               
                res.send("deleted sucessfully!");
            });


        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Error deleting file", details: err.message });
        }
});
app.listen(3000, () => {
    console.log("server is running at port 3000");
});