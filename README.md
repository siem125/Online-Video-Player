# Online-Video-Player

Om dit project te starten moeten beide projecten appart worden gestart. ik ga dit uiteindelijk met docker compose aanpassen zodat dit beide via 1 command gestart kan worden.

Als het project gestart is dan kan het momenteel nog geskipt worden door in de url /Dashboard toe te voegen. dit is omdat ik tijdens ontwikkeling vaker de applicatie moest herstarten en dat iedere keer inloggen veel tijd kosten.



## Docker
het commando "docker compose up -d --build" zorgt ervoor dat het gebuild wordt en dan blijft runnen

er worden nu 4 containers gestart: keycloak, keycloak db, nextjs frontend en c# api

momenteel moet er dan voor keycloak met admin admin ingelogd worden en dan alle urls binnen de VideoPlayer realm naar https:(localhost of ip van machine):(poort)



voor tailwind was er eerst een error omdat ik in config /components/ had en de folder /Components heten, dus case sensitive. is nu /src/**/* dus alles binnen src



## Installation steps
0. (optional) change ports / storage folders in the .env folder
1. run: docker compose up --build -d
2. if you changed port for frontent go to keycloak and login with:
admin 
admin

then go to videoplayer -> clients -> videoplayer-next-frontend -> settings and edit the port of the https://localhost:(port) or the entire uirl

3. access the site: https://localhost:(port)
4. users can now register as client with user permissions, to get admin permissions you need to add a role to a user from within keycloak and add the role Admin to the specific users