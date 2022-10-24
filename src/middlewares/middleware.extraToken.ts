import { StatusCodes as status } from 'http-status-codes'
import { Request, Response, NextFunction, Handler } from 'express'
import { IncomingHttpHeaders, OutgoingMessage } from 'http'
import cryptojs from 'crypto-js'
import moment from 'moment'

import { Secrets } from '@entities/entitie.secrets'
import { Inject, Middleware, Repository } from '@helpers/helper.di'
import { apiResponse } from '@helpers/helper.apiResponse'
import { caesarDecrypt } from '@helpers/helper.caesarCipher'

@Middleware()
export class ExtraTokenMiddleware {
  constructor(@Inject('SecretsModel') private secrets: Repository<Secrets>) {}

  use(): Handler {
    let secrets: Repository<Secrets> = this.secrets

    return async function (req: Request, res: Response, next: NextFunction): Promise<NextFunction | OutgoingMessage> {
      try {
        let headers: IncomingHttpHeaders = req.headers
        if (!Object.keys(headers).includes('extra-token')) throw apiResponse(status.UNAUTHORIZED, 'Custome header extra-token required')

        const extraToken: string = headers['extra-token'] as string

        const getAccessToken: Secrets = await secrets.findOne({ resource_by: req['user']['id'], resource_type: 'login', extra_token: extraToken }, { order: { id: 'DESC' } })
        if (!getAccessToken) throw apiResponse(status.UNAUTHORIZED, 'Extra token not match')

        const decodedExtraToken: string = cryptojs.AES.decrypt(caesarDecrypt(extraToken, 20), process.env.AES_SECRET_KEY).toString(cryptojs.enc.Utf8)
        if (moment(decodedExtraToken).format() < moment(new Date()).format()) throw apiResponse(status.UNAUTHORIZED, 'Extra token expired')

        next()
      } catch (e: any) {
        return res.status(e.stat_code || status.UNAUTHORIZED).json(e)
      }
    }
  }
}
