import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { PolicyHandlerStorage } from './authentication/policies/policy-handlers.storage';
import { FrameworkContributorPolicyHandler } from './authentication/policies/framework-contributor.policy';
import { PoliciesGuard } from './authentication/guards/policies.guard';

// import { PermissionGuard } from './authorization/guards/permissions.guard';
// import { RolesGuard } from './authorization/guards/roles.guard';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },

    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
    // Uncomment this line to enable the PermissionGuard
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionGuard,
    // },
    // Uncomment this line to enable the RolesGuard
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    AccessTokenGuard,
    AuthenticationService,
    RefreshTokenIdsStorage,
    PolicyHandlerStorage,
    FrameworkContributorPolicyHandler,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
