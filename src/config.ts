import { config } from "dotenv";


config()

const DB_HOST = process.env.POSTGRES_HOST
const DB_USER = process.env.POSTGRES_USER
const DB_PASSWORD = process.env.POSTGRES_PASSWORD
const DB_NAME = process.env.POSTGRES_DB
const DB_PORT = parseInt(process.env.POSTGRES_PORT || "5432", 10)

export default {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT
}