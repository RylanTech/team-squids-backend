import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { db } from './models';
import churchRoutes from './routes/churchRoutes';
import churchUserRoutes from './routes/churchUserRoutes'
import eventRoutes from './routes/eventRoutes'
import apiRoutes from './routes/apiRoutes'
import multer from 'multer';
import path from 'path';
import { ChurchUser } from './models/churchUser';
import { verifyUser } from './services/authService';
// import locationRoutes from './routes/locationRoutes'
import cors from 'cors';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'))

// incoming requests
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Uploads will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension); // Rename the file to include a timestamp
  },
});
const upload = multer({ storage: storage });

// Routing Middleware
app.use('/api/church', churchRoutes);
app.use('/api/user', churchUserRoutes);
app.use('/api/key', apiRoutes)
// app.use('/api/search', locationRoutes); 
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(filename, { root: 'uploads' }, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send('File not found');
    }
  });
});

app.post("/api/event/upload-image", upload.single("image"), async (req, res) => {
  try {
    let user: ChurchUser | null = await verifyUser(req);
    if (!user) {
      return res.status(403).send();
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Image upload failed." });
  }
});
app.use('/api/event', eventRoutes);

app.use(( req: Request, res: Response, next: NextFunction ) => {
  res.status(404).send("error");
})


// Syncing DB
db.sync({ alter:false }).then(() => {
  console.info("Connected to the database!")
});


app.listen(3001);