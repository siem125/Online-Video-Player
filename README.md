# Online-Video-Player

Om dit project te starten moeten beide projecten appart worden gestart. ik ga dit uiteindelijk met docker compose aanpassen zodat dit beide via 1 command gestart kan worden.

Als het project gestart is dan kan het momenteel nog geskipt worden door in de url /Dashboard toe te voegen. dit is omdat ik tijdens ontwikkeling vaker de applicatie moest herstarten en dat iedere keer inloggen veel tijd kosten.



## Docker
het commando "docker compose up -d --build" zorgt ervoor dat het gebuild wordt en dan blijft runnen

er worden nu 4 containers gestart: keycloak, keycloak db, nextjs frontend en c# api

momenteel moet er dan voor keycloak met admin admin ingelogd worden en dan alle urls binnen de VideoPlayer realm naar https:(localhost of ip van machine):(poort)



voor tailwind was er eerst een error omdat ik in config /components/ had en de folder /Components heten, dus case sensitive. is nu /src/**/* dus alles binnen src


