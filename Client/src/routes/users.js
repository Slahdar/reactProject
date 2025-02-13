import { getUserById,getUsers,loginUser,registerUser } from "../controllers/users.js";


export function usersRoutes(app) {
    // Route de connexion
    app.post("/signin", async (request, reply) => {
        const response = await loginUser(request.body, app);
        if (response.error) {
            return reply.status(400).send(response);
        }
        reply.send(response); // Renvoie le token ou le succès
    });

    // Route de déconnexion
    app.post("/logout", { preHandler: [app.authenticate] }, async (request, reply) => {
        const token = request.headers["authorization"].split(" ")[1];
        reply.send({ logout: true }); // Renvoie succès
    });

    // Route d'inscription
    app.post("/signup", async (request, reply) => {
        const response = await registerUser(request.body, app.bcrypt);
        if (response.error) {
            return reply.status(400).send(response); // En cas d'erreur, statut 400
        }
        reply.send(response); // Renvoie utilisateur créé
    });

    // Route pour récupérer tous les utilisateurs
    app.get("/users", async (request, reply) => {
        const users = await getUsers();
        reply.send(users); // Renvoie liste d'utilisateurs
    });

    // Route pour récupérer un utilisateur par ID
    app.get("/users/:id", async (request, reply) => {
        const user = await getUserById(request.params.id);
        if (!user) {
            return reply.status(404).send({ error: "Utilisateur non trouvé" }); 
        }
        reply.send(user); // Renvoie l'utilisateur trouvé
    });
}
