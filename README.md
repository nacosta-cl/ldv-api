# ldv

> ldv

Containerizado!

DB -> Postgres

API -> Node + Koa

Web-server -> Nginx

## Workflow

master -> produccion
dev-> para mergear todo

### Scripts

TBA

## Lanzmiento

Instalen docker asap

## Local Build
```
# build for production and launch server
$ npm run build
$ npm run start

```
## Docker sauce


### Levantar servicios
Esto si!
Funciona con Hot Reloading
```
docker-compose up -d --build
docker-compose log -f

```

Inicializar la base de datos
```
docker-compose exec ldv-api npx sequelize db:create #Opcional, no deberia
docker-compose exec ldv-api npx sequelize db:migrate:all

```


### Terminar
```

docker-compose down

```

### Test
```
docker exec -ti ldv-api npm run test

OR

npm run test
```

