import { Module } from "@nestjs/common";

import { AUTH_REPOSITORY } from "@/src/context/auth/repositories/auth.repository";
import { MongoAuthRepository } from "@/src/context/auth/repositories/mongo-auth.repository";
import { ClientsModule } from "@/src/context/clients/clients.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController],

  providers: [
    AuthService,
    {
      provide: AUTH_REPOSITORY,
      useClass: MongoAuthRepository,
    },
  ],
  imports: [ClientsModule],
})
export class AuthModule {}
