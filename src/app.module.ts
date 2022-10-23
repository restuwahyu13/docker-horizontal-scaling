import { Container, Injectable, Module, Router } from '@helpers/helper.di'
import { TodosModule } from '@modules/module.todos'

@Module([
  {
    token: 'TodosModule',
    useFactory: (): Router => {
      return Container.resolve(TodosModule).route.main()
    }
  }
])
@Injectable()
export class AppModule {}
