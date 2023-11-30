import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from 'iam/hashing/hashing.service';
import { Repository } from 'typeorm';
import { User } from 'users/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'iam/config/jwt.config';
import { ActiveUserData } from 'iam/interfaces/active-user-data';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import {
  InvalidatedRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage';

@Injectable()
export class AuthenticationService {
  private readonly jwtConfig = {
    secret: this.jwtConfiguration.secret,
    audience: this.jwtConfiguration.audience,
    issuer: this.jwtConfiguration.issuer,
  };
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokensIdsStorage: RefreshTokenIdsStorage,
  ) {}
  async signUp(SignUpDto: SignUpDto) {
    try {
      const user = new User();
      user.email = SignUpDto.email;
      user.password = await this.hashingService.hash(SignUpDto.password);
      await this.userRepository.save(user);
    } catch (error) {
      const pgUniqueViolationErrorCode = '23505';
      if (error.code === pgUniqueViolationErrorCode) {
        throw new ConflictException('email already exists');
      }
      throw error;
    }
  }
  async signIn(signInDto: SignInDto, response: Response) {
    const user = await this.userRepository.findOneBy({
      email: signInDto.email,
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Password is incorrect');
    }
    const tokens = await this.generateTokens(user);

    this.setCookies(response, tokens);

    return tokens;
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          role: user.role,
        },
      ),
      this.signToken<Record<string, string>>(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        {
          refreshTokenId,
        },
      ),
    ]);
    await this.refreshTokensIdsStorage.insert(user.id, refreshTokenId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto, response: Response) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, this.jwtConfig);

      const user = await this.userRepository.findOneByOrFail({
        id: sub,
      });

      const isValid = await this.refreshTokensIdsStorage.validate(
        user.id,
        refreshTokenId,
      );

      if (isValid) {
        await this.refreshTokensIdsStorage.invalidate(user.id);
      } else {
        throw new Error('Refresh token is invalid');
      }

      const tokens = await this.generateTokens(user);

      this.setCookies(response, tokens);

      return tokens;
    } catch (error) {
      if (error instanceof InvalidatedRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException();
    }
  }

  private setCookies(response: Response, tokens: Record<string, string>) {
    // Set response cookies with refresh and access tokens
    Object.keys(tokens).forEach((key) => {
      response.cookie(key, tokens[key], {
        secure: true,
        httpOnly: true,
        sameSite: true,
      });
    });
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    const data = {
      sub: userId,
      ...payload,
    };
    const config = {
      ...this.jwtConfig,
      expiresIn,
    };

    return await this.jwtService.signAsync(data, config);
  }
}
