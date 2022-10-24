import { encrypt } from 'jwt-transform'
import jwt from 'jsonwebtoken'
import cryptojs from 'crypto-js'
import moment from 'moment'

import { ExpressError } from '@helpers/helper.error'
import { convertTime } from '@helpers/helper.convertTime'
import { caesarEncrypt } from '@helpers/helper.caesarCipher'
import { expiredAt } from '@helpers/helper.expiredAt'

let secretKey: string = process.env.JWT_SECRET_KEY || ''
let typeTime: Record<string, any> = {
  days: 'd',
  minute: 'm',
  second: 's'
}

export interface IToken {
  accessToken: string
  refreshToken: string
  accessTokenExpired: string
  refreshTokenExpired: string
}

export interface ITokenMixed {
  accessToken: string
  refreshToken: string
  accessTokenExpired: string
  refreshTokenExpired: string
  status: string
}

interface Ioptions {
  expiredAt: number
  type: string
}

export class JWT {
  static signToken(data: Record<string, any>, options: Ioptions): IToken | Error {
    try {
      const aesTokenPayload: string = moment(expiredAt(1, 'days')).local(true).format()

      const accessToken: string = jwt.sign({ ...data }, secretKey, { expiresIn: `${options.expiredAt}${typeTime[options.type]}`, audience: 'node-app' })
      const refreshToken: string = jwt.sign({ ...data }, secretKey, { expiresIn: '30d', audience: 'node-app' })
      const aesToken: string = cryptojs.AES.encrypt(aesTokenPayload, process.env.AES_SECRET_KEY).toString()

      const token: IToken = {
        accessToken: String(encrypt(accessToken, 20)).concat(`#${caesarEncrypt(aesToken, 20)}`), // split accessToken in FE like this split('#') and pass token into custom headers extra token
        refreshToken: encrypt(refreshToken, 20) as string,
        accessTokenExpired: `${convertTime(options.expiredAt, 'days')} Days`,
        refreshTokenExpired: `${convertTime(30, 'days')} Days`
      }

      return token
    } catch (e: any) {
      return new ExpressError(e.message || 'Generate accessToken and refreshToken failed')
    }
  }

  static verifyToken(accessToken: string): jwt.JwtPayload | string | Error {
    try {
      const decodedToken: string | jwt.JwtPayload = jwt.verify(accessToken, secretKey, { audience: 'node-app' })
      return decodedToken
    } catch (e: any) {
      return new ExpressError(e.message || 'Verified accessToken expired or invalid')
    }
  }
}
