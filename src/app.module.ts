import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CvResolver } from './cv.resolver';
import { CvService } from './cv.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: true,
    introspection: true,
    playground: false,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  })],
  providers: [CvResolver, CvService, PrismaService],
})
export class AppModule {}
