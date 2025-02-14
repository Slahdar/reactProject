pour lancer le projet dans client et server : npm install
Dans client : npm run dev
dans server : node server

A la racine du projet lancer nodemailer avec docker :
docker run --name='mailcatcher' -d --publish=1080:1080 --publish=1025:1025 dockage/mailcatcher:0.9.0

Note : pour vérifier le bon envoi du mail vérifier à http://localhost:1080/