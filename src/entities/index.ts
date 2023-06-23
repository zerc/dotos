import { Todo } from "./todo.js";
import { TodoList } from "./todo-list.js";
import { RefreshToken } from "../integrations/entities/RefreshToken.js"
import { IntegrationTodo } from "../integrations/entities/IntegrationTodo.js"

const entities = [Todo, TodoList, RefreshToken, IntegrationTodo];

export default entities;