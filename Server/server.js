const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const authMiddleware = require('./middleware/auth');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { User, sequelize, initDatabase } = require('./database');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Update with your Vite client port
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Helper functions for user management
async function generateID(id) {
  const count = await User.count({
    where: {
      id: {
        [Op.like]: `${id}%`,
      },
    },
  });
  
  if (count > 0) {
    id = id.substring(0, 5);
    const newCount = await User.count({
      where: {
        id: {
          [Op.like]: `${id}%`,
        },
      },
    });
    id = id + (newCount + 1);
  }
  return id;
}

// Auth routes
app.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;
    console.log('Données reçues:', { firstname, lastname, username, email });
    
    if (!firstname || !lastname || !username || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: "L'adresse email est déjà utilisée" });
    }
    
    // Check if username already exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: "Le nom d'utilisateur est déjà utilisé" });
    }
    
    // Generate ID
    let id = await generateID(
      (lastname.substring(0, 3) + firstname.substring(0, 3)).toUpperCase()
    );
    console.log('ID généré:', id);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create verification token
    const verificationToken = uuidv4();
    console.log('Token de vérification généré:', verificationToken);
    
    // Create user
    const newUser = await User.create({
      id,
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      verificationToken,
    });

    console.log('Utilisateur créé:', {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      verificationToken: newUser.verificationToken
    });
    
    // Send verification email
    const confirmationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
    console.log('URL de confirmation:', confirmationUrl);
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'reactappmax@yahoo.com',
        pass: process.env.EMAIL_PASS || 'reactappmaxdzmdq15Ma',
      },
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'reactappmax@yahoo.com',
      to: email,
      subject: 'Verifiez votre Email',
      text: `Cliquez sur le lien suivant pour confirmer votre adresse email : ${confirmationUrl}`,
      html: `
        <h1>Vérification de votre email</h1>
        <p>Merci de vous être inscrit ! Pour vérifier votre email, veuillez cliquer sur le lien ci-dessous :</p>
        <a href="${confirmationUrl}">Vérifier mon email</a>
        <p>Si le lien ne fonctionne pas, copiez et collez cette URL dans votre navigateur :</p>
        <p>${confirmationUrl}</p>
      `
    };
    
    console.log('Envoi du mail avec les options:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      confirmationUrl
    });
    
    await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès');
    
    res.status(201).json({ 
      success: true, 
      message: "Registration successful! Please check your email to verify your account."
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Il n'y a pas d'utilisateur associé à cette adresse email" });
    }
    
    // Check if user is verified
    if (!user.verified) {
      return res.status(400).json({ error: "Votre compte n'est pas encore vérifié. Veuillez vérifier votre boîte mail" });
    }
    
    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );
    
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

app.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    console.log('Token reçu dans la requête:', token);
    
    if (!token) {
      console.log('Token manquant dans la requête');
      return res.status(400).json({ error: "Token manquant" });
    }

    // Recherche l'utilisateur et log la requête
    console.log('Recherche utilisateur avec token:', token);
    const user = await User.findOne({ 
      where: { verificationToken: token } 
    });
    
    // Log le résultat de la recherche
    if (user) {
      console.log('Utilisateur trouvé:', {
        id: user.id,
        email: user.email,
        verified: user.verified,
        verificationToken: user.verificationToken
      });
    } else {
      console.log('Aucun utilisateur trouvé avec ce token');
    }

    if (!user) {
      return res.status(400).json({ error: "Token invalide" });
    }
    
    // Met à jour l'utilisateur
    await user.update({ 
      verified: true, 
      verificationToken: null 
    });
    
    console.log('Utilisateur vérifié avec succès');
    
    res.send("Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.");
  } catch (error) {
    console.error('Erreur complète:', error);
    res.status(500).json({ error: "Une erreur est survenue lors de la vérification de l'email" });
  }
});


// Socket.io logic
const allUsers = {};
const allRooms = [];

io.on("connection", (socket) => {
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      allRooms.push({
        player1: opponentPlayer,
        player2: currentUser,
      });

      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "circle",
      });

      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.playerName,
        playingAs: "cross",
      });

      currentUser.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });

      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentUser.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
    } else {
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnect", function () {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    for (let index = 0; index < allRooms.length; index++) {
      const { player1, player2 } = allRooms[index];

      if (player1.socket.id === socket.id) {
        player2.socket.emit("opponentLeftMatch");
        break;
      }

      if (player2.socket.id === socket.id) {
        player1.socket.emit("opponentLeftMatch");
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});