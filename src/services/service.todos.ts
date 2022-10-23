import { StatusCodes as status } from 'http-status-codes'
import { Request } from 'express'
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm'

import { Todos } from '@entities/entitie.todos'
import { Inject, Service, Repository } from '@helpers/helper.di'
import { apiResponse, APIResponse } from '@helpers/helper.apiResponse'
import { DTOTodos, DTOTodosId } from '@dtos/dto.todos'

@Service()
export class TodosService {
  constructor(@Inject('TodosModel') private model: Repository<Todos>) {}

  async createTodos(body: DTOTodos): Promise<APIResponse> {
    try {
      const checkTitle: Todos = await this.model.findOne({ title: body.title })
      if (checkTitle) throw apiResponse(status.BAD_REQUEST, `Title ${body.title} already exist`)

      const addTodo: InsertResult = await this.model.insert(body)
      if (!addTodo) throw apiResponse(status.FORBIDDEN, 'Created new todo failed')

      return apiResponse(status.OK, 'Created new todo success')
    } catch (e: any) {
      return apiResponse(e.stat_code || status.BAD_REQUEST, e.stat_msg || e.message)
    }
  }

  async getAllTodos(req: Request): Promise<APIResponse> {
    try {
      const getAllTodos: Todos[] = await this.model.find({})

      return apiResponse(status.OK, 'Todos already ok', getAllTodos)
    } catch (e: any) {
      return apiResponse(e.stat_code || status.BAD_REQUEST, e.stat_msg || e.message)
    }
  }

  async getTodosById(params: DTOTodosId): Promise<APIResponse> {
    try {
      const getTodoById: Todos = await this.model.findOne({ id: params.id }, { order: { id: 'DESC' } })
      if (!getTodoById) throw apiResponse(status.BAD_REQUEST, `Todo with ID ${params.id} Not Found`)

      return apiResponse(status.OK, 'Todo already ok', getTodoById)
    } catch (e: any) {
      return apiResponse(e.stat_code || status.BAD_REQUEST, e.stat_msg || e.message)
    }
  }

  async deleteTodosById(params: DTOTodosId): Promise<APIResponse> {
    try {
      const getTodoById: Todos = await this.model.findOne({ id: params.id })
      if (!getTodoById) throw apiResponse(status.NOT_FOUND, `Todo with ID ${params.id} Not Found`)

      const deletedTodo: DeleteResult = await this.model.delete({ id: getTodoById.id })
      if (!deletedTodo) throw apiResponse(status.BAD_REQUEST, `Deleted todo for this id ${params.id} failed`)

      return apiResponse(status.OK, `Deleted todo for this id ${params.id} success`)
    } catch (e: any) {
      return apiResponse(e.stat_code || status.BAD_REQUEST, e.stat_msg || e.message)
    }
  }

  async updateTodosById(params: DTOTodosId, body: DTOTodos): Promise<APIResponse> {
    try {
      const getTodoById: Todos = await this.model.findOne({ id: params.id })
      if (!getTodoById) throw apiResponse(status.NOT_FOUND, `Todo with ID ${params.id} Not Found`)

      const updatedTodo: UpdateResult = await this.model.update({ id: getTodoById.id }, body)
      if (!updatedTodo) throw apiResponse(status.BAD_REQUEST, `Updated todo for this id ${params.id} failed`)

      return apiResponse(status.OK, `Updated todo for this id ${params.id} success`)
    } catch (e: any) {
      return apiResponse(e.stat_code || status.BAD_REQUEST, e.stat_msg || e.message)
    }
  }
}
