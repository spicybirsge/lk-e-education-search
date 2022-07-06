require('dotenv').config();
require('./database/connector')();
const express = require('express');
const app = express();
const handler = require('./middleware/handler');
const logger = require('morgan');
const cors = require('cors');
const posts = require('./database/schemas/posts');
const aerect = require('aerect.js');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(handler);
app.use(cors());
app.use(express.static('public'));
app.set('view-engine', 'ejs');

 function getytvideoid(url) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
var match = url.match(regExp);
if (match && match[2].length == 11) {
   return match[2];
} else {
  return false;
}
 }



app.get('/', async (req, res) => {
const data = await posts.find()
const sortdata = data.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
res.render('index.ejs', { data:sortdata, msg: null });

})

app.post('/', async (req, res) => {
   const ID = aerect.generateID(10)
    const { subject, grade, youtube } = req.body;
    if(!subject || !grade || !youtube) {
        const data = await posts.find();
        return res.status(400).render('index.ejs', { data: data, msg: 'Please fill all fields' });
    }

  

       const youtube_id =  getytvideoid(youtube);
       if(!youtube_id) {
        const data = await posts.find();
        return res.status(400).render('index.ejs', { data: data, msg: 'Please enter valid youtube url' });
       }
       const dataexists = await posts.findOne({ youtube_id: youtube_id });
       if(dataexists) {
        const data = await posts.find();
        return res.status(400).render('index.ejs', { data: data, msg: 'Video already exists' });
    }
    
    if(grade*1 > 13 || grade*1 < 1) {
        const data = await posts.find();
        return res.status(400).render('index.ejs', { data: data, msg: 'Invalid Grade' });
    }
    
           await posts.create({
                  subject: subject.toLowerCase(),
                    grade: grade*1,
                    youtube_id: youtube_id,
                    ID: ID,
                    createdAt: Date.now()
           })
    
           return res.redirect(`/${ID}`);
})



app.get('/search', async (req, res) => {
    const query = req.query.query;
    const grade = req.query.grade;
    if(!query || !grade) {
        const data = await posts.find();
        return res.status(400).render('index.ejs', { data: data, msg: 'Please fill all fields' });
    }

   try {
    const data = await posts.find({ grade: grade*1 });
    const datatosend = data.filter(d => d.subject.toLowerCase().startsWith(query.toLowerCase()));

    return res.render('index.ejs', { data: datatosend, msg: null });
} catch {
    return res.sendStatus(500);
}
})

app.get('/:id', async (req, res) => {
    const ID = req.params.id;
    const data = await posts.findOne({ ID: ID });
    if(!data) {
        return res.sendStatus(404);
    }
    res.render('post.ejs', { data: data, msg: null });

})





const port = process.env.PORT || 9000;

app.listen(port, () => {

    console.log(`[^] Server is running on port ${port}`);
})
