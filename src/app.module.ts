import { Container, Injectable, Module, Router } from '@helpers/helper.di'
import { TransformMiddleware } from '@middlewares/middleware.jwtTransform'
import { AuthMiddleware } from '@middlewares/middleware.auth'
import { ExtraTokenMiddleware } from '@middlewares/middleware.extraToken'
import { ValidatorMiddleware } from '@middlewares/middleware.validator'
import { TodosModule } from '@modules/module.todos'
import { UsersModule } from '@modules/module.users'

@Module([
  { token: 'TransformMiddleware', useClass: TransformMiddleware },
  { token: 'AuthMiddleware', useClass: AuthMiddleware },
  { token: 'ExtraTokenMiddleware', useClass: ExtraTokenMiddleware },
  { token: 'ValidatorMiddleware', useClass: ValidatorMiddleware },
  {
    token: 'TodosModule',
    useFactory: (): Router => {
      return Container.resolve(TodosModule).route.main()
    }
  },
  {
    token: 'UsersModule',
    useFactory: (): Router => {
      return Container.resolve(UsersModule).route.main()
    }
  }
])
@Injectable()
export class AppModule {}
