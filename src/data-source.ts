import { DataSource } from "typeorm"
import entities from "./entities/index.js"
import config from "./config.js"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    synchronize: true,
    logging: true,
    entities: entities,
    subscribers: [],
    migrations: [],
})