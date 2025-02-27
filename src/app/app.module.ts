import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  // RequestMethod,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerModule } from "nestjs-pino";

import { CorrelationIdMiddleware } from "@/app/config/correlation-id/correlation-id.middleware";
import { HealthModule } from "@/app/health/health.module";
import { LoggerMiddleware } from "@/app/middlewares/logger.middleware";
import { AuthModule } from "@/src/context/auth/auth.module";
// import { AuthMiddleware } from "@/src/context/auth/middlewares/auth.middleware";
import { ClientsModule } from "@/src/context/clients/clients.module";
import { ExercisesModule } from "@/src/context/exercises/exercises.module";
import { OrganizationsModule } from "@/src/context/organizations/organizations.module";
import { PlansModule } from "@/src/context/plans/plans.module";
import { ProductsModule } from "@/src/context/products/products.module";
import { RoutinesModule } from "@/src/context/routines/routines.module";
import { SchedulesModule } from "@/src/context/schedules/schedules.module";

import { AuthMiddleware } from "../context/auth/middlewares/auth.middleware";
import { AppConfigModule } from "../context/config/config.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: "pino-pretty",
          options: {
            messageKey: "message",
          },
        },
        messageKey: "message",
        customProps: (req: any) => {
          return {
            correlationId: req["X-Correlation-Id"],
          };
        },
        autoLogging: false,
        serializers: {
          req: () => {
            return;
          },
          res: () => {
            return;
          },
        },
      },
    }),
    HealthModule,
    ProductsModule,
    PlansModule,
    ClientsModule,
    ExercisesModule,
    OrganizationsModule,
    AppConfigModule,
    SchedulesModule,
    RoutinesModule,
    AppConfigModule,
    AuthModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>("MONGODB_URI");
        return {
          uri: mongoUri,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");

    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: "auth/login", method: RequestMethod.POST },
        { path: "auth/login", method: RequestMethod.OPTIONS },
        { path: "auth/register", method: RequestMethod.POST },
        //  { path: "auth/register", method: RequestMethod.OPTIONS },
        { path: "auth/refreshToken", method: RequestMethod.POST },
        //  { path: "auth/refreshToken", method: RequestMethod.OPTIONS },
        { path: "api", method: RequestMethod.GET },
        { path: "api/(.*)", method: RequestMethod.GET },
      )
      .forRoutes("*");

    consumer.apply(LoggerMiddleware).forRoutes("*");
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
