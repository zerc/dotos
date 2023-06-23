# Distributed Todo list

> *Disclaimer* this is not a product but rather exploration / POC
> Do not try to use it


## Local setup

### Integrations

#### Todoist

Create a [new app](https://developer.todoist.com/appconsole.html) and get **Test token** to get started quickly:

```shell
export TODOIST_TOKEN=<your token>
```

For integration to work

```shell
docker compose up -d
```

Database admin interface will be available on http://localhost:8080/

```shell
npm install
npm run start:dev
```

