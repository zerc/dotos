# Distributed Todo list

> **Disclaimer** this is not a product but rather proof-of-concept a (somewhat) distributed
> application. It's unlikely it will be of any use to anyone and is not going to be maintained
> going forward.

## Requirements

The application provides two entities - `Todo` and `Category`. A user can create both of them using GraphQL API. 

### Functional requirements

* CRUD for `Category`
* CRUD for `Todo`, in particular:
* * query a list (paginated) of todos with filtration by completion
* * query a todo by ID
* * update the todo / mark it as completed / assign to a group
* Integration with another service provider in a way that:
* * todos created in the third-party service are created in the service
* * status of todos is synced between the service and the integration
* The code should be structured

### Non-functional requirements

The tech stack is the following:

* Typescript
* [Apollo](https://www.apollographql.com/docs/react/get-started) as GraphQL server
* [Prisma](https://www.prisma.io/typescript) ORM
* PostgreSQL database

The code should be structured to allow a small team (~10ppl) to be effective in contributing to it.

### Assumptions

**There can be more than one integration**

This would mean the following:

* Content and the status of the todos should be cross-synced between all the integrations and the local service.
* There will be no "linking" of the todos from different integrations if they were created *before* the integration was enabled i.e. it could create duplicated entries after a new integration is added. The approach was chosen for the sake of simplicity.

> In the real product, however, there could be a setting exposed where a user could specify how to handle this case (it could be part of the process of enabling the integration by the user)

**Other**
* No public API for enabling / disabling / configuring the integrations.
* No authorisation && any user-management functionality
* No deployment setup for production. The service is expected to run locally in the development mode.

## Outcome

### Design

A high-level overview of the design:

![design overview](docs/design_overview.png)

A few things to note:

* Database is shared between services for simplicity. However, each component uses a separate set of tables without foreign keys between them. Also, the code is structured in a way that it is easy to configure different databases per component if needed.
* There isn't much difference between **our** service and **3rd-party** integraiton. Each component encapsulates its logic but uses a predefined set of events to communicate with others.
* Every component
* * should store any data required to ensure todos are linked together but do not leak anything outside
* * can have its way to fetch data e.g. webhooks, polling or API

Data flow between components can be seen like this:

![data flow](docs/data_flow.png)

### Specifications

The service has two integrations:

* `dummy` - generates a random todo and submits it to the bus.
* `todoist` - a simple integration with [Todoist](https://todoist.com/). It only syncs `content` and completion of the items from the default project via [Sync API](https://developer.todoist.com/sync/v9/#items)

A little demo:



### Shortcuts

Here are the things I'd like to do but decided to de-prioritise due to limited time:

* **There are no tests**. I planned to use [jest](https://jestjs.io/docs/getting-started) for that.
* Data consistency. The current implementation does not tolerate well when third-party service is not available and it may lead to data inconsistency. One way this can be addressed is by replacing the in-memory channel implementation for the [message bus](https://github.com/Dashlane/ts-event-bus) to ensure it can retry `onError` and persist events. However, the application is designed in a way that can be improved without rewriting everything.
* `uuid4` is used to generate a distributed ID for the todos stored locally (in the API layer). In the production system, however, there might be a need for a more sophisticated solution to ensure data integrity.

## Local setup

### Integrations

#### Todoist

Create a [new app](https://developer.todoist.com/appconsole.html) and get **Test token** to get started quickly:

```shell
export TODOIST_TOKEN=<your token>
```

### Database

To start the database run.

```shell
docker compose up -d
```

Its admin interface will be available on http://localhost:8080/

### Install and run

```shell
npm install
npm run start:app:dev
```

By default `dummy` integration is enabled and it will push one todo item which then will be synced between the API layer and Todoist (if enabled).